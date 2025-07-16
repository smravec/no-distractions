if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.storage.sync.get(["ig"], (result) => {
  const ENABLE_IG = result.ig !== undefined ? result.ig : true;
  const html = document.documentElement;
  if (!ENABLE_IG) {
    html.classList.remove('no-distractions-css');
    html.classList.remove('ig-main-feed', 'ig-explore-page', 'ig-explore-mobile', 'ig-reels-page');
    console.log('Instagram blocking is disabled by toggle.');
    return;
  }
  html.classList.add('no-distractions-css');

  function setPageClass(path) {
    html.classList.remove('ig-main-feed', 'ig-explore-page', 'ig-explore-mobile', 'ig-reels-page');
    if (path === "/" || path === "") {
      html.classList.add('ig-main-feed');
    } else if ((path === "/explore/" || path === "/explore") && window.screen.width > 500) {
      html.classList.add('ig-explore-page');
    } else if ((path === "/explore/" || path === "/explore") && window.screen.width <= 500) {
      html.classList.add('ig-explore-mobile');
    } else if (path.includes("/reels/")) {
      html.classList.add('ig-reels-page');
    }
  }

  // Initial class set
  setPageClass(window.location.pathname);

  let lastPathname = window.location.pathname;
  let bodyObserver = null;

  function setupObserver() {
    const targetElement = document.querySelector('main[role="main"]');
    if (!targetElement) {
      setTimeout(setupObserver, 1000);
      return;
    }
    if (bodyObserver !== null) return;
    bodyObserver = new MutationObserver(() => {
      if (lastPathname !== window.location.pathname) {
        setPageClass(window.location.pathname);
        lastPathname = window.location.pathname;
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  setTimeout(setupObserver, 500);
  window.addEventListener("load", setupObserver);
  window.addEventListener("popstate", setupObserver);
});

