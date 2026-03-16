import "../assets/css/facebook.css";

export default defineContentScript({
  matches: ["https://www.facebook.com/*", "https://m.facebook.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    document.documentElement.classList.add('no-distractions-css');
  }
});