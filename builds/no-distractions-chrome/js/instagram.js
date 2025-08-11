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
    blockHorizontalScroll(); // Update horizontal scroll blocking on URL change
  }
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
      const style = document.createElement('style');
      style.id = 'no-distractions-horizontal-scroll-block';
      style.textContent = `
        html, body, main[role="main"], #react-root, section, div[role="presentation"], div[style*="display: flex"] {
          overflow-x: hidden !important;
          max-width: 100vw !important;
          position: relative !important;
          left: 0 !important;
        }
        body {
          position: fixed !important;
          width: 100vw !important;
        }
      `;
      document.head.appendChild(style);
      console.log('Horizontal scroll blocking enabled');
    }

    // Forcibly reset scrollLeft on all scrollable elements
    function resetScrollLeft() {
      [document.documentElement, document.body].forEach(el => {
        if (el.scrollLeft !== 0) el.scrollLeft = 0;
      });
      // Try main containers
      const main = document.querySelector('main[role="main"]');
      if (main && main.scrollLeft !== 0) main.scrollLeft = 0;
      // All divs with overflow-x
      document.querySelectorAll('div').forEach(div => {
        const style = window.getComputedStyle(div);
        if (style.overflowX !== 'visible' && div.scrollLeft !== 0) div.scrollLeft = 0;
      });
    }
    if (!window.horizontalScrollResetInterval) {
      window.horizontalScrollResetInterval = setInterval(resetScrollLeft, 100);
    }

    // Block horizontal scroll events
    function blockHorizontalScrollEvent(e) {
      if (e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        return false;
      }
    }
    function blockHorizontalTouch(e) {
      if (e.touches && e.touches.length === 1) {
        const touch = e.touches[0];
        if (!window.lastTouchX) window.lastTouchX = touch.clientX;
        const deltaX = touch.clientX - window.lastTouchX;
        if (Math.abs(deltaX) > 10) {
          e.preventDefault();
          return false;
        }
        window.lastTouchX = touch.clientX;
      }
    }
    if (!window.horizontalScrollBlocked) {
      window.addEventListener('wheel', blockHorizontalScrollEvent, { passive: false });
      window.addEventListener('touchmove', blockHorizontalTouch, { passive: false });
      window.horizontalScrollBlocked = true;
    }

    // Resize observer to re-apply CSS if needed
    if (!window.horizontalScrollResizeObserver) {
      window.horizontalScrollResizeObserver = new ResizeObserver(() => {
        resetScrollLeft();
      });
      window.horizontalScrollResizeObserver.observe(document.body);
    }
  } else {
    // Remove horizontal scroll blocking when not on main page
    const style = document.getElementById('no-distractions-horizontal-scroll-block');
    if (style) {
      style.remove();
    }
    if (window.horizontalScrollResetInterval) {
      clearInterval(window.horizontalScrollResetInterval);
      window.horizontalScrollResetInterval = null;
    }
    if (window.horizontalScrollResizeObserver) {
      window.horizontalScrollResizeObserver.disconnect();
      window.horizontalScrollResizeObserver = null;
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

