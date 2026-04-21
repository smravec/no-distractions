import "../assets/css/instagram.css";

export default defineContentScript({
  matches: ["https://www.instagram.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    const extensionApi =
      typeof browser !== "undefined"
        ? browser
        : typeof chrome !== "undefined"
          ? chrome
          : null;

    if (!extensionApi?.storage?.sync) {
      return;
    }

    extensionApi.storage.sync.get(["ig", "general_switch"], (result) => {
      const GENERAL_SWITCH =
        result.general_switch !== undefined ? result.general_switch : true;
      const INSTAGRAM_TOGGLE = result.ig !== undefined ? result.ig : true;
      const ENABLE_IG = GENERAL_SWITCH && INSTAGRAM_TOGGLE;

      const html = document.documentElement;
      if (!ENABLE_IG) {
        html.classList.remove("no-distractions-css");
        html.classList.remove(
          "ig-main-feed",
          "ig-explore-page",
          "ig-explore-mobile",
          "ig-reels-page",
        );
        return;
      }
      function blockHorizontalScroll() {
        if (!ENABLE_IG) {
          // If blocking is disabled, remove any existing scroll blocking
          const style = document.getElementById(
            "no-distractions-horizontal-scroll-block",
          );
          if (style) {
            style.remove();
          }
          window.horizontalScrollBlocked = false;
          window.lastTouchX = null;
          return;
        }

        const currentPath = window.location.pathname;
        const currentUrl = window.location.href;
        // Only block on main page with following variant
        if (
          (currentPath === "/" || currentPath === "") &&
          currentUrl.includes("variant=following")
        ) {
          // Stronger CSS for all relevant containers
          if (
            !document.getElementById("no-distractions-horizontal-scroll-block")
          ) {
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
            "no-distractions-horizontal-scroll-block",
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

      html.classList.add("no-distractions-css");

      // Hide all <a> elements with href containing '/reels/'
      function hideNavLinks() {
        const body = document.body;
        if (!body) {
          return;
        }

        ["a[href*='/reels/']"].forEach((selector) => {
          const elements = body.querySelectorAll(selector);
          elements.forEach((el) =>
            el.style.setProperty("display", "none", "important"),
          );
        });
      }

      function updateHomeLinks() {
        const body = document.body;
        if (!body) {
          return;
        }

        const homeLinks = body.querySelectorAll('a[href="/"]');
        homeLinks.forEach((el) => {
          el.setAttribute("href", "/?variant=following");
        });
      }

      function removeForYouTabContainer() {
        const body = document.body;
        if (!body) {
          return;
        }

        const spans = body.querySelectorAll("span[dir='auto']");
        spans.forEach((span) => {
          const text = span.textContent?.trim().toLowerCase();
          if (text !== "for you") {
            return;
          }

          const tab = span.closest("div[role='tab']");
          if (!tab) {
            return;
          }

          // Remove the exact tab wrapper structure shown in Instagram's feed tabs.
          const tabContainer = tab.parentElement;
          if (tabContainer) {
            tabContainer.remove();
            return;
          }

          tab.remove();
        });
      }

      function updateExplorePageHiding() {
        const currentPath = window.location.pathname;
        const isExplorePage = currentPath === "/explore" || currentPath === "/explore/";
        
        if (isExplorePage) {
          if (!document.getElementById("no-distractions-explore-hide")) {
            const injectStyle = () => {
              if (!document.head) {
                setTimeout(injectStyle, 10);
                return;
              }
              const style = document.createElement("style");
              style.id = "no-distractions-explore-hide";
              style.textContent = `
                main[role="main"] > div > *:not(:first-child) {
                  display: none !important;
                }
              `;
              document.head.appendChild(style);
            };
            injectStyle();
          }
        } else {
          const style = document.getElementById("no-distractions-explore-hide");
          if (style) {
            style.remove();
          }
        }
      }

      function redirectMainPageToFollowing() {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;
        const urlObj = new URL(currentUrl);
        const variant = urlObj.searchParams.get("variant");
        
        // If on main page and not already on following variant, redirect
        if ((currentPath === "/" || currentPath === "") && variant !== "following") {
          window.location.replace("https://www.instagram.com/?variant=following");
        }
      }

      function onMutation() {
        hideNavLinks();
        removeForYouTabContainer();
        updateExplorePageHiding();
        updateHomeLinks();
      }

      onMutation();
      // Also observe DOM changes to hide new links
      const observer = new MutationObserver(onMutation);
      observer.observe(document, { childList: true, subtree: true });

      // Monitor URL changes for explore page
      let lastUrl = window.location.href;
      function checkUrlChange() {
        if (!ENABLE_IG) return;
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          updateExplorePageHiding();
          redirectMainPageToFollowing();
        }
      }

      // Run redirect check immediately
      redirectMainPageToFollowing();

      window.addEventListener("popstate", checkUrlChange);
      setInterval(checkUrlChange, 500);
    });
  },
});
