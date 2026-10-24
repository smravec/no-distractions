import "../assets/css/facebook.css";
import {
  fbGuardedTarget,
  fbIsHomeRedirect,
  fbIsLoggedIn,
} from "../utils/facebook-routes.js";

export default defineContentScript({
  matches: ["https://www.facebook.com/*", "https://m.facebook.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    // facebook.com iframes embedded on other sites (e.g. Instagram) stay
    // inert: facebook.content.js never manages them, so the gate class (and
    // the CSS behind it) must not go on there either.
    if (window.top !== window.self) {
      return;
    }
    const html = document.documentElement;
    html.classList.add("no-distractions-css");

    // m.facebook.com: its legacy code undoes the early main-column hide from
    // facebook.css once it runs; this class scopes those rules to m.
    if (window.location.hostname === "m.facebook.com") {
      html.classList.add("nd-fb-mobile");
      return;
    }
    if (window.location.hostname !== "www.facebook.com") {
      return;
    }

    // Hard-load fast path: bounce a blocked route (the algorithmic home,
    // reels, watch, gaming) before Facebook boots. storage.sync is async, so
    // this trusts last session's cached toggle state; facebook.content.js
    // refreshes the cache and its async redirect is the backstop.
    try {
      if (localStorage.getItem("nd-fb-enabled") !== "1" || !fbIsLoggedIn()) {
        return;
      }
      const target = fbGuardedTarget(window.location.href);
      if (target === null) {
        return;
      }
      // Pre-hide the main column until the redirect lands, so the blocked
      // page never paints. facebook.content.js owns these classes afterwards.
      html.classList.add(
        fbIsHomeRedirect(window.location.href) ? "nd-fb-home" : "nd-fb-redirect",
      );
      // facebook.content.js runs in this same isolated world and routes the
      // unchanged URL again before this navigation commits; the timestamp
      // stops it from starting a second one, which would count this load
      // twice in the loop guard and override its choice.
      window.__ndFbRedirecting = Date.now();
      window.location.replace(target);
    } catch (e) {
      // localStorage may be unavailable; the async redirect still runs.
    }
  }
});
