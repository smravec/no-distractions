import "../assets/css/reddit.css";

export default defineContentScript({
  matches: ["https://*.reddit.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    document.documentElement.classList.add('no-distractions-css');
    try {
      if (localStorage.getItem("nd-rd-strict") === "1") {
        document.documentElement.classList.add("nd-rd-strict");
      }
    } catch (e) {
      // localStorage may be unavailable; reddit-main-feed sets the class after its storage read.
    }
  }
});