if (typeof browser === "undefined") {
  var browser = chrome;
}

// Redirect to following feed if on main Instagram page
function redirectToFollowingFeed() {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  
  // Check if we're on the main Instagram page (not inbox or other pages)
  // Also redirect if we're on the home variant back to following
  if ((currentPath === "/" || currentPath === "") && 
      (!currentUrl.includes("variant=following") || currentUrl.includes("variant=home"))) {
    console.log('Redirecting to following feed from:', currentUrl);
    window.location.href = "https://www.instagram.com/?variant=following";
    return;
  }
}

// Monitor URL changes more comprehensively
let lastUrl = window.location.href;
function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    console.log('URL changed from:', lastUrl, 'to:', currentUrl);
    lastUrl = currentUrl;
    redirectToFollowingFeed();
  }
}

// Run redirect check immediately
redirectToFollowingFeed();

browser.storage.sync.get(["ig", "general_switch"], (result) => {
  const GENERAL_SWITCH = result.general_switch !== undefined ? result.general_switch : true;
  const INSTAGRAM_TOGGLE = result.ig !== undefined ? result.ig : true;
  const ENABLE_IG = GENERAL_SWITCH && INSTAGRAM_TOGGLE;
  
  // console.log("GENERAL_SWITCH", GENERAL_SWITCH);
  // console.log("INSTAGRAM_TOGGLE", INSTAGRAM_TOGGLE);
  // console.log("ENABLE_IG", ENABLE_IG);

  
  const html = document.documentElement;
  if (!ENABLE_IG) {
    html.classList.remove('no-distractions-css');
    html.classList.remove('ig-main-feed', 'ig-explore-page', 'ig-explore-mobile', 'ig-reels-page');
    console.log('Instagram blocking is disabled by toggle or general switch.');
    return;
  }
  // html.classList.add('no-distractions-css'); // Temporarily disabled: CSS-based feed removal

  function setPageClass(path) {
    html.classList.remove('ig-main-feed', 'ig-explore-page', 'ig-explore-mobile', 'ig-reels-page');
    if (path === "/" || path === "") {
      //html.classList.add('ig-main-feed');
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
      // Check for both pathname and URL changes
      checkUrlChange();
      
      if (lastPathname !== window.location.pathname) {
        setPageClass(window.location.pathname);
        lastPathname = window.location.pathname;
        
        // Check if we need to redirect on navigation
        redirectToFollowingFeed();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  setTimeout(setupObserver, 500);
  window.addEventListener("load", setupObserver);
  window.addEventListener("popstate", setupObserver);

  // Also check for redirect on popstate events
  window.addEventListener("popstate", redirectToFollowingFeed);

  // Set up interval to catch URL changes that might be missed
  setInterval(checkUrlChange, 1000);

});

