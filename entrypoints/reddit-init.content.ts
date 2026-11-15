import "../assets/css/reddit.css";
// @ts-ignore -- plain JS helper, the project has no allowJs
import { cachedSiteOff } from "../utils/site-cache.js";

export default defineContentScript({
  matches: ["https://*.reddit.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    // Reddit's blocking was off last visit: leave the page alone.
    // reddit-main-feed adds the class if it has been turned back on.
    if (cachedSiteOff("rd")) {
      return;
    }
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