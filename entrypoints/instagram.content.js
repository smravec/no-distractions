import "../assets/css/instagram.css";

export default defineContentScript({
  matches: ["https://www.instagram.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    // Hard-load fast path: bounce bare / to the following variant before
    // Instagram boots. storage.sync is async, so this trusts last session's
    // cached toggle state; the storage callback below refreshes the cache
    // and the async redirect stays the source of truth.
    try {
      if (
        localStorage.getItem("nd-ig-enabled") === "1" &&
        (window.location.pathname === "/" ||
          window.location.pathname === "") &&
        new URL(window.location.href).searchParams.get("variant") !==
          "following"
      ) {
        window.location.replace(
          "https://www.instagram.com/?variant=following",
        );
      }
    } catch (e) {
      // localStorage may be unavailable; the async redirect still runs.
    }

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
        // Disarm the MAIN-world history rewriter and the hard-load fast path.
        html.removeAttribute("data-nd-ig");
        try {
          localStorage.setItem("nd-ig-enabled", "0");
        } catch (e) {
          // Ignore: without the cache the fast path simply stays off.
        }
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
      // Arm the MAIN-world history rewriter and the hard-load fast path.
      html.setAttribute("data-nd-ig", "1");
      try {
        localStorage.setItem("nd-ig-enabled", "1");
      } catch (e) {
        // Ignore: without the cache the fast path simply stays off.
      }

      // Instagram A/B-tests the Search nav entry: depending on the variant its
      // href flips between /explore/search/ and /explore/, and sometimes it is
      // no link at all (panel toggle). The Search entry must never be hidden —
      // only the Explore grid links.
      function isSearchNavLink(el) {
        const href = el.getAttribute("href") || "";
        if (href.includes("/explore/search")) {
          return true;
        }
        return !!el.querySelector("svg[aria-label*='search' i]");
      }

      // On the explore surface, typed search results — hashtag rows
      // (/explore/tags/…), place rows (/explore/locations/…) and keyword rows
      // (/explore/search/keyword/…) — are rendered inside main[role='main'].
      // Those are the user's own results, not nav entries, so they must stay.
      // Everywhere else (feed, profiles, posts) explore links keep being
      // hidden, as do sidebar/nav explore links outside main.
      function isExploreSearchResult(el) {
        if (!window.location.pathname.startsWith("/explore")) {
          return false;
        }
        return !!el.closest("main[role='main']");
      }

      // Hide all <a> elements with href containing '/reels/'
      function hideNavLinks() {
        const body = document.body;
        if (!body) {
          return;
        }

        body.querySelectorAll("a[href*='/reels/']").forEach((el) => {
          // Feed video posts are reels: their media links live inside an
          // <article> and must stay visible, or the post renders empty.
          if (el.closest("article")) {
            // Restore it if a previous pass hid it before this scoping existed.
            if (el.style.getPropertyValue("display") === "none") {
              el.style.removeProperty("display");
            }
            return;
          }
          el.style.setProperty("display", "none", "important");
        });

        body.querySelectorAll("a[href*='/explore/']").forEach((el) => {
          if (isSearchNavLink(el) || isExploreSearchResult(el)) {
            // Restore it if a previous pass hid it before the variant flipped.
            if (el.style.getPropertyValue("display") === "none") {
              el.style.removeProperty("display");
            }
            return;
          }
          el.style.setProperty("display", "none", "important");
        });
      }

      function updateHomeLinks() {
        const body = document.body;
        if (!body) {
          return;
        }

        const homeLinks = body.querySelectorAll(
          'a[href="/"], a[href="https://www.instagram.com/"], a[href="https://www.instagram.com"]',
        );
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

      // The explore/search surface: both /explore and /explore/search render
      // the same page (search input + suggestion grid). Exact matches only —
      // keyword-result pages like /explore/search/keyword/?q=… show the
      // user's actual results as a tile grid and must stay untouched.
      function isExploreSurface() {
        const p = window.location.pathname;
        return (
          p === "/explore" ||
          p === "/explore/" ||
          p === "/explore/search" ||
          p === "/explore/search/"
        );
      }

      // A grid wrapper holds ONLY post/reel tile links: at least one anchor,
      // every anchor a tile, and no search input anywhere in its subtree.
      function isGridWrapper(el) {
        if (el.querySelector("input")) {
          return false;
        }
        // The element itself counts as part of its own subtree: a bare tile
        // anchor picked as the hide target must satisfy the invariant too.
        const anchors = Array.from(el.querySelectorAll("a[href]"));
        if (el.matches("a[href]")) {
          anchors.unshift(el);
        }
        if (anchors.length === 0) {
          return false;
        }
        for (const a of anchors) {
          const href = a.getAttribute("href") || "";
          if (
            !href.startsWith("/p/") &&
            !href.startsWith("/reel/") &&
            !href.startsWith("/reels/")
          ) {
            return false;
          }
        }
        return true;
      }

      // Hide the suggestion grid on the explore/search surface. The grid's
      // classes are obfuscated and volatile, so tiles are found by href and
      // their wrapper derived structurally. Hidden wrappers are marked and
      // un-hidden again if React reuses the node for something else.
      function hideExploreGrid() {
        const main = document.querySelector("main[role='main']");
        if (!main) {
          return;
        }

        // Self-heal first: un-hide anything that no longer qualifies.
        main.querySelectorAll("[data-nd-grid-hidden]").forEach((el) => {
          if (!isExploreSurface() || !isGridWrapper(el)) {
            // Only clear the inline display we set — Instagram may have put
            // its own value there in the meantime.
            if (el.style.getPropertyValue("display") === "none") {
              el.style.removeProperty("display");
            }
            el.removeAttribute("data-nd-grid-hidden");
          }
        });

        if (!isExploreSurface()) {
          return;
        }

        const tiles = main.querySelectorAll(
          "a[href^='/p/'], a[href^='/reel/'], a[href^='/reels/']",
        );
        tiles.forEach((tile) => {
          if (tile.closest("[data-nd-grid-hidden]")) {
            return;
          }
          let target = tile;
          let node = tile.parentElement;
          while (node && node !== main && isGridWrapper(node)) {
            target = node;
            node = node.parentElement;
          }
          target.style.setProperty("display", "none", "important");
          target.setAttribute("data-nd-grid-hidden", "1");
        });
      }

      // The "Not personalised" header on the search surface is a text-only
      // block next to the search input's branch. Detection is structural
      // (no anchors, no input, non-empty text, beside a content sibling),
      // never by text, so it holds in every locale.
      function hideSearchPageHeader() {
        const main = document.querySelector("main[role='main']");
        if (!main) {
          return;
        }

        // Self-heal: un-hide anything React reused for real content, and
        // anything whose content-sibling context (grid or result links)
        // is gone — a marked node must never outlive the state it was
        // hidden in.
        main.querySelectorAll("[data-nd-header-hidden]").forEach((el) => {
          const parent = el.parentElement;
          const contextGone =
            !parent ||
            !Array.from(parent.children).some(
              (sib) =>
                sib !== el &&
                (sib.querySelectorAll("a[href]").length > 0 ||
                  sib.hasAttribute("data-nd-grid-hidden") ||
                  sib.querySelector("[data-nd-grid-hidden]")),
            );
          if (
            !isExploreSurface() ||
            contextGone ||
            el.querySelector("input") ||
            el.querySelector("button") ||
            el.querySelectorAll("a[href]").length > 0
          ) {
            if (el.style.getPropertyValue("display") === "none") {
              el.style.removeProperty("display");
            }
            el.removeAttribute("data-nd-header-hidden");
          }
        });

        if (!isExploreSurface()) {
          return;
        }

        const input = main.querySelector("input");
        if (!input) {
          return;
        }

        let node = input;
        let guard = 0;
        while (node && node !== main && guard < 15) {
          guard += 1;
          const parent = node.parentElement;
          if (!parent) {
            break;
          }
          const siblings = Array.from(parent.children).filter(
            (child) => child !== node,
          );
          const hasContentSibling = siblings.some(
            (s) =>
              s.querySelectorAll("a[href]").length > 0 ||
              s.hasAttribute("data-nd-grid-hidden") ||
              s.querySelector("[data-nd-grid-hidden]"),
          );
          if (hasContentSibling) {
            siblings.forEach((s) => {
              if (s.hasAttribute("data-nd-header-hidden")) {
                return;
              }
              if (
                s.querySelector("input") ||
                s.querySelector("button") ||
                s.querySelectorAll("a[href]").length > 0 ||
                s.hasAttribute("data-nd-grid-hidden") ||
                s.querySelector("[data-nd-grid-hidden]") ||
                !(s.textContent || "").trim()
              ) {
                return;
              }
              // Never pull live regions out of the accessibility tree.
              const liveRegion =
                "[aria-live], [role='status'], [role='alert']";
              if (s.matches(liveRegion) || s.querySelector(liveRegion)) {
                return;
              }
              s.style.setProperty("display", "none", "important");
              s.setAttribute("data-nd-header-hidden", "1");
            });
          }
          node = parent;
        }
      }

      // Guards for selectFollowingFeedTab: at most one click per 1500 ms,
      // at most 3 clicks while the URL stays the same.
      let lastFeedTabClickAt = 0;
      let feedTabClickUrl = "";
      let feedTabClickCount = 0;

      // An SPA navigation home can leave the URL on /?variant=following
      // while React still renders the For You feed. In that state
      // removeForYouTabContainer has already removed the selected tab, so
      // exactly one unselected tab remains — clicking it switches to the
      // Following feed without a reload. The zero-selected precondition is
      // only reachable through that removal, so a correctly rendered page
      // can never be clicked.
      function selectFollowingFeedTab() {
        const currentPath = window.location.pathname;
        if (currentPath !== "/" && currentPath !== "") {
          return;
        }
        const variant = new URL(window.location.href).searchParams.get(
          "variant",
        );
        if (variant !== "following") {
          return;
        }
        const main = document.querySelector("main[role='main']");
        if (!main) {
          return;
        }
        const unselected = main.querySelectorAll(
          "[role='tab'][aria-selected='false']",
        );
        const selected = main.querySelectorAll(
          "[role='tab'][aria-selected='true']",
        );
        if (selected.length > 0) {
          // Healthy state (a tab is selected) — re-arm the click cap so a
          // later occurrence of the mismatch at the same URL can be fixed.
          feedTabClickCount = 0;
          return;
        }
        if (unselected.length !== 1) {
          return;
        }
        const now = Date.now();
        if (now - lastFeedTabClickAt < 1500) {
          return;
        }
        if (window.location.href !== feedTabClickUrl) {
          feedTabClickUrl = window.location.href;
          feedTabClickCount = 0;
        }
        if (feedTabClickCount >= 3) {
          return;
        }
        lastFeedTabClickAt = now;
        feedTabClickCount += 1;
        unselected[0].click();
      }

      function onMutation() {
        hideNavLinks();
        removeForYouTabContainer();
        updateHomeLinks();
        hideExploreGrid();
        hideSearchPageHeader();
        selectFollowingFeedTab();
      }

      onMutation();
      // Also observe DOM changes to hide new links
      const observer = new MutationObserver(onMutation);
      observer.observe(document, { childList: true, subtree: true });

      // Monitor URL changes for the main-page redirect
      let lastUrl = window.location.href;
      function checkUrlChange() {
        if (!ENABLE_IG) return;
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          redirectMainPageToFollowing();
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

      // Run redirect checks immediately
      redirectMainPageToFollowing();

      window.addEventListener("popstate", checkUrlChange);
      setInterval(checkUrlChange, 500);
    });
  },
});
