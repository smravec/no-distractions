export default defineContentScript({
  matches: [
    "*://*.facebook.com/*",
    "*://*.instagram.com/*",
    "*://*.reddit.com/*",
    "*://*.youtube.com/*",
  ],
  runAt: "document_start",
  main() {
    document.documentElement.classList.add("no-distractions-css");
  },
});
