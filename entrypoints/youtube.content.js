export default defineContentScript({
  matches: ["https://www.youtube.com/*", "https://m.youtube.com/*"],
  runAt: "document_idle",
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

    extensionApi.storage.sync.get(["yt", "general_switch"], (result) => {
      const GENERAL_SWITCH =
        result.general_switch !== undefined ? result.general_switch : true;
      const YOUTUBE_TOGGLE = result.yt !== undefined ? result.yt : true;
      const ENABLE_YOUTUBE_CSS = GENERAL_SWITCH && YOUTUBE_TOGGLE;

      const html = document.documentElement;
      const IS_DESKTOP = window.location.hostname === "www.youtube.com";

      if (!ENABLE_YOUTUBE_CSS) {
        html.classList.remove("no-distractions-css");
        html.classList.remove("nd-yt-home");
        return;
      }

      // --- REDIRECT LOGIC respecting switches ---
      function redirectToSubscriptionsFeed() {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;
        if (!ENABLE_YOUTUBE_CSS) return; // Respect switches
        // Mobile keeps the old root redirect; desktop root shows the landing.
        if (
          !IS_DESKTOP &&
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
          !IS_DESKTOP &&
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
        updateHomeLandingState();
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          redirectToSubscriptionsFeed();
        }
      }

      // --- HOME LANDING (desktop only) ---
      let homeLandingFocused = false;
      let homeLogoCloned = false;
      let homeGuideCollapsed = false;

      // --- HOME LANDING SEARCH SUGGESTIONS ---
      let homeSuggestTimer = 0;
      let homeSuggestSeq = 0;
      let homeSuggestItems = [];
      let homeSuggestActive = -1;
      let homeSuggestTyped = "";

      function hideHomeSuggestions() {
        // Invalidate pending work too: a live debounce timer (Escape) or an
        // in-flight fetch (blur) must not reopen a dismissed panel.
        clearTimeout(homeSuggestTimer);
        homeSuggestSeq += 1;
        const panel = document.getElementById("nd-yt-home-suggest");
        if (panel) {
          panel.hidden = true;
          panel.textContent = "";
        }
        homeSuggestItems = [];
        homeSuggestActive = -1;
      }

      function makeSuggestIcon() {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "20");
        svg.setAttribute("height", "20");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("aria-hidden", "true");
        const path = document.createElementNS(ns, "path");
        path.setAttribute(
          "d",
          "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
        );
        svg.appendChild(path);
        return svg;
      }

      function renderHomeSuggestions() {
        const panel = document.getElementById("nd-yt-home-suggest");
        const input = document.getElementById("nd-yt-home-input");
        const form = document.getElementById("nd-yt-home-search");
        if (!panel || !input || !form) {
          return;
        }
        panel.textContent = "";
        if (homeSuggestItems.length === 0) {
          panel.hidden = true;
          return;
        }
        homeSuggestItems.forEach((text, i) => {
          const row = document.createElement("div");
          row.className = "nd-yt-home-suggest-row";
          row.setAttribute("role", "option");
          row.setAttribute(
            "aria-selected",
            i === homeSuggestActive ? "true" : "false",
          );
          if (i === homeSuggestActive) {
            row.classList.add("nd-yt-home-suggest-active");
          }
          row.appendChild(makeSuggestIcon());
          const label = document.createElement("span");
          // Suggestions are remote data — textContent only, never innerHTML.
          label.textContent = text;
          row.appendChild(label);
          // mousedown fires before the input's blur, so the click always
          // lands; preventDefault keeps focus in the input meanwhile.
          row.addEventListener("mousedown", (e) => {
            e.preventDefault();
            input.value = text;
            // requestSubmit fires the submit event, so the SPA handler in
            // wireHomeNavigation sees it; bare submit() would bypass it.
            if (form.requestSubmit) {
              form.requestSubmit();
            } else {
              form.submit();
            }
          });
          panel.appendChild(row);
        });
        panel.hidden = false;
      }

      function fetchHomeSuggestions(query) {
        const seq = ++homeSuggestSeq;
        const hl = (
          document.documentElement.lang ||
          navigator.language ||
          "en"
        ).split("-")[0];
        const url =
          "https://suggestqueries-clients6.youtube.com/complete/search" +
          "?client=youtube&ds=yt&xhr=t&hl=" +
          encodeURIComponent(hl) +
          "&q=" +
          encodeURIComponent(query);
        fetch(url)
          .then((r) => r.json())
          .then((data) => {
            if (seq !== homeSuggestSeq) {
              return; // A newer request superseded this one.
            }
            const list =
              Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
            homeSuggestItems = list
              .map((entry) => (Array.isArray(entry) ? entry[0] : null))
              .filter((s) => typeof s === "string" && s.length > 0)
              .slice(0, 10);
            homeSuggestActive = -1;
            renderHomeSuggestions();
          })
          .catch(() => {
            // Silent: the plain form GET fallback still works without us.
          });
      }

      function scheduleHomeSuggestions(query) {
        clearTimeout(homeSuggestTimer);
        if (!query) {
          hideHomeSuggestions();
          return;
        }
        homeSuggestTimer = setTimeout(() => {
          fetchHomeSuggestions(query);
        }, 150);
      }

      function wireHomeSearchSuggestions(root) {
        const input = root.querySelector("#nd-yt-home-input");
        const panel = root.querySelector("#nd-yt-home-suggest");
        if (!input || !panel) {
          return;
        }
        input.addEventListener("input", () => {
          homeSuggestTyped = input.value;
          homeSuggestActive = -1;
          scheduleHomeSuggestions(input.value.trim());
        });
        input.addEventListener("focus", () => {
          homeSuggestTyped = input.value;
          scheduleHomeSuggestions(input.value.trim());
        });
        input.addEventListener("blur", () => {
          clearTimeout(homeSuggestTimer);
          hideHomeSuggestions();
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            input.value = homeSuggestTyped;
            hideHomeSuggestions();
            return;
          }
          if (panel.hidden || homeSuggestItems.length === 0) {
            return;
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const n = homeSuggestItems.length;
            if (e.key === "ArrowDown") {
              homeSuggestActive =
                homeSuggestActive >= n - 1 ? -1 : homeSuggestActive + 1;
            } else {
              homeSuggestActive =
                homeSuggestActive <= -1 ? n - 1 : homeSuggestActive - 1;
            }
            input.value =
              homeSuggestActive === -1
                ? homeSuggestTyped
                : homeSuggestItems[homeSuggestActive];
            renderHomeSuggestions();
          }
        });
      }

      // --- HOME LANDING SPA NAVIGATION ---
      // YouTube's router ignores injected anchors, so plain links cost a
      // full reload. The MAIN-world bridge (youtube-main.content.js)
      // dispatches yt-navigate for us; if it doesn't act within 400 ms the
      // original full navigation still happens.
      const HOME_BROWSE_IDS = {
        "/feed/subscriptions": "FEsubscriptions",
        "/feed/playlists": "FEplaylist_aggregation",
        "/feed/history": "FEhistory",
      };

      function spaNavigate(payload, fallback) {
        const before = window.location.href;
        document.dispatchEvent(
          new CustomEvent("nd-yt-navigate", {
            detail: JSON.stringify(payload),
          }),
        );
        setTimeout(() => {
          if (window.location.href === before) {
            fallback();
          }
        }, 400);
      }

      function wireHomeNavigation(root) {
        root.querySelectorAll("a.nd-yt-home-chip").forEach((chip) => {
          const href = chip.getAttribute("href");
          const browseId = HOME_BROWSE_IDS[href];
          if (!browseId) {
            return; // Unknown destination stays a plain link.
          }
          chip.addEventListener("click", (e) => {
            e.preventDefault();
            spaNavigate({ url: href, browseId: browseId }, () => {
              window.location.assign(href);
            });
          });
        });

        const form = root.querySelector("#nd-yt-home-search");
        const input = root.querySelector("#nd-yt-home-input");
        if (form && input) {
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = input.value.trim();
            if (!query) {
              return;
            }
            hideHomeSuggestions();
            spaNavigate(
              {
                url: "/results?search_query=" + encodeURIComponent(query),
                query: query,
              },
              () => {
                // Native submit doesn't re-fire this handler.
                form.submit();
              },
            );
          });
        }
      }

      function isHomeLandingPath() {
        const p = window.location.pathname;
        return IS_DESKTOP && (p === "/" || p === "");
      }

      // Inject the landing overlay once; visibility is pure CSS via the
      // nd-yt-home class on <html>, so SPA navigation never re-creates it.
      function ensureHomeLanding() {
        const existing = document.getElementById("nd-yt-home-root");
        if (existing) {
          return existing;
        }
        if (!document.body) {
          return null; // Body not parsed yet; the interval retries.
        }
        const root = document.createElement("div");
        root.id = "nd-yt-home-root";
        root.innerHTML = `
          <div id="nd-yt-home-inner">
            <div id="nd-yt-home-logo" aria-hidden="true"></div>
            <div id="nd-yt-home-search-wrap">
              <form id="nd-yt-home-search" action="/results" method="get" role="search">
                <input id="nd-yt-home-input" name="search_query" type="text" placeholder="Search" autocomplete="off" aria-autocomplete="list" aria-controls="nd-yt-home-suggest" />
                <button id="nd-yt-home-search-btn" type="submit" aria-label="Search">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
                </button>
              </form>
              <div id="nd-yt-home-suggest" role="listbox" hidden></div>
            </div>
            <div id="nd-yt-home-links">
              <a class="nd-yt-home-chip" href="/feed/subscriptions">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="M4 6h16v1H4V6zM2 9h20v1H2V9zm17 3H5c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-7c0-.55-.45-1-1-1zm-9 7v-5l4.5 2.5L10 19z"/></svg>
                <span>Subscriptions</span>
              </a>
              <a class="nd-yt-home-chip" href="/feed/playlists">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M3 6h12v2H3V6zm0 4h12v2H3v-2zm0 4h8v2H3v-2zm13 0v6l5-3-5-3z"/></svg>
                <span>Playlists</span>
              </a>
              <a class="nd-yt-home-chip" href="/feed/history">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 1 1 7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.96 8.96 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
                <span>History</span>
              </a>
            </div>
          </div>
        `;
        document.body.appendChild(root);
        wireHomeSearchSuggestions(root);
        wireHomeNavigation(root);
        return root;
      }

      function updateHomeLandingState() {
        if (!ENABLE_YOUTUBE_CSS) return; // Respect switches
        const active = isHomeLandingPath();
        html.classList.toggle("nd-yt-home", active);
        if (!active) {
          homeLandingFocused = false;
          homeGuideCollapsed = false;
          html.classList.remove("nd-yt-guide-open");
          clearTimeout(homeSuggestTimer);
          hideHomeSuggestions();
          // SPA navigation keeps the overlay alive — clear the query so a
          // later return to the landing starts fresh, like a reload did.
          const staleInput = document.getElementById("nd-yt-home-input");
          if (staleInput) {
            staleInput.value = "";
            homeSuggestTyped = "";
          }
          return;
        }
        const root = ensureHomeLanding();
        if (!root) {
          return;
        }
        // The guide drawer starts opened+persistent while our CSS hides it,
        // which would desync the hamburger (its first click "closes" an
        // invisible drawer). Collapse it once through YouTube's own toggle,
        // then mirror the drawer's real opened-state so the hamburger works.
        const guide = document.querySelector("tp-yt-app-drawer#guide");
        if (guide) {
          if (!homeGuideCollapsed) {
            if (
              guide.hasAttribute("opened") &&
              guide.hasAttribute("persistent")
            ) {
              const guideButton =
                document.querySelector("ytd-masthead #guide-button button") ||
                document.querySelector("ytd-masthead #guide-button");
              if (guideButton) {
                guideButton.click();
              }
            }
            if (!guide.hasAttribute("opened")) {
              homeGuideCollapsed = true;
            }
          } else {
            html.classList.toggle(
              "nd-yt-guide-open",
              guide.hasAttribute("opened"),
            );
          }
        }
        if (!homeLandingFocused && document.activeElement === document.body) {
          const input = document.getElementById("nd-yt-home-input");
          if (input) {
            input.focus();
            homeLandingFocused = true;
          }
        }
        if (!homeLogoCloned) {
          const slot = document.getElementById("nd-yt-home-logo");
          const mastheadLogo =
            document.querySelector(
              "ytd-masthead ytd-topbar-logo-renderer #logo-icon svg",
            ) ||
            document.querySelector("ytd-masthead ytd-topbar-logo-renderer svg");
          if (slot && mastheadLogo) {
            // The real logo replaces the interim fallback if one rendered.
            slot.textContent = "";
            const clone = mastheadLogo.cloneNode(true);
            // Strip YouTube's scoped classes/ids: once its logo style module
            // loads, its width/fill rules would otherwise re-shrink the clone.
            clone.removeAttribute("id");
            clone.removeAttribute("class");
            clone.querySelectorAll("[class]").forEach((n) => {
              n.removeAttribute("class");
            });
            clone.querySelectorAll("[id]").forEach((n) => {
              n.removeAttribute("id");
            });
            slot.appendChild(clone);
            const countryCode = document.querySelector(
              "ytd-masthead ytd-topbar-logo-renderer #country-code",
            );
            const countryText =
              countryCode && countryCode.textContent
                ? countryCode.textContent.trim()
                : "";
            if (countryText) {
              const country = document.createElement("span");
              country.className = "nd-yt-home-country";
              country.textContent = countryText;
              slot.appendChild(country);
            }
            homeLogoCloned = true;
          } else if (
            slot &&
            !slot.firstChild &&
            document.readyState === "complete"
          ) {
            // Masthead logo not hydrated yet; show an interim icon+wordmark.
            // The flag stays false so a late real logo still replaces this.
            slot.innerHTML = `
              <svg class="nd-yt-home-logo-icon" viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><path fill="#FF0033" d="M27.4 3.1a3.5 3.5 0 0 0-2.5-2.5C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1 36.6 36.6 0 0 0 0 10c0 2.3.2 4.6.6 6.9a3.5 3.5 0 0 0 2.5 2.5c2.2.6 10.9.6 10.9.6s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5c.4-2.3.6-4.6.6-6.9 0-2.3-.2-4.6-.6-6.9z"/><path fill="#fff" d="M11.2 14.3 18.5 10l-7.3-4.3v8.6z"/></svg>
              <span class="nd-yt-home-logo-text">YouTube</span>
            `;
          }
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
      updateHomeLandingState();
      window.addEventListener("popstate", redirectToSubscriptionsFeed);
      window.addEventListener("popstate", updateHomeLandingState);
      // YouTube announces SPA navigations as DOM events; reacting to them
      // makes the landing toggle instant (interval stays as backstop).
      document.addEventListener("yt-navigate-start", updateHomeLandingState);
      document.addEventListener("yt-navigate-finish", updateHomeLandingState);
      setInterval(checkUrlChange, 300);

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
