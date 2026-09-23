(() => {
  const endpoint = window.PORTFOLIO_VISIT_ENDPOINT;
  const siteKey = window.PORTFOLIO_TURNSTILE_SITE_KEY;
  if (!endpoint || !siteKey || navigator.webdriver) return;

  const minimumVisibleMs = 7000;
  const storageKey = 'portfolio-human-visit-notice-sent';
  const knownPages = new Set([
    '/', '/projects', '/projects/bilbao', '/projects/marbella',
    '/projects/cedaceros-9', '/projects/castellana-a-b', '/about', '/contact', '/cv',
  ]);
  const initialPath = window.location.hash.slice(1).replace(/\/+$/, '') || '/';
  const page = knownPages.has(initialPath) ? initialPath : '/other';
  let interacted = false;
  let visibleLongEnough = false;
  let verificationPending = false;
  let visibilityTimer;

  function alreadySent() {
    try {
      return Boolean(sessionStorage.getItem(storageKey));
    } catch {
      return false;
    }
  }

  function markSent() {
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // Browsers that disable session storage can still send one request per load.
    }
  }

  async function sendVerifiedVisit(token) {
    try {
      const body = new URLSearchParams({ page, token });
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
      });
      if (response.ok) markSent();
    } catch {
      // An unavailable notification service must not affect the portfolio.
    }
  }

  function runTurnstile() {
    if (!window.turnstile || alreadySent()) {
      verificationPending = false;
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    Object.assign(container.style, {
      position: 'fixed', right: '12px', bottom: '12px', zIndex: '2147483647',
    });
    document.body.append(container);

    const stopVerification = () => {
      container.remove();
      verificationPending = false;
    };
    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      action: 'portfolio_visit',
      appearance: 'interaction-only',
      execution: 'execute',
      callback: (token) => {
        container.remove();
        void sendVerifiedVisit(token).finally(() => { verificationPending = false; });
      },
      'error-callback': stopVerification,
      'timeout-callback': stopVerification,
    });
    window.turnstile.execute(widgetId);
  }

  function loadTurnstile() {
    if (window.turnstile) {
      runTurnstile();
      return;
    }

    const existing = document.querySelector('script[data-portfolio-turnstile]');
    if (existing) {
      existing.addEventListener('load', runTurnstile, { once: true });
      existing.addEventListener('error', () => { verificationPending = false; }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.portfolioTurnstile = '';
    script.addEventListener('load', runTurnstile, { once: true });
    script.addEventListener('error', () => { verificationPending = false; }, { once: true });
    document.head.append(script);
  }

  function attemptVerification() {
    if (!interacted || !visibleLongEnough || verificationPending || alreadySent()) return;
    verificationPending = true;
    loadTurnstile();
  }

  function noteInteraction(event) {
    if (event.isTrusted === false) return;
    interacted = true;
    attemptVerification();
  }

  function updateVisibilityTimer() {
    clearTimeout(visibilityTimer);
    visibleLongEnough = false;
    if (document.visibilityState !== 'visible') return;
    visibilityTimer = setTimeout(() => {
      visibleLongEnough = true;
      attemptVerification();
    }, minimumVisibleMs);
  }

  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((eventName) => {
    document.addEventListener(eventName, noteInteraction, { passive: true });
  });
  document.addEventListener('visibilitychange', updateVisibilityTimer);
  updateVisibilityTimer();
})();
