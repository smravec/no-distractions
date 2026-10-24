import { FB_FRIENDS_FEED, fbIsHomeRedirect } from "../utils/facebook-routes.js";

export default defineContentScript({
  matches: ["https://www.facebook.com/*"],
  runAt: "document_start",
  world: "MAIN",
  registration: "manifest",
  globalName: false,
  main() {
    // Runs in the page's own world: Facebook's router calls THIS history
    // binding. A navigation home ("/", "/home.php") never commits; it
    // becomes a full navigation to the friends feed, with the main column
    // pre-hidden until the page unloads. A URL rewrite isn't enough: the
    // router renders the For You feed whatever URL it commits, and there is
    // no SPA route into the Feeds view, so a hidden full navigation is the
    // only way the For You feed never shows.
    if (window.__ndFbMainPatched) {
      return;
    }
    window.__ndFbMainPatched = true;

    // One navigation per unload: the router may push and replace "/" back
    // to back.
    let navigating = false;
    let valveTimer = 0;

    function release() {
      navigating = false;
      clearTimeout(valveTimer);
      document.documentElement.classList.remove("nd-fb-home");
    }

    function navigateHome(replace) {
      document.documentElement.classList.add("nd-fb-home");
      if (navigating) {
        return;
      }
      navigating = true;
      // Safety valve: if the navigation never unloads the page (e.g. the
      // user cancels a leave-page prompt), unhide and allow a retry.
      clearTimeout(valveTimer);
      valveTimer = setTimeout(release, 10000);
      const target = new URL(FB_FRIENDS_FEED, window.location.origin).toString();
      if (replace) {
        window.location.replace(target);
      } else {
        window.location.assign(target);
      }
    }

    // Back/forward cache: a restored page must not stay hidden or locked.
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        release();
      }
    });

    ["pushState", "replaceState"].forEach((fn) => {
      const orig = history[fn];
      history[fn] = function (state, title, url) {
        // The isolated-world script owns the toggle state and mirrors it
        // into this attribute; without it the patch is a pure pass-through.
        // Never throw into Facebook's code — any failure means pass-through.
        let armed = false;
        try {
          armed = document.documentElement.getAttribute("data-nd-fb") === "1";
          if (
            armed &&
            url !== undefined &&
            url !== null &&
            fbIsHomeRedirect(String(url))
          ) {
            navigateHome(fn === "replaceState");
            return undefined;
          }
        } catch (e) {
          // Fall through to the original call.
        }
        const ret = orig.apply(this, arguments);
        if (armed) {
          // Tells the isolated world a navigation committed, so it can
          // re-route without waiting for its interval.
          try {
            document.dispatchEvent(new CustomEvent("nd-fb-navigated"));
          } catch (e) {
            // Ignore: the isolated world's interval is the backstop.
          }
        }
        return ret;
      };
    });
  },
});
