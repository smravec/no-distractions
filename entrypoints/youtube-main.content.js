export default defineContentScript({
  matches: ["https://www.youtube.com/*"],
  runAt: "document_start",
  world: "MAIN",
  registration: "manifest",
  globalName: false,
  main() {
    // Runs in the page's own world: only here can YouTube's SPA router be
    // driven directly (yt-navigate on ytd-app), so the landing's buttons
    // navigate without a full page reload.
    if (window.__ndYtMainNavBridge) {
      return;
    }
    window.__ndYtMainNavBridge = true;

    document.addEventListener("nd-yt-navigate", (e) => {
      // The isolated world passes a JSON string (objects don't cross
      // worlds reliably). Never throw into page code.
      try {
        if (typeof e.detail !== "string") {
          return;
        }
        const payload = JSON.parse(e.detail);
        const url = payload && payload.url;
        if (
          typeof url !== "string" ||
          !url.startsWith("/") ||
          url.startsWith("//")
        ) {
          return;
        }
        let endpoint = null;
        if (
          typeof payload.browseId === "string" &&
          /^[A-Za-z0-9_-]+$/.test(payload.browseId)
        ) {
          endpoint = {
            commandMetadata: { webCommandMetadata: { url: url } },
            browseEndpoint: { browseId: payload.browseId },
          };
        } else if (
          typeof payload.query === "string" &&
          payload.query.length > 0
        ) {
          endpoint = {
            commandMetadata: { webCommandMetadata: { url: url } },
            searchEndpoint: { query: payload.query },
          };
        }
        if (!endpoint) {
          return;
        }
        const app = document.querySelector("ytd-app");
        if (!app) {
          return;
        }
        app.dispatchEvent(
          new CustomEvent("yt-navigate", { detail: { endpoint: endpoint } }),
        );
      } catch (err) {
        // Silent: the isolated world falls back to a full navigation.
      }
    });
  },
});
