import "../assets/css/reddit.css";

export default defineContentScript({
  matches: ["https://*.reddit.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    document.documentElement.classList.add('no-distractions-css');
  }
});