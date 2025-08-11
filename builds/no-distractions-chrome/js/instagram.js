if (typeof browser === "undefined") {
  var browser = chrome;
}

// Redirect to following feed if on main Instagram page
let enforceFollowingRAF = null;
function enforceFollowingRedirectLoop() {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  const urlObj = new URL(currentUrl);
  const variant = urlObj.searchParams.get('variant');
  if ((currentPath === "/" || currentPath === "") && variant !== "following") {
    if (variant !== "following") {
      // Use replace to avoid polluting history
      window.location.replace("https://www.instagram.com/?variant=following");
      return;
    }
  }
  enforceFollowingRAF = requestAnimationFrame(enforceFollowingRedirectLoop);
}

function redirectToFollowingFeed() {
  if (enforceFollowingRAF) {
    cancelAnimationFrame(enforceFollowingRAF);
    enforceFollowingRAF = null;
  }
  enforceFollowingRedirectLoop();
}

// Monitor URL changes more comprehensively, including SPA navigation
let lastUrl = window.location.href;
function checkUrlChange() {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  // If on a /reels/ page, redirect to last non-reels page
  if (/^\/reels\//.test(currentPath)) {
    const lastNonReels = sessionStorage.getItem('noDistractionsLastNonReelsUrl') || 'https://www.instagram.com/?variant=following';
    if (currentUrl !== lastNonReels) {
      console.log('Redirecting from reels to last non-reels:', lastNonReels);
      window.location.replace(lastNonReels);
      return;
    }
  } else {
    // Store last non-reels URL if not on reels
    sessionStorage.setItem('noDistractionsLastNonReelsUrl', currentUrl);
  }
  if (currentUrl !== lastUrl) {
    console.log('URL changed from:', lastUrl, 'to:', currentUrl);
    lastUrl = currentUrl;
    redirectToFollowingFeed();
    blockHorizontalScroll(); // Update horizontal scroll blocking on URL change
  }
}

// Patch history.pushState and replaceState to catch SPA navigation
if (!window._noDistractionsHistoryPatched) {
  ["pushState", "replaceState"].forEach(fn => {
    const orig = history[fn];
    history[fn] = function() {
      const ret = orig.apply(this, arguments);
      setTimeout(checkUrlChange, 0);
      return ret;
    };
  });
  window._noDistractionsHistoryPatched = true;
}

// Run redirect check immediately
redirectToFollowingFeed();

// Block horizontal scrolling on main Instagram page
function blockHorizontalScroll() {
  const currentPath = window.location.pathname;
  const currentUrl = window.location.href;
  // Only block on main page with following variant
  if ((currentPath === "/" || currentPath === "") && currentUrl.includes("variant=following")) {
    // Stronger CSS for all relevant containers
    if (!document.getElementById('no-distractions-horizontal-scroll-block')) {
      const injectStyle = () => {
        if (!document.head) {
          setTimeout(injectStyle, 10);
          return;
        }
        const style = document.createElement('style');
        style.id = 'no-distractions-horizontal-scroll-block';
        style.textContent = `
          html, body, main[role="main"], #react-root {
            overflow-x: hidden !important;
            max-width: 100vw !important;
            position: relative !important;
            left: 0 !important;
          }
        `;
        document.head.appendChild(style);
        console.log('Horizontal scroll blocking enabled');
      };
      injectStyle();
    }

    // Only block horizontal scroll events at the main containers
    function isRootContainer(el) {
      if (!el) return false;
      return (
        el === document.documentElement ||
        el === document.body ||
        (el.matches && (el.matches('main[role="main"]') || el.matches('#react-root')))
      );
    }
    function blockHorizontalScrollEvent(e) {
      if (e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (isRootContainer(e.target)) {
          e.preventDefault();
          return false;
        }
      }
    }
    function blockHorizontalTouch(e) {
      if (e.touches && e.touches.length === 1) {
        const touch = e.touches[0];
        if (!window.lastTouchX) window.lastTouchX = touch.clientX;
        const deltaX = touch.clientX - window.lastTouchX;
        if (Math.abs(deltaX) > 10) {
          if (isRootContainer(e.target)) {
            e.preventDefault();
            return false;
          }
        }
        window.lastTouchX = touch.clientX;
      }
    }
    if (!window.horizontalScrollBlocked) {
      window.addEventListener('wheel', blockHorizontalScrollEvent, { passive: false });
      window.addEventListener('touchmove', blockHorizontalTouch, { passive: false });
      window.horizontalScrollBlocked = true;
    }
  } else {
    // Remove horizontal scroll blocking when not on main page
    const style = document.getElementById('no-distractions-horizontal-scroll-block');
    if (style) {
      style.remove();
    }
    window.horizontalScrollBlocked = false;
    window.lastTouchX = null;
  }
}

// Run horizontal scroll blocking immediately
blockHorizontalScroll();

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
        blockHorizontalScroll(); // Update horizontal scroll blocking on navigation
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

