if (typeof browser === "undefined") {
  var browser = chrome;
}

// Redirect to following feed if on main Instagram page
let enforceFollowingRAF = null;
function enforceFollowingRedirectLoop() {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  const urlObj = new URL(currentUrl);
  const variant = urlObj.searchParams.get("variant");
  // Redirect /explore or /explore/ to /explore/search on mobile, to /?variant=following on desktop
  if (
    (currentPath === "/explore" || currentPath === "/explore/") &&
    !currentUrl.includes("/explore/search")
  ) {
    if (window.innerWidth > 500) {
      window.location.replace("https://www.instagram.com/?variant=following");
      return;
    } else {
      window.location.replace("https://www.instagram.com/explore/search");
      return;
    }
  }
  // Redirect to following feed if on main page
  if ((currentPath === "/" || currentPath === "") && variant !== "following") {
    window.location.replace("https://www.instagram.com/?variant=following");
    return;
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
    const lastNonReels =
      sessionStorage.getItem("noDistractionsLastNonReelsUrl") ||
      "https://www.instagram.com/?variant=following";
    if (currentUrl !== lastNonReels) {
      console.log("Redirecting from reels to last non-reels:", lastNonReels);
      window.location.replace(lastNonReels);
      return;
    }
  } else {
    // Store last non-reels URL if not on reels
    sessionStorage.setItem("noDistractionsLastNonReelsUrl", currentUrl);
  }
  if (currentUrl !== lastUrl) {
    console.log("URL changed from:", lastUrl, "to:", currentUrl);
    lastUrl = currentUrl;
    redirectToFollowingFeed();
    blockHorizontalScroll(); // Update horizontal scroll blocking on URL change
  }
}

// Patch history.pushState and replaceState to catch SPA navigation
if (!window._noDistractionsHistoryPatched) {
  ["pushState", "replaceState"].forEach((fn) => {
    const orig = history[fn];
    history[fn] = function () {
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
  if (
    (currentPath === "/" || currentPath === "") &&
    currentUrl.includes("variant=following")
  ) {
    // Stronger CSS for all relevant containers
    if (!document.getElementById("no-distractions-horizontal-scroll-block")) {
      const injectStyle = () => {
        if (!document.head) {
          setTimeout(injectStyle, 10);
          return;
        }
        const style = document.createElement("style");
        style.id = "no-distractions-horizontal-scroll-block";
        style.textContent = `
          html, body, main[role="main"], #react-root {
            overflow-x: hidden !important;
            max-width: 100vw !important;
            position: relative !important;
            left: 0 !important;
          }
        `;
        document.head.appendChild(style);
        console.log("Horizontal scroll blocking enabled");
      };
      injectStyle();
    }

    // Only block horizontal scroll events at the main containers
    function isRootContainer(el) {
      if (!el) return false;
      return (
        el === document.documentElement ||
        el === document.body ||
        (el.matches &&
          (el.matches('main[role="main"]') || el.matches("#react-root")))
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
      window.addEventListener("wheel", blockHorizontalScrollEvent, {
        passive: false,
      });
      window.addEventListener("touchmove", blockHorizontalTouch, {
        passive: false,
      });
      window.horizontalScrollBlocked = true;
    }
  } else {
    // Remove horizontal scroll blocking when not on main page
    const style = document.getElementById(
      "no-distractions-horizontal-scroll-block"
    );
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
  const GENERAL_SWITCH =
    result.general_switch !== undefined ? result.general_switch : true;
  const INSTAGRAM_TOGGLE = result.ig !== undefined ? result.ig : true;
  const ENABLE_IG = GENERAL_SWITCH && INSTAGRAM_TOGGLE;

  // console.log("GENERAL_SWITCH", GENERAL_SWITCH);
  // console.log("INSTAGRAM_TOGGLE", INSTAGRAM_TOGGLE);
  // console.log("ENABLE_IG", ENABLE_IG);

  const html = document.documentElement;
  if (!ENABLE_IG) {
    html.classList.remove("no-distractions-css");
    html.classList.remove(
      "ig-main-feed",
      "ig-explore-page",
      "ig-explore-mobile",
      "ig-reels-page"
    );
    console.log("Instagram blocking is disabled by toggle or general switch.");
    return;
  }

  // Hide all <a> elements with href containing '/explore/' and '/reels/'
  function hideNavLinks() {
    ["a[href*='/explore/']", "a[href*='/reels/']"].forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => (el.style.display = "none"));
    });
  }
  hideNavLinks();
  // Also observe DOM changes to hide new links
  const observer = new MutationObserver(hideNavLinks);
  observer.observe(document.body, { childList: true, subtree: true });

  // No need to set any page class or observe DOM changes, as all relevant paths are redirected.
  // Only keep popstate and interval listeners for robust redirect and scroll blocking.
  window.addEventListener("popstate", redirectToFollowingFeed);
  setInterval(checkUrlChange, 1000);
});
