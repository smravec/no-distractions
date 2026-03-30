export default defineContentScript({
  matches: ["https://*.reddit.com/*"],
  runAt: "document_idle",
  allFrames: true,
  main() {
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
    ].join(", ");
    const SHADOW_HOST_TAG = "left-nav-top-section";
    const observedShadowRoots = new WeakSet<ShadowRoot>();

    function hideTargetsInRoot(root: ParentNode) {
      root.querySelectorAll(HIDE_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }

    function uncloakSidebar() {
      document.documentElement.classList.add(READY_CLASS);
      document.querySelectorAll(SIDEBAR_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "";
      });
      document.querySelectorAll(DEFER_UNTIL_READY_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "";
      });
    }

    function cloakSidebar() {
      document.documentElement.classList.remove(READY_CLASS);
      document.querySelectorAll(SIDEBAR_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "hidden";
      });
      document.querySelectorAll(DEFER_UNTIL_READY_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.visibility = "hidden";
      });
    }

    function injectDocumentCss() {
      if (document.getElementById(DOC_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = DOC_STYLE_ID;
      style.textContent = `
        ${SIDEBAR_SELECTOR} {
          visibility: hidden !important;
        }

        html.${READY_CLASS} ${SIDEBAR_SELECTOR} {
          visibility: visible !important;
        }

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

    function ensureShadowCssInRoot(root: ShadowRoot) {
      if (!root.getElementById(SHADOW_STYLE_ID)) {
        const style = document.createElement("style");
        style.id = SHADOW_STYLE_ID;
        style.textContent = `${HIDE_SELECTOR} { display: none !important; }`;
        root.prepend(style);
      }

      hideTargetsInRoot(root);

      if (!observedShadowRoots.has(root)) {
        const observer = new MutationObserver(() => hideTargetsInRoot(root));
        observer.observe(root, { childList: true, subtree: true });
        observedShadowRoots.add(root);
      }

      uncloakSidebar();
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
      injectDocumentCss();
      cloakSidebar();
      hideTargetsInRoot(document);
      ensureShadowCss();
      maybeUncloakFromExistingRoot();
    }

    patchAttachShadow();

    const docObserver = new MutationObserver(applyInstantHide);
    docObserver.observe(document.documentElement, { childList: true, subtree: true });

    applyInstantHide();

    // Safety valve: avoid a permanently hidden sidebar if Reddit changes internals.
    setTimeout(uncloakSidebar, 2000);
  },
});