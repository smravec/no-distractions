export default defineContentScript({
  matches: ["https://www.instagram.com/*"],
  runAt: "document_start",
  world: "MAIN",
  registration: "manifest",
  globalName: false,
  main() {
    // Runs in the page's own world: Instagram's router calls THIS history
    // binding, so bare-/ navigations can be rewritten to the following
    // variant before they commit — no reload, no For You flash.
    if (window.__ndMainHistoryPatched) {
      return;
    }
    window.__ndMainHistoryPatched = true;

    // Returns the rewritten URL string, or null when no rewrite applies.
    function rewriteHomeUrl(url) {
      if (url === undefined || url === null) {
        return null;
      }
      const resolved = new URL(url, window.location.href);
      if (resolved.origin !== window.location.origin) {
        return null;
      }
      if (resolved.pathname !== "/" && resolved.pathname !== "") {
        return null;
      }
      if (resolved.searchParams.get("variant") === "following") {
        return null;
      }
      resolved.searchParams.set("variant", "following");
      return resolved.toString();
    }

    ["pushState", "replaceState"].forEach((fn) => {
      const orig = history[fn];
      history[fn] = function (state, title, url) {
        // The isolated-world script owns the toggle state and mirrors it
        // into this attribute; without it the patch is a pure pass-through.
        // Never throw into Instagram's code — any failure means no rewrite.
        let rewritten = null;
        try {
          if (
            document.documentElement.getAttribute("data-nd-ig") === "1"
          ) {
            rewritten = rewriteHomeUrl(url);
          }
        } catch (e) {
          rewritten = null;
        }
        if (rewritten === null) {
          return orig.apply(this, arguments);
        }
        const ret = orig.call(this, state, title, rewritten);
        document.dispatchEvent(new CustomEvent("nd-home-rewritten"));
        return ret;
      };
    });
  },
});
