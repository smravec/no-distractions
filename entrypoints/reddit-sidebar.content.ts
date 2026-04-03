export default defineContentScript({
  matches: ["https://*.reddit.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    let ENABLE_RD = true as any;
    const EARLY_CLOAK_STYLE_ID = "nd-reddit-sidebar-early-cloak";
    const DOC_STYLE_ID = "no-distractions-doc-popular-style";
    const SHADOW_STYLE_ID = "no-distractions-shadow-popular-style";
    const READY_CLASS = "nd-reddit-sidebar-ready";
    const SIDEBAR_SELECTOR = "reddit-sidebar-nav#left-sidebar";
    const DEFER_UNTIL_READY_SELECTOR = [
      "li.left-nav-create-community-button",
      "li.left-nav-manage-communities-link",
    ].join(", ");
    const HIDE_SELECTOR = [
      "faceplate-tracker[noun='popular']",
      "li#popular-posts",
      "a[href='/r/popular/']",
      "faceplate-tracker[noun='explore']",
      "li#explore-communities",
      "a[href='/explore/']",
      "faceplate-tracker[noun='news']",
      "li#news-posts",
      "a[href='/news/']",
      "faceplate-tracker[noun='games_drawer']",
      "games-section-badge-controller",
      "[aria-controls='games_section']",
      "#games_section",
      "faceplate-tracker[noun='games_drawer_featured_game']",
      "faceplate-tracker[noun='games_drawer_discover']",
      "a[href='/r/GamesOnReddit']",
      "reddit-sidebar-nav#left-sidebar > nav > hr.w-100.my-sm.border-neutral-border-weak:first-of-type",
      "faceplate-tracker[noun='rereddit_menu']",
      "faceplate-tracker[noun='rereddit_translated_pt_br_menu']",
      "faceplate-tracker[noun='rereddit_translated_de_menu']",
      "faceplate-tracker[noun='rereddit_translated_de_menu'] + hr.my-sm",
    ].join(", ");
    const SHADOW_HOST_TAG = "left-nav-top-section";
    const observedShadowRoots = new WeakSet<ShadowRoot>();
    const MIN_CLOAK_MS = 700;
    const MAX_CLOAK_MS = 2500;
    let cloakStartedAt = Date.now();
    let hasUncloaked = false;
    let hasScheduledUncloak = false;

    function showTargetsInRoot(root: ParentNode) {
      root.querySelectorAll(HIDE_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.display = "";
      });
    }

    function resetDeferredVisibility() {
      document.querySelectorAll(DEFER_UNTIL_READY_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "";
      });
    }

    function removeDocumentCss() {
      const style = document.getElementById(DOC_STYLE_ID);
      if (style) style.remove();
    }

    function removeShadowCss() {
      const hosts = document.querySelectorAll(SHADOW_HOST_TAG);
      hosts.forEach((host) => {
        if (!host.shadowRoot) return;
        const style = host.shadowRoot.getElementById(SHADOW_STYLE_ID);
        if (style) style.remove();
        showTargetsInRoot(host.shadowRoot);
      });
    }

    function installEarlyCloakStyle() {
      if (document.getElementById(EARLY_CLOAK_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = EARLY_CLOAK_STYLE_ID;
      style.textContent = `
        ${SIDEBAR_SELECTOR} {
          position: relative !important;
          isolation: isolate;
        }

        ${SIDEBAR_SELECTOR}::after {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--color-neutral-background, #ffffff);
          z-index: 2147483647;
          pointer-events: auto;
        }

        html.${READY_CLASS} ${SIDEBAR_SELECTOR}::after {
          display: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    function hideTargetsInRoot(root: ParentNode) {
      root.querySelectorAll(HIDE_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }

    function uncloakSidebar() {
      if (hasUncloaked) return;
      hasUncloaked = true;

      const earlyStyle = document.getElementById(EARLY_CLOAK_STYLE_ID);
      if (earlyStyle) earlyStyle.remove();

      document.documentElement.classList.add(READY_CLASS);
      document.querySelectorAll(DEFER_UNTIL_READY_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "";
      });
    }

    function cloakSidebar() {
      if (hasUncloaked) return;
      document.documentElement.classList.remove(READY_CLASS);
      document.querySelectorAll(DEFER_UNTIL_READY_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "hidden";
      });
    }

    function resetCloakCycle() {
      cloakStartedAt = Date.now();
      hasUncloaked = false;
      hasScheduledUncloak = false;
    }

    function injectDocumentCss() {
      if (document.getElementById(DOC_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = DOC_STYLE_ID;
      style.textContent = `
        ${DEFER_UNTIL_READY_SELECTOR} {
          visibility: hidden !important;
        }

        html.${READY_CLASS} ${DEFER_UNTIL_READY_SELECTOR} {
          visibility: visible !important;
        }

        ${HIDE_SELECTOR} {
          display: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    function scheduleUncloak() {
      if (hasUncloaked || hasScheduledUncloak) return;
      hasScheduledUncloak = true;
      const elapsed = Date.now() - cloakStartedAt;
      const delay = Math.max(0, MIN_CLOAK_MS - elapsed);
      setTimeout(uncloakSidebar, delay);
    }

    function ensureShadowCssInRoot(root: ShadowRoot) {
      if (ENABLE_RD) {
        if (!root.getElementById(SHADOW_STYLE_ID)) {
          const style = document.createElement("style");
          style.id = SHADOW_STYLE_ID;
          style.textContent = `${HIDE_SELECTOR} { display: none !important; }`;
          root.prepend(style);
        }
        hideTargetsInRoot(root);
      } else {
        const style = root.getElementById(SHADOW_STYLE_ID);
        if (style) style.remove();
        showTargetsInRoot(root);
      }

      if (!observedShadowRoots.has(root)) {
        const observer = new MutationObserver(() => ensureShadowCssInRoot(root));
        observer.observe(root, { childList: true, subtree: true });
        observedShadowRoots.add(root);
      }

      if (ENABLE_RD) scheduleUncloak();
    }

    function maybeUncloakFromExistingRoot() {
      const host = document.querySelector(SHADOW_HOST_TAG);
      if (!host || !host.shadowRoot) return;
      ensureShadowCssInRoot(host.shadowRoot);
    }

    function ensureShadowCss() {
      const hosts = document.querySelectorAll(SHADOW_HOST_TAG);
      hosts.forEach((host) => {
        if (host.shadowRoot) ensureShadowCssInRoot(host.shadowRoot);
      });
    }

    function patchAttachShadow() {
      // @ts-ignore - One-time patch marker for dev reloads
      if (window.__ndRedditPopularShadowPatched) return;

      const originalAttachShadow = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function (init: ShadowRootInit): ShadowRoot {
        const root = originalAttachShadow.call(this, init);

        if ((this as Element).tagName.toLowerCase() === SHADOW_HOST_TAG) {
          ensureShadowCssInRoot(root);
        }

        return root;
      };

      // @ts-ignore - One-time patch marker for dev reloads
      window.__ndRedditPopularShadowPatched = true;
    }

    function applyInstantHide() {
      if (!ENABLE_RD) {
        removeDocumentCss();
        removeShadowCss();
        showTargetsInRoot(document);
        resetDeferredVisibility();
        document.documentElement.classList.remove(READY_CLASS);

        const earlyStyle = document.getElementById(EARLY_CLOAK_STYLE_ID);
        if (earlyStyle) earlyStyle.remove();

        hasUncloaked = true;
        return;
      }

      injectDocumentCss();
      hideTargetsInRoot(document);
      ensureShadowCss();
      maybeUncloakFromExistingRoot();
    }

    function syncRedditSidebarState() {
      if (!ENABLE_RD) {
        applyInstantHide();
        return;
      }

      resetCloakCycle();
      installEarlyCloakStyle();
      cloakSidebar();
      applyInstantHide();

      // Safety valve: avoid a permanently hidden sidebar if Reddit changes internals.
      setTimeout(uncloakSidebar, MAX_CLOAK_MS);
    }

    browser.storage.sync.get(["rd", "general_switch"]).then((result) => {
      const GENERAL_SWITCH =
        result.general_switch !== undefined ? result.general_switch : true;
      const REDDIT_TOGGLE = result.rd !== undefined ? result.rd : true;
      ENABLE_RD = GENERAL_SWITCH && REDDIT_TOGGLE;
      syncRedditSidebarState();
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && (changes.rd || changes.general_switch)) {
        browser.storage.sync.get(["rd", "general_switch"]).then((result) => {
          const GENERAL_SWITCH =
            result.general_switch !== undefined ? result.general_switch : true;
          const REDDIT_TOGGLE = result.rd !== undefined ? result.rd : true;
          ENABLE_RD = GENERAL_SWITCH && REDDIT_TOGGLE;
          syncRedditSidebarState();
        });
      }
    });

    patchAttachShadow();

    const docObserver = new MutationObserver(applyInstantHide);
    docObserver.observe(document.documentElement, { childList: true, subtree: true });

    syncRedditSidebarState();
  },
});