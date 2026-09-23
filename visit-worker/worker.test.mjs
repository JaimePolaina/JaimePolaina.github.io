import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import worker from './worker.js';

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

const origin = 'https://jaimepolaina.github.io';
const validBody = () => new URLSearchParams({ page: '/projects/bilbao', token: 'verified-test-token' });
const request = (method = 'POST', requestOrigin = origin, body = validBody(), url = 'https://portfolio-visit-notice.example.workers.dev/visit') => {
  const incoming = new Request(url, {
    method,
    headers: { Origin: requestOrigin, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: method === 'POST' ? body : undefined,
  });
  Object.defineProperty(incoming, 'cf', { value: { city: 'Madrid', country: 'ES' } });
  return incoming;
};
const env = (success = true) => ({
  RESEND_API_KEY: 'test-resend-secret',
  TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
  VISIT_RATE_LIMITER: { limit: async () => ({ success }) },
});

test('validates the visitor and sends the labelled notice', async () => {
  const outbound = [];
  globalThis.fetch = async (url, options) => {
    outbound.push({ url, options });
    if (url.includes('siteverify')) {
      return new Response(JSON.stringify({ success: true, hostname: 'jaimepolaina.github.io', action: 'portfolio_visit' }), { status: 200 });
    }
    return new Response('{}', { status: 200 });
  };
  const result = await worker.fetch(request(), env());
  assert.equal(result.status, 204);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(outbound[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(outbound[0].options.body.get('secret'), 'test-turnstile-secret');
  assert.equal(outbound[0].options.body.get('response'), 'verified-test-token');
  const mail = JSON.parse(outbound[1].options.body);
  assert.deepEqual(mail.to, ['jaime.pg.arq@gmail.com']);
  assert.equal(mail.subject, 'Visita humana probable al portfolio');
  assert.match(mail.text, /^Se ha registrado una visita humana probable a tu portfolio\./);
  assert.match(mail.text, /Página inicial: Bilbao/);
  assert.match(mail.text, /Ciudad y país aproximados: Madrid, ES/);
  assert.match(mail.text, /Validación: interacción, tiempo visible y comprobación de Cloudflare$/);
});

test('rejects failed, wrong-host and wrong-action verification', async () => {
  let mailCalls = 0;
  for (const result of [
    { success: false },
    { success: true, hostname: 'evil.example', action: 'portfolio_visit' },
    { success: true, hostname: 'jaimepolaina.github.io', action: 'other' },
  ]) {
    globalThis.fetch = async (url) => {
      if (url.includes('siteverify')) return new Response(JSON.stringify(result), { status: 200 });
      mailCalls++;
      return new Response('{}');
    };
    assert.equal((await worker.fetch(request(), env())).status, 403);
  }
  assert.equal(mailCalls, 0);
});

test('rejects other origins, methods and malformed bodies', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{}'); };
  assert.equal((await worker.fetch(request('POST', 'https://evil.example'), env())).status, 403);
  assert.equal((await worker.fetch(request('GET'), env())).status, 405);
  assert.equal((await worker.fetch(request('POST', origin, new URLSearchParams({ page: '/projects/unknown', token: 'verified-test-token' })), env())).status, 400);
  assert.equal((await worker.fetch(request('POST', origin, new URLSearchParams({ page: '/', token: 'short' })), env())).status, 400);
  assert.equal((await worker.fetch(request('POST', origin, validBody(), 'https://example.workers.dev/other'), env())).status, 404);
  assert.equal((await worker.fetch(request('OPTIONS'), env())).status, 204);
  assert.equal(calls, 0);
});

test('ignores calls from the cached page-load notifier', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{}'); };
  const oldClient = request('POST', origin, undefined, 'https://example.workers.dev/visit?page=%2F');
  assert.equal((await worker.fetch(oldClient, env())).status, 204);
  assert.equal(calls, 0);
});

test('rate limit and email failure do not produce false success', async () => {
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    if (url.includes('siteverify')) return new Response(JSON.stringify({ success: true, hostname: 'jaimepolaina.github.io', action: 'portfolio_visit' }), { status: 200 });
    return new Response('{}', { status: 401 });
  };
  assert.equal((await worker.fetch(request(), env(false))).status, 429);
  assert.equal(calls, 0);
  assert.equal((await worker.fetch(request(), env())).status, 502);
  assert.equal((await worker.fetch(request(), {})).status, 503);
  assert.equal(calls, 2);
});
