import "../assets/css/reddit.css";

export default defineContentScript({
  matches: ["*://*.reddit.com/*"],
  runAt: "document_start",
  main() {
    let ENABLE_RD = true as any;
    const INITIAL_HOME_SIDEBAR_CLASS = "nd-home-sidebar-initial-hide";

    function isHomeFeedPage() {
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;
      return currentPath === "/" || currentUrl === "https://www.reddit.com/?feed=home";
    }

    function syncInitialSidebarHideClass() {
      const html = document.documentElement;
      const sidebarStyle = document.getElementById("nd-hide-sidebar-style");
      if (ENABLE_RD && isHomeFeedPage() && !sidebarStyle) {
        html.classList.add(INITIAL_HOME_SIDEBAR_CLASS);
      } else {
        html.classList.remove(INITIAL_HOME_SIDEBAR_CLASS);
      }
    }

    // 1. Initial State Fetch
    browser.storage.sync.get(["rd", "general_switch"]).then((result) => {
      const GENERAL_SWITCH = result.general_switch !== undefined ? result.general_switch : true;
      const REDDIT_TOGGLE = result.rd !== undefined ? result.rd : true;
      ENABLE_RD = GENERAL_SWITCH && REDDIT_TOGGLE;
      updateRedditClasses();
      syncInitialSidebarHideClass();
    });

    // 2. Listen for switch changes instead of polling the database 60 times a second
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && (changes.rd || changes.general_switch)) {
        browser.storage.sync.get(["rd", "general_switch"]).then((result) => {
          const GENERAL_SWITCH = result.general_switch !== undefined ? result.general_switch : true;
          const REDDIT_TOGGLE = result.rd !== undefined ? result.rd : true;
          ENABLE_RD = GENERAL_SWITCH && REDDIT_TOGGLE;
          updateRedditClasses();
          syncInitialSidebarHideClass();
        });
      }
    });

    function updateRedditClasses() {
      const html = document.documentElement;
      if (!ENABLE_RD) {
        html.classList.remove("no-distractions-css");
      } else {
        html.classList.add("no-distractions-css");
      }
    }

    // --- Main Feed / Banner Logic ---
    let enforceRedditRAF: number | null = null;

    function injectBannerAndHideFeed() {
      const main = document.querySelector(".main-container") as HTMLElement;
      const feed = document.getElementById("main-content");

      document.documentElement.classList.remove(INITIAL_HOME_SIDEBAR_CLASS);

      if (feed) feed.style.display = "none";

      if (main) {
        main.style.display = "flex";
        main.style.justifyContent = "center";
        main.style.alignItems = "center";
        main.style.minHeight = "100vh";

        if (!document.querySelector(".nd-banner")) {
          const banner = document.createElement("div");
          banner.className = "nd-banner";
          banner.style.display = "block";
          banner.style.textAlign = "center";
          banner.style.marginTop = "-100px";

          const img = document.createElement("img");
          img.src = browser.runtime.getURL("/reddit-icon.png");
          img.alt = "No Distractions Logo";
          img.width = 100;
          img.height = 100;
          banner.appendChild(img);

          const text = document.createElement("div");
          text.textContent = "Welcome to Reddit!";
          Object.assign(text.style, {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#0F1A1C",
            textAlign: "center",
            whiteSpace: "pre-line",
            marginTop: "-14px",
          });
          banner.appendChild(text);
          main.appendChild(banner);

          // Inject CSS to hide right sidebar when banner is shown
          if (!document.getElementById("nd-hide-sidebar-style")) {
            const style = document.createElement("style");
            style.id = "nd-hide-sidebar-style";
            style.textContent = `
              #right-sidebar-container {
                display: none !important;
              }
            `;
            document.head.appendChild(style);
          }
        }
      }
    }

    function restoreFeed() {
      const main = document.querySelector(".main-container") as HTMLElement;
      const feed = document.getElementById("main-content");
      const banner = document.querySelector(".nd-banner");
      const sidebarStyle = document.getElementById("nd-hide-sidebar-style");

      if (feed) feed.style.display = "";
      if (banner) banner.remove();
      if (sidebarStyle) sidebarStyle.remove();
      syncInitialSidebarHideClass();

      if (main) {
        main.style.display = "";
        main.style.justifyContent = "";
        main.style.alignItems = "";
        main.style.minHeight = "";
      }
    }

    function enforceRedditInjectLoop() {
      try {
        // Stop entirely if the context was invalidated by a dev reload
        if (!browser?.runtime?.id) return;
        
        if (!ENABLE_RD) {
          restoreFeed();
        } else {
          if (isHomeFeedPage()) {
            injectBannerAndHideFeed();
          } else {
            restoreFeed();
          }
        }
        enforceRedditRAF = requestAnimationFrame(enforceRedditInjectLoop);
      } catch (e) {
        // Failsafe exit if HMR severs the connection
        if (enforceRedditRAF) cancelAnimationFrame(enforceRedditRAF);
      }
    }

    function startRedditBanner() {
      if (enforceRedditRAF) {
        cancelAnimationFrame(enforceRedditRAF);
        enforceRedditRAF = null;
      }
      enforceRedditInjectLoop();
    }

    let lastUrl = window.location.href;
    function checkUrlChange() {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        syncInitialSidebarHideClass();
        startRedditBanner();
      }
    }

    function initRedditCleaner() {
      // @ts-ignore - Patching window history for SPA navigation
      if (!window._noDistractionsRedditPatched) {
        ["pushState", "replaceState"].forEach((fn) => {
          // @ts-ignore
          const orig = history[fn];
          // @ts-ignore
          history[fn] = function () {
            const ret = orig.apply(this, arguments);
            setTimeout(checkUrlChange, 0);
            return ret;
          };
        });
        // @ts-ignore
        window._noDistractionsRedditPatched = true;
      }

      startRedditBanner();
      setInterval(checkUrlChange, 1000);
    }

    // Wait until DOM is ready to start DOM manipulations
    syncInitialSidebarHideClass();
    if (document.readyState === "complete" || document.readyState === "interactive") {
      initRedditCleaner();
    } else {
      window.addEventListener("DOMContentLoaded", initRedditCleaner);
    }
  },
});
