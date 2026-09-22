(() => {
  const endpoint = window.PORTFOLIO_VISIT_ENDPOINT;
  if (!endpoint || navigator.webdriver) return;

  const storageKey = 'portfolio-visit-notice-sent';
  const knownPages = new Set([
    '/', '/projects', '/projects/bilbao', '/projects/marbella',
    '/projects/cedaceros-9', '/projects/castellana-a-b', '/about', '/contact', '/cv',
  ]);

  function sendOnce() {
    if (document.visibilityState !== 'visible') return;

    try {
      if (sessionStorage.getItem(storageKey)) return;
      // Mark first to avoid duplicate requests from a reload or another route.
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // Browsers that disable session storage can still send one request per load.
    }

    try {
      const path = window.location.hash.slice(1).replace(/\/+$/, '') || '/';
      const url = new URL(endpoint);
      url.searchParams.set('page', knownPages.has(path) ? path : '/other');
      fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
      }).catch(() => {
        // An unavailable notification service must not affect the portfolio.
      });
    } catch {
      // A malformed endpoint must not affect the portfolio either.
    }
  }

  if (document.visibilityState === 'visible') {
    sendOnce();
  } else {
    document.addEventListener('visibilitychange', sendOnce, { once: true });
  }
})();
