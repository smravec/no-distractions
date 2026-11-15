import "../assets/css/instagram.css";
import { cachedSiteOff } from "../utils/site-cache.js";

export default defineContentScript({
  matches: ["https://www.instagram.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    // Instagram's blocking was off last visit: leave the page alone.
    // instagram.content.js adds the classes if it has been turned back on.
    if (cachedSiteOff("ig")) {
      return;
    }
    const html = document.documentElement;
    html.classList.add("no-distractions-css");
    // Strict mode from last session's cache, so the home feed is hidden
    // before it paints. instagram.content.js owns these classes afterwards.
    try {
      if (
        localStorage.getItem("nd-ig-enabled") === "1" &&
        localStorage.getItem("nd-ig-strict") === "1"
      ) {
        html.classList.add("nd-ig-strict");
      }
    } catch (e) {
      // localStorage may be unavailable; instagram.content.js sets the class.
    }
    if (window.location.pathname === "/" || window.location.pathname === "") {
      html.classList.add("ig-main-feed");
    }
  }
});
