import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('./visit-notice.js', import.meta.url), 'utf8');
const endpoint = 'https://portfolio-visit-notice.example.workers.dev/visit';

function loadPage(storage = new Map(), { route = '#/', visible = 'visible', bot = false } = {}) {
  const listeners = new Map();
  const timers = [];
  const calls = [];
  const addListener = (event, callback) => {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event).push(callback);
  };
  const element = () => ({
    style: {}, dataset: {}, setAttribute() {}, addEventListener: addListener, remove() {},
  });
  const context = {
    URL, URLSearchParams,
    window: {
      PORTFOLIO_VISIT_ENDPOINT: endpoint,
      PORTFOLIO_TURNSTILE_SITE_KEY: 'test-site-key',
      location: { hash: route },
      turnstile: {
        render(_container, options) { context.turnstileOptions = options; return 'widget-id'; },
        execute(widgetId) {
          assert.equal(widgetId, 'widget-id');
          context.turnstileOptions.callback('verified-test-token');
        },
      },
    },
    navigator: { webdriver: bot },
    document: {
      visibilityState: visible,
      addEventListener: addListener,
      createElement: element,
      querySelector: () => null,
      body: { append() {} },
      head: { append() {} },
    },
    sessionStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
    setTimeout(callback) { timers.push(callback); return timers.length; },
    clearTimeout() {},
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: true }; },
  };
  runInNewContext(source, context);
  return {
    context, calls, storage,
    fire(event, values = {}) { for (const callback of listeners.get(event) || []) callback(values); },
    elapseVisibleTime() { timers.at(-1)?.(); },
  };
}

test('requires visible time and a trusted interaction before sending', async () => {
  const page = loadPage(new Map(), { route: '#/projects/bilbao' });
  assert.equal(page.calls.length, 0);
  page.elapseVisibleTime();
  assert.equal(page.calls.length, 0);
  page.fire('pointerdown', { isTrusted: true });
  await Promise.resolve();
  assert.equal(page.calls.length, 1);
  assert.equal(page.calls[0].url, endpoint);
  assert.equal(page.calls[0].options.method, 'POST');
  assert.equal(page.calls[0].options.body.get('page'), '/projects/bilbao');
  assert.equal(page.calls[0].options.body.get('token'), 'verified-test-token');
});

test('an unknown route is reduced to a fixed generic page', async () => {
  const page = loadPage(new Map(), { route: '#/projects/unknown?company=secret' });
  page.fire('scroll', { isTrusted: true });
  page.elapseVisibleTime();
  await Promise.resolve();
  assert.equal(page.calls[0].options.body.get('page'), '/other');
});

test('one successful notice is allowed in each browser session', async () => {
  const storage = new Map();
  const first = loadPage(storage);
  first.fire('keydown', { isTrusted: true });
  first.elapseVisibleTime();
  await new Promise(setImmediate);
  const second = loadPage(storage);
  second.fire('keydown', { isTrusted: true });
  second.elapseVisibleTime();
  assert.equal(first.calls.length, 1);
  assert.equal(second.calls.length, 0);
});

test('rejects synthetic interaction and obvious automation', () => {
  const page = loadPage();
  page.elapseVisibleTime();
  page.fire('pointerdown', { isTrusted: false });
  const bot = loadPage(new Map(), { bot: true });
  assert.equal(page.calls.length, 0);
  assert.equal(bot.calls.length, 0);
  assert.equal(bot.context.turnstileOptions, undefined);
});

test('visible-time qualification resets while the page is hidden', async () => {
  const page = loadPage(new Map(), { visible: 'hidden' });
  page.fire('touchstart', { isTrusted: true });
  assert.equal(page.calls.length, 0);
  page.context.document.visibilityState = 'visible';
  page.fire('visibilitychange');
  page.elapseVisibleTime();
  await Promise.resolve();
  assert.equal(page.calls.length, 1);
});
