import {
  FB_FRIENDS_FEED,
  fbGuardedTarget,
  fbRedirectTarget,
  fbIsHomeRedirect,
  fbIsLoggedIn,
} from "../utils/facebook-routes.js";
import { fbSyncComposer, fbRemoveComposer } from "../utils/facebook-composer.js";
import { fbSyncShortcuts, fbRemoveShortcuts } from "../utils/facebook-shortcuts.js";

export default defineContentScript({
  matches: ["https://www.facebook.com/*", "https://m.facebook.com/*"],
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

    // facebook.com is embedded as iframes on other sites (e.g. Instagram);
    // those frames must stay untouched.
    if (window.top !== window.self) {
      return;
    }

    // The old mobile-site logic, kept verbatim. It was written for
    // document_idle, so it waits for the DOM.
    function runLegacyMobile(result) {
      const GENERAL_SWITCH =
        result.general_switch !== undefined ? result.general_switch : true;
      const FACEBOOK_TOGGLE = result.fb !== undefined ? result.fb : true;
      const ENABLE_FB = GENERAL_SWITCH && FACEBOOK_TOGGLE;

      const html = document.documentElement;

      // Check if user is logged out (don't block on login/signup pages)
      const isLoggedOut = document.body?.classList.contains("UIPage_LoggedOut");

      if (!ENABLE_FB || isLoggedOut) {
        html.classList.remove("no-distractions-css");
        return;
      }
      html.classList.add("no-distractions-css");

      // Stops from running on other sites which just use facebook.com in a iframe (like instagram)
      let isTopFrame = false;
      const currentDomain = window.location.hostname;

      try {
        // Try to access top frame location
        if (window.top.location.hostname === window.location.hostname) {
          isTopFrame = true;
        }
      } catch (e) {
        // Security error means we're in a cross-origin iframe
        isTopFrame = false;
      }

      if (isTopFrame && currentDomain.includes("facebook")) {
        // mobile = true, desktop = false
        const mobile_mode = window.screen.width <= 500;

        const dont_display_style = "display: none !important;";

        // Universal style to clean the main content element
        const main_feed = document.createElement("style");
        main_feed.textContent = `
      div[role="main"]{
          ${dont_display_style}
      }
    `;

        function CleanEntirePage(entering_or_leaving_bool) {
          if (entering_or_leaving_bool === true) {
            document.head.appendChild(main_feed);
          } else {
            document.head.removeChild(main_feed);
          }
        }
        // Styles for mobile
        const main_feed_mobile = document.createElement("style");
        main_feed_mobile.textContent = `
      #screen-root > div > div:nth-child(1) > div:nth-child(5) ~ * {
        display: none !important;
      }
      #screen-root > div:nth-child(1)::before {
        background-color: white !important;
      }
    `;

        const watch_feed_mobile = document.createElement("style");
        watch_feed_mobile.textContent = `
      #screen-root > div > div:nth-child(3) > div:nth-child(6) ~ * {
        display: none;
      }
      #screen-root > div:nth-child(1)::before {
        background-color: white !important;
      }
    `;

        const reels_mobile = document.createElement("style");
        reels_mobile.textContent = `
      video{
        display: none;
      }
    `;

        const live_feed_mobile = document.createElement("style");
        live_feed_mobile.textContent = `
      #screen-root > div > div:nth-child(3) > div.m.bg-s2.displayed ~ * {
        display: none;
      }
    `;

        function CleanEntirePageMobile(entering_or_leaving_bool, url) {
          if (url == "/") {
            if (entering_or_leaving_bool === true) {
              document.head.appendChild(main_feed_mobile);
            } else {
              document.head.removeChild(main_feed_mobile);
            }
          } else if (url == "watch") {
            if (entering_or_leaving_bool === true) {
              document.head.appendChild(watch_feed_mobile);
            } else {
              document.head.removeChild(watch_feed_mobile);
            }
          } else if (url == "reels") {
            if (entering_or_leaving_bool === true) {
              document.head.appendChild(reels_mobile);
            } else {
              document.head.removeChild(reels_mobile);
            }
          } else if (url == "live") {
            if (entering_or_leaving_bool === true) {
              document.head.appendChild(live_feed_mobile);
            } else {
              document.head.removeChild(live_feed_mobile);
            }
          }
        }

        //Init override stylesheet styles
        const main_feed_override = document.createElement("style");
        main_feed_override.textContent = `
      div[role="main"]{
          display: block !important;
      }
    `;
        document.head.appendChild(main_feed_override);

        //Init clean
        const init_path = window.location.pathname;
        if (mobile_mode === true) {
          if (init_path === "/" || init_path === "") {
            CleanEntirePageMobile(true, "/");
          } else if (init_path == "/watch/") {
            CleanEntirePageMobile(true, "watch");
          } else if (init_path.includes("reel")) {
            CleanEntirePageMobile(true, "reels");
          } else if (init_path == "/watch/live/") {
            CleanEntirePageMobile(true, "live");
          }
        } else {
          if (
            init_path === "/" ||
            init_path === "" ||
            init_path === "/reel/" ||
            init_path.includes("watch")
          ) {
            CleanEntirePage(true);
          }
        }

        let bodyObserver = null;

        // Function to set up the observer
        function setupObserver() {
          let targetElementSelector = null;
          // Based on mode pick target element
          if (mobile_mode === true) {
            targetElementSelector = "#screen-root";
          } else {
            targetElementSelector = 'div[role="main"]';
          }

          // Try to find the target element
          const targetElement = document.querySelector(targetElementSelector);
          let lastPathname = window.location.pathname;

          if (targetElement) {
            // Prevent spawning multiple observers
            if (bodyObserver !== null) {
              return;
            }

            // Observe url changes
            bodyObserver = new MutationObserver(() => {
              if (lastPathname !== window.location.pathname) {
                if (mobile_mode === true) {
                  // Main page
                  if (lastPathname == "/" || lastPathname == "") {
                    CleanEntirePageMobile(false, "/");
                  }
                  if (
                    window.location.pathname == "/" ||
                    window.location.pathname == ""
                  ) {
                    CleanEntirePageMobile(true, "/");
                  }

                  // Watch page
                  if (lastPathname == "/watch/") {
                    CleanEntirePageMobile(false, "watch");
                  }
                  if (window.location.pathname == "/watch/") {
                    CleanEntirePageMobile(true, "watch");
                  }

                  // Reels page
                  if (lastPathname.includes("reel")) {
                    CleanEntirePageMobile(false, "reels");
                  }
                  if (window.location.pathname.includes("reel")) {
                    CleanEntirePageMobile(true, "reels");
                  }

                  // Live page
                  if (lastPathname == "/watch/live/") {
                    CleanEntirePageMobile(false, "live");
                  }
                  if (window.location.pathname == "/watch/live/") {
                    CleanEntirePageMobile(true, "live");
                  }
                } else {
                  if (
                    window.location.pathname == "/" ||
                    window.location.pathname == "" ||
                    window.location.pathname == "/reel/" ||
                    window.location.pathname == "/reel" ||
                    window.location.pathname.includes("watch")
                  ) {
                    CleanEntirePage(true);
                  } else if (
                    lastPathname == "/" ||
                    lastPathname == "" ||
                    lastPathname == "/reel/" ||
                    lastPathname == "/reel" ||
                    lastPathname.includes("watch")
                  ) {
                    CleanEntirePage(false);
                  }
                }
                lastPathname = window.location.pathname;
              }
            });

            bodyObserver.observe(document.body, { childList: true, subtree: true });

            return bodyObserver;
          } else {
            // Retry
            setTimeout(setupObserver, 1000);
            return null;
          }
        }

        // Whichever is soonest creates the observer (other chunks wont spawn another)

        // Run the setup with a slight delay to ensure Facebook's UI is loaded
        setTimeout(setupObserver, 500);

        // Also set up on page load events
        window.addEventListener("load", () => {
          setupObserver();
        });

        // Listen for Facebook's navigation events
        window.addEventListener("popstate", () => {
          setupObserver();
        });
      }
    }

    extensionApi.storage.sync.get(["fb", "general_switch"], (result) => {
      if (window.location.hostname === "m.facebook.com") {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () =>
            runLegacyMobile(result),
          );
        } else {
          runLegacyMobile(result);
        }
        return;
      }

      const GENERAL_SWITCH =
        result.general_switch !== undefined ? result.general_switch : true;
      const FACEBOOK_TOGGLE = result.fb !== undefined ? result.fb : true;
      const ENABLE_FB = GENERAL_SWITCH && FACEBOOK_TOGGLE;
      const html = document.documentElement;

      // True when fixFriendsRender's reload produced this page. Consumed on
      // every www load (armed or not), so the marker never outlives the page
      // it was meant for. On a sessionStorage error it stays false, and
      // fixFriendsRender doesn't reload without sessionStorage anyway.
      let thisPageIsOurReload = false;
      try {
        thisPageIsOurReload =
          sessionStorage.getItem("nd-fb-reload-pending") === "1";
        sessionStorage.removeItem("nd-fb-reload-pending");
      } catch (e) {
        // Fail closed: never treat a page as our reload (no give-up flag).
      }

      function disarm() {
        html.classList.remove(
          "no-distractions-css",
          "nd-fb-home",
          "nd-fb-redirect",
          "nd-fb-composing",
        );
        // Disarm the MAIN-world history rewriter.
        html.removeAttribute("data-nd-fb");
        fbRemoveComposer();
        fbRemoveShortcuts();
      }

      // Logged out (login / signup pages): never block, and leave the
      // fast-path cache alone so the next logged-in load is still instant.
      function isLoggedOut() {
        return (
          !fbIsLoggedIn() ||
          !!document.body?.classList.contains("UIPage_LoggedOut")
        );
      }

      if (!ENABLE_FB) {
        disarm();
        try {
          localStorage.setItem("nd-fb-enabled", "0");
        } catch (e) {
          // Ignore: without the cache the fast path simply stays off.
        }
        return;
      }
      if (isLoggedOut()) {
        disarm();
        return;
      }

      html.classList.add("no-distractions-css");
      // Arm the MAIN-world history rewriter and the hard-load fast path.
      html.setAttribute("data-nd-fb", "1");
      try {
        localStorage.setItem("nd-fb-enabled", "1");
      } catch (e) {
        // Ignore: without the cache the fast path simply stays off.
      }

      // --- hide helpers -------------------------------------------------
      function hideAs(el, kind) {
        el.style.setProperty("display", "none", "important");
        el.setAttribute("data-nd-fb-hidden", kind);
      }

      function unhide(el) {
        // Only clear the inline display we set — Facebook may have put its
        // own value there in the meantime.
        if (el.style.getPropertyValue("display") === "none") {
          el.style.removeProperty("display");
        }
        el.removeAttribute("data-nd-fb-hidden");
      }

      // Feed units sit in long single-child wrapper chains; the list item is
      // the first ancestor whose parent has siblings. Hiding it (not the
      // inner unit) leaves no gap.
      function feedListItem(unit, main) {
        let node = unit;
        while (
          node.parentElement &&
          node.parentElement !== main &&
          node.parentElement.children.length === 1
        ) {
          node = node.parentElement;
        }
        return node;
      }

      // --- qualifiers (structural, never text: works in every locale) ---
      function isPymk(item) {
        return !!item.querySelector("a[href*='/friends/suggestions']");
      }

      // Friends' own posts carry at most one reel; a shelf carries many.
      function isReelsShelf(item) {
        const reelLinks = item.querySelectorAll("a[href*='/reel/']");
        const ids = new Set();
        reelLinks.forEach((a) => {
          const m = (a.getAttribute("href") || "").match(/\/reel\/(\d+)/);
          if (m) {
            ids.add(m[1]);
          }
        });
        if (ids.size >= 3) {
          return true;
        }
        let reelChildren = 0;
        item.querySelectorAll("[data-type='hscroll-child']").forEach((c) => {
          if (c.querySelector("a[href*='/reel/']")) {
            reelChildren += 1;
          }
        });
        return reelChildren >= 2;
      }

      // A virtualized (scrolled-away) unit is an empty placeholder; keep it
      // hidden, or it re-opens as a blank gap of the old height.
      function hasLiveContent(item) {
        return (
          item.matches("[data-virtualized='false']") ||
          !!item.querySelector("[data-virtualized='false']")
        );
      }

      function isWatchPlayerRoute() {
        const u = new URL(window.location.href);
        return /^\/watch\/?$/.test(u.pathname) && !!u.searchParams.get("v");
      }

      // --- self-heal ----------------------------------------------------
      function selfHeal() {
        document.querySelectorAll("[data-nd-fb-hidden]").forEach((el) => {
          const kind = el.getAttribute("data-nd-fb-hidden");
          let keep = false;
          if (kind === "pymk") {
            keep = isPymk(el) || !hasLiveContent(el);
          } else if (kind === "reels") {
            keep = isReelsShelf(el) || !hasLiveContent(el);
          } else if (kind === "feeds-all") {
            keep = !!el.querySelector("a[href='/?filter=all&sk=h_chr']");
          } else if (kind === "watch-feed") {
            const fork = el.parentElement;
            keep =
              isWatchPlayerRoute() &&
              !!fork &&
              fork.children[0] !== el &&
              !!fork.children[0].querySelector("video");
          }
          if (!keep) {
            unhide(el);
          }
        });
      }

      // --- passes -------------------------------------------------------
      function updateHomeLinks() {
        document
          .querySelectorAll(
            'a[href="/"], a[href="https://www.facebook.com/"], a[href="/home.php"], a[href="https://www.facebook.com/home.php"], a[href="https://www.facebook.com/?filter=all&sk=h_chr"]',
          )
          .forEach((el) => {
            el.setAttribute("href", FB_FRIENDS_FEED);
            el.setAttribute("data-nd-fb-href", "1");
          });
        // Facebook may re-render or hover-rewrite a link we already fixed.
        document.querySelectorAll("a[data-nd-fb-href]").forEach((el) => {
          if (el.getAttribute("href") !== FB_FRIENDS_FEED) {
            el.setAttribute("href", FB_FRIENDS_FEED);
          }
        });
      }

      // Feeds nav: the "All" filter is the algorithmic feed under another
      // name. The Friends entry stays and stays selected.
      function hideFeedsAllItem() {
        document
          .querySelectorAll("[role='navigation'] a[href='/?filter=all&sk=h_chr']")
          .forEach((a) => {
            const nav = a.closest("[role='navigation']");
            let node = a;
            while (
              node.parentElement &&
              node.parentElement !== nav &&
              node.parentElement.children.length === 1
            ) {
              node = node.parentElement;
            }
            if (!node.hasAttribute("data-nd-fb-hidden")) {
              hideAs(node, "feeds-all");
            }
          });
      }

      function hideFeedUnits() {
        const main = document.querySelector("div[role='main']");
        if (!main) {
          return;
        }
        main.querySelectorAll("[data-virtualized='false']").forEach((unit) => {
          if (unit.closest("[data-nd-fb-hidden]")) {
            return;
          }
          // Comment threads on the watch page are virtualized too.
          if (unit.closest("#watch_feed")) {
            return;
          }
          const item = feedListItem(unit, main);
          if (isPymk(item)) {
            hideAs(item, "pymk");
          } else if (isReelsShelf(item)) {
            hideAs(item, "reels");
          }
        });
      }

      // /watch/?v=: keep the player (+ its comments column), hide the
      // suggested-videos feed below it. Below #watch_feed the tree is a
      // single-child chain down to a fork: [player branch, suggestions].
      function hideWatchSuggestions() {
        if (!isWatchPlayerRoute()) {
          return;
        }
        const feed = document.getElementById("watch_feed");
        if (!feed) {
          return;
        }
        let fork = feed;
        let guard = 0;
        while (fork && fork.children.length === 1 && guard < 30) {
          fork = fork.firstElementChild;
          guard += 1;
        }
        if (!fork || fork.children.length < 2) {
          return;
        }
        // Never act before the player is in place: branch 0 must hold it.
        if (!fork.children[0].querySelector("video")) {
          return;
        }
        Array.from(fork.children)
          .slice(1)
          .forEach((child) => {
            if (!child.hasAttribute("data-nd-fb-hidden")) {
              hideAs(child, "watch-feed");
            }
          });
      }

      // --- routing ------------------------------------------------------
      let redirectStartedAt = 0;
      let redirectWait = 10000;
      let homeValveTimer = 0;

      // True while a navigation started by us, or by the init fast path
      // (same isolated world, window.__ndFbRedirecting), may still unload
      // the page. Starting a second one would override the first's target
      // (and the init's loop-guard choice).
      function redirectPending() {
        const started = Math.max(
          redirectStartedAt,
          Number(window.__ndFbRedirecting) || 0,
        );
        return Date.now() - started < redirectWait;
      }

      // A navigation that never unloads the page (e.g. the user cancelled a
      // leave-page prompt or pressed Esc) may be retried once redirectWait
      // has passed. Only a blocked home re-routes on its own (every 500 ms),
      // so only it retries. The first wait matches the MAIN script's 10 s
      // valve, so a slow but live navigation isn't aborted; each retry
      // doubles it (10 s, 20 s, 40 s …).
      function redirectTo(path) {
        if (redirectPending()) {
          return;
        }
        if (redirectStartedAt || window.__ndFbRedirecting) {
          redirectWait *= 2;
        }
        redirectStartedAt = Date.now();
        window.location.replace(path);
      }

      // Pre-hides main. The 3 s valve lifts it unless something re-arms it:
      // route() re-arms it every 500 ms while the URL is a blocked home, so
      // For You stays hidden until the (retried) redirect lands. Only a
      // fixFriendsRender hide (whose reload never unloaded the page) times out.
      function setHomeClass() {
        html.classList.add("nd-fb-home");
        clearTimeout(homeValveTimer);
        homeValveTimer = setTimeout(() => {
          html.classList.remove("nd-fb-home");
        }, 3000);
      }

      function route() {
        const href = window.location.href;
        const target = fbRedirectTarget(href);
        if (target === null) {
          html.classList.remove("nd-fb-home", "nd-fb-redirect");
          return;
        }
        if (!fbIsHomeRedirect(href)) {
          // Reels viewer, video feeds, gaming: the render wouldn't follow
          // a URL rewrite, so these always cost a full navigation. Guarded:
          // Facebook may bounce /watch/?v=<id> back to /reel/<id>. Checked
          // before fbGuardedTarget so a navigation already under way (the
          // init's) isn't recorded twice and turned into a fallback.
          html.classList.add("nd-fb-redirect");
          if (!redirectPending()) {
            redirectTo(fbGuardedTarget(href) || target);
          }
          return;
        }
        // A home URL that committed anyway (hard load, or an old history
        // entry): Facebook's router renders the For You feed whatever the
        // URL, and no SPA route leads into the Feeds view, so this is a full
        // navigation behind the pre-hide.
        setHomeClass();
        redirectTo(FB_FRIENDS_FEED);
      }

      // Guards for fixFriendsRender: a 1500 ms grace period, then at most one
      // full reload per 60 s per tab (sessionStorage "nd-fb-reload-at"). If
      // the page our reload produced (thisPageIsOurReload) still mismatches,
      // the healthy marker no longer matches Facebook's layout:
      // "nd-fb-render-broken" then stops every further reload and pre-hide
      // in this tab. So a changed layout costs one reload per tab at most.
      // Any other page that mismatches within the 60 s just isn't reloaded.
      // Without sessionStorage: no reload.
      let mismatchSince = 0;
      // True while the pre-hide is ours (set on a detected mismatch).
      let mismatchHidden = false;
      // True once the current mismatch was dealt with (reload started, or
      // given up), so it isn't re-judged every 500 ms.
      let mismatchSettled = false;
      // True once this page rendered the real Feeds view: a later mismatch
      // comes from an in-page navigation, not from a reload that failed.
      let seenHealthy = false;

      function liftMismatchHide() {
        if (mismatchHidden) {
          clearTimeout(homeValveTimer);
          html.classList.remove("nd-fb-home");
          mismatchHidden = false;
        }
      }

      function renderGivenUp() {
        try {
          return sessionStorage.getItem("nd-fb-render-broken") === "1";
        } catch (e) {
          return true; // Without the guard no reload, so no pre-hide either.
        }
      }

      // The friends URL can commit while React still renders the For You
      // feed (or another view). The Feeds nav (with its Friends entry) is
      // rendered only on the real Friends feed, so its absence alongside
      // rendered feed units means a mismatch.
      function fixFriendsRender() {
        const u = new URL(window.location.href);
        if (u.pathname !== "/" || u.searchParams.get("filter") !== "friends") {
          mismatchSince = 0;
          mismatchHidden = false;
          mismatchSettled = false;
          return;
        }
        // Our rewritten home links point at the same URL and sit in the
        // banner navigation too — they must not count as the Feeds entry.
        const healthy = !!document.querySelector(
          "[role='navigation'] a[href='/?filter=friends&sk=h_chr']:not([data-nd-fb-href])",
        );
        if (healthy) {
          // Healthy state — lift our pre-hide and re-arm for a later mismatch.
          seenHealthy = true;
          liftMismatchHide();
          mismatchSince = 0;
          mismatchSettled = false;
          return;
        }
        if (!document.querySelector("div[role='main'] [data-virtualized]")) {
          return; // Not rendered yet.
        }
        const now = Date.now();
        if (!mismatchSince) {
          mismatchSince = now;
          if (renderGivenUp()) {
            mismatchSettled = true;
            return;
          }
          // Hide the wrong feed at once; the 1500 ms grace below decides.
          mismatchHidden = true;
          setHomeClass();
          return;
        }
        if (mismatchSettled || now - mismatchSince < 1500) {
          return;
        }
        mismatchSettled = true;
        try {
          const last = Number(sessionStorage.getItem("nd-fb-reload-at")) || 0;
          if (now - last < 60000) {
            if (thisPageIsOurReload && !seenHealthy) {
              // This page is our own reload and never rendered the Feeds
              // view: reloading can't fix it. Give up for the tab.
              sessionStorage.setItem("nd-fb-render-broken", "1");
            }
            liftMismatchHide();
            return;
          }
          sessionStorage.setItem("nd-fb-reload-at", String(now));
          // Tells the page this reload produces that it is that reload.
          sessionStorage.setItem("nd-fb-reload-pending", "1");
        } catch (e) {
          // Without the guard, never risk a reload loop.
          liftMismatchHide();
          return;
        }
        // Keep the page hidden until the reload unloads it.
        setHomeClass();
        redirectTo(FB_FRIENDS_FEED);
      }

      // --- wiring -------------------------------------------------------
      function pass() {
        if (isLoggedOut()) {
          return;
        }
        selfHeal();
        updateHomeLinks();
        hideFeedsAllItem();
        fbSyncShortcuts();
        fbSyncComposer();
        hideFeedUnits();
        hideWatchSuggestions();
      }

      // Facebook mutates constantly; coalesce to one pass per frame (before
      // paint, so hidden units never flash).
      let passScheduled = false;
      function schedulePass() {
        if (passScheduled) {
          return;
        }
        passScheduled = true;
        requestAnimationFrame(() => {
          passScheduled = false;
          pass();
        });
      }

      route();

      const observer = new MutationObserver(schedulePass);
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href"],
      });
      schedulePass();

      let lastUrl = window.location.href;
      function checkUrlChange() {
        const currentUrl = window.location.href;
        // A blocked home keeps re-routing: that keeps the pre-hide armed
        // (For You must never show) and retries a redirect that never
        // unloaded the page, with the back-off in redirectTo.
        if (currentUrl !== lastUrl || fbIsHomeRedirect(currentUrl)) {
          lastUrl = currentUrl;
          route();
        }
        fixFriendsRender();
      }

      document.addEventListener("nd-fb-navigated", () => {
        setTimeout(checkUrlChange, 0);
      });
      window.addEventListener("popstate", checkUrlChange);
      setInterval(checkUrlChange, 500);

      // Home (logo, Home tab) on a Feeds view stays in place: on Friends it
      // scrolls to the top, on another filter it switches through the Feeds
      // panel's own Friends link (an SPA navigation). Without this, every
      // click is a full reload, and rapid clicks keep flashing the old page
      // between reloads. Capture phase, so Facebook's router never sees it.
      window.addEventListener(
        "click",
        (e) => {
          if (
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            html.getAttribute("data-nd-fb") !== "1" ||
            window.location.pathname !== "/" ||
            !(e.target instanceof Element) ||
            !e.target.closest("a[data-nd-fb-href]")
          ) {
            return;
          }
          const friends = document.querySelector(
            "[role='navigation'] a[href='/?filter=friends&sk=h_chr']:not([data-nd-fb-href])",
          );
          if (!friends) {
            return;
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          if (new URL(window.location.href).searchParams.get("filter") === "friends") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            friends.click();
          }
        },
        true,
      );
    });
  },
});
