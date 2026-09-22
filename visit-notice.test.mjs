import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('./visit-notice.js', import.meta.url), 'utf8');
const endpoint = 'https://portfolio-visit-notice.example.workers.dev/visit';

function loadPage(storage, calls, { route = '#/', fail = false, visible = 'visible', bot = false } = {}) {
  const listeners = new Map();
  const context = {
    window: { PORTFOLIO_VISIT_ENDPOINT: endpoint, location: { hash: route } },
    navigator: { webdriver: bot },
    document: {
      visibilityState: visible,
      addEventListener: (event, callback) => listeners.set(event, callback),
    },
    sessionStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
    fetch: (url, options) => {
      calls.push({ url, options });
      return fail ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: true });
    },
  };
  runInNewContext(source, context);
  return { context, listeners };
}

test('direct project entry sends once for a browser session', () => {
  const storage = new Map();
  const calls = [];
  loadPage(storage, calls, { route: '#/projects/bilbao' });
  loadPage(storage, calls, { route: '#/projects/cedaceros' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, endpoint);
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.body, undefined);
});

test('a new session can send again', () => {
  const calls = [];
  loadPage(new Map(), calls);
  loadPage(new Map(), calls);
  assert.equal(calls.length, 2);
});

test('failed mail service and obvious automation do not affect the page', async () => {
  const calls = [];
  const storage = new Map();
  loadPage(storage, calls, { fail: true });
  await Promise.resolve();
  loadPage(storage, calls);
  loadPage(new Map(), calls, { bot: true });
  assert.equal(calls.length, 1);
});

test('a background page waits until it becomes visible', () => {
  const calls = [];
  const { context, listeners } = loadPage(new Map(), calls, { visible: 'hidden' });
  assert.equal(calls.length, 0);
  context.document.visibilityState = 'visible';
  listeners.get('visibilitychange')();
  assert.equal(calls.length, 1);
});
