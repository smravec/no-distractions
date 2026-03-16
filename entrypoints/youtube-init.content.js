import "../assets/css/youtube.css";

export default defineContentScript({
  matches: ["https://www.youtube.com/*", "https://m.youtube.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    document.documentElement.classList.add('no-distractions-css');
  }
});