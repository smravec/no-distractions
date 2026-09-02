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
  }
});
