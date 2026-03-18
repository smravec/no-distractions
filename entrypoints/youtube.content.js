export default defineContentScript({
  matches: ["https://www.youtube.com/*", "https://m.youtube.com/*"],
  runAt: "document_idle",
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

    extensionApi.storage.sync.get(["yt", "general_switch"], (result) => {
      const GENERAL_SWITCH =
        result.general_switch !== undefined ? result.general_switch : true;
      const YOUTUBE_TOGGLE = result.yt !== undefined ? result.yt : true;
      const ENABLE_YOUTUBE_CSS = GENERAL_SWITCH && YOUTUBE_TOGGLE;

      const html = document.documentElement;

      if (!ENABLE_YOUTUBE_CSS) {
        html.classList.remove("no-distractions-css");
        return;
      }

      // --- REDIRECT LOGIC respecting switches ---
      function redirectToSubscriptionsFeed() {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;
        if (!ENABLE_YOUTUBE_CSS) return; // Respect switches
        // Redirect if on root page
        if (
          (currentPath === "/" || currentPath === "") &&
          !currentUrl.includes("/feed/subscriptions")
        ) {
          window.location.replace("https://www.youtube.com/feed/subscriptions");
          return;
        }
        // Redirect if on /shorts or /shorts/anything
        if (/^\/shorts(\/.*)?$/.test(currentPath)) {
          window.location.replace("https://www.youtube.com/feed/subscriptions");
          return;
        }
      }

      // Monitor URL changes for SPA navigation
      let lastUrl = window.location.href;
      function checkUrlChange() {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;
        if (!ENABLE_YOUTUBE_CSS) return; // Respect switches
        if (
          (currentPath === "/" || currentPath === "") &&
          !currentUrl.includes("/feed/subscriptions")
        ) {
          window.location.replace("https://www.youtube.com/feed/subscriptions");
          return;
        }
        if (/^\/shorts(\/.*)?$/.test(currentPath)) {
          window.location.replace("https://www.youtube.com/feed/subscriptions");
          return;
        }
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          redirectToSubscriptionsFeed();
        }
      }

      // Patch history.pushState and replaceState to catch SPA navigation
      if (!window._noDistractionsYT_HistoryPatched) {
        ["pushState", "replaceState"].forEach((fn) => {
          const orig = history[fn];
          history[fn] = function () {
            const ret = orig.apply(this, arguments);
            setTimeout(checkUrlChange, 0);
            return ret;
          };
        });
        window._noDistractionsYT_HistoryPatched = true;
      }

      // Run redirect check immediately
      redirectToSubscriptionsFeed();
      window.addEventListener("popstate", redirectToSubscriptionsFeed);
      setInterval(checkUrlChange, 1000);

      // Add a class for normal video pages (no 'list' param)
      function updateVideoPageClass() {
        const urlParams = new URLSearchParams(window.location.search);
        if (window.location.pathname === "/watch" && !urlParams.has("list")) {
          html.classList.add("no-distractions-center-video");
        } else {
          html.classList.remove("no-distractions-center-video");
        }
      }

      html.classList.add("no-distractions-css");
      updateVideoPageClass();
      window.addEventListener("popstate", updateVideoPageClass);
      ["pushState", "replaceState"].forEach((fn) => {
        const orig = history[fn];
        history[fn] = function () {
          const ret = orig.apply(this, arguments);
          setTimeout(updateVideoPageClass, 0);
          return ret;
        };
      });
    });
  },
});
