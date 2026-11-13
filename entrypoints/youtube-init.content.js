import "../assets/css/youtube.css";

export default defineContentScript({
  matches: ["https://www.youtube.com/*", "https://m.youtube.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    document.documentElement.classList.add('no-distractions-css');
    // Synchronous gate for the desktop home landing page: pre-hides the home
    // feed before it can paint. The idle script owns the class afterwards
    // (toggles it on SPA navigation, removes it when the extension is off).
    if (
      window.location.hostname === "www.youtube.com" &&
      (window.location.pathname === "/" || window.location.pathname === "")
    ) {
      document.documentElement.classList.add("nd-yt-home");
    }
    // Strict mode pre-hide from last session's cached state; the idle script
    // corrects both classes once storage answers. Never redirects from here.
    try {
      if (localStorage.getItem("nd-yt-strict") === "1") {
        document.documentElement.classList.add("nd-yt-strict");
        if (/^\/feed\/subscriptions\/?$/.test(window.location.pathname)) {
          document.documentElement.classList.add("nd-yt-subs-page");
        }
      }
    } catch (e) {
      // localStorage unavailable; the idle script still applies strict mode.
    }
  }
});
