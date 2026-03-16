import "../assets/css/instagram.css";

export default defineContentScript({
  matches: ["https://www.instagram.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    document.documentElement.classList.add('no-distractions-css');
  }
});