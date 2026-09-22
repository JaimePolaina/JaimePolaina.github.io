import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import worker from './worker.js';

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

const origin = 'https://jaimepolaina.github.io';
const request = (method = 'POST', requestOrigin = origin, body) => new Request(
  'https://portfolio-visit-notice.example.workers.dev/visit',
  { method, headers: { Origin: requestOrigin }, body },
);
const env = (success = true) => ({
  RESEND_API_KEY: 'test-only-secret',
  VISIT_RATE_LIMITER: { limit: async () => ({ success }) },
});

test('sends a fixed notice to the only allowed recipient', async () => {
  let outbound;
  globalThis.fetch = async (url, options) => {
    outbound = { url, options };
    return new Response('{}', { status: 200 });
  };
  const result = await worker.fetch(request(), env());
  assert.equal(result.status, 204);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(outbound.url, 'https://api.resend.com/emails');
  const mail = JSON.parse(outbound.options.body);
  assert.deepEqual(mail.to, ['jaime.pg.arq@gmail.com']);
  assert.equal(mail.subject, 'Portfolio abierto');
  assert.match(mail.text, /^Se ha registrado una nueva visita a tu portfolio\.\n\nFecha: \d{2}\/\d{2}\/\d{4}\nHora: \d{2}:\d{2} \(Europe\/Madrid\)$/);
  assert.equal(outbound.options.headers.Authorization, 'Bearer test-only-secret');
});

test('rejects other origins and methods without sending email', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{}'); };
  assert.equal((await worker.fetch(request('POST', 'https://evil.example'), env())).status, 403);
  assert.equal((await worker.fetch(request('GET'), env())).status, 405);
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/visit?recipient=other@example.com', { method: 'POST', headers: { Origin: origin } }), env())).status, 400);
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/other', { method: 'POST', headers: { Origin: origin } }), env())).status, 404);
  assert.equal((await worker.fetch(request('OPTIONS'), env())).status, 204);
  assert.equal(calls, 0);
});

test('rate limit and email failure do not produce false success', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{}', { status: 401 }); };
  assert.equal((await worker.fetch(request(), env(false))).status, 429);
  assert.equal(calls, 0);
  assert.equal((await worker.fetch(request(), env())).status, 502);
  assert.equal((await worker.fetch(request(), {})).status, 503);
  assert.equal(calls, 1);
});
