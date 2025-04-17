// /* TODO (not in the scope of mvp)
//     right away as url changes apply display none to the whole page
//     then add superficial waiting time after changing url (like second or 2) till the page loads, then remove the style and clean the page
// */

// /* TODO make it so only feed items without join or follow in the name get displayed, otherwise they get display none (also hide the reels tab)

// Stops from running on other sites which just use facebook.com in a iframe (like instagram)
let isTopFrame = false;
let currentDomain = window.location.hostname;

try {
  // Try to access top frame location
  if (window.top.location.hostname === window.location.hostname) {
    isTopFrame = true;
  }
} catch (e) {
  // Security error means we're in a cross-origin iframe
  console.log("Cross-origin frame detected, running in an iframe");
  isTopFrame = false;
}

if (isTopFrame && currentDomain.includes("facebook")) {
  // mobile = true, desktop = false
  let mobile_mode = null;
  if (window.screen.width <= 500) {
    mobile_mode = true;
  } else {
    mobile_mode = false;
  }

  const dont_display_style = "display: none !important;";

  // Universal style to clean the main content element
  const main_feed = document.createElement("style");
  main_feed.textContent = `
    div[role="main"]{
        ${dont_display_style}
    }
`;

  function CleanEntirePage(entering_or_leaving_bool) {
    if (entering_or_leaving_bool === true) {
      document.head.appendChild(main_feed);
    } else {
      document.head.removeChild(main_feed);
    }
  }
  // Styles for mobile
  const main_feed_mobile = document.createElement("style");
  main_feed_mobile.textContent = `
    #screen-root > div > div:nth-child(1) > div:nth-child(5) ~ * {
      display: none !important;
    }
    #screen-root > div:nth-child(1)::before {
      background-color: white !important;
    }  
    `;

  const watch_feed_mobile = document.createElement("style");
  watch_feed_mobile.textContent = `
    #screen-root > div > div:nth-child(3) > div:nth-child(6) ~ * {
      display: none;
    }
    #screen-root > div:nth-child(1)::before {
      background-color: white !important;
    }  
`;

  const reels_mobile = document.createElement("style");
  reels_mobile.textContent = `
    video{
      display: none;
    }  
`;

  const live_feed_mobile = document.createElement("style");
  live_feed_mobile.textContent = `
    #screen-root > div > div:nth-child(3) > div.m.bg-s2.displayed ~ * {
      display: none;
    } 
`;

  function CleanEntirePageMobile(entering_or_leaving_bool, url) {
    if (url == "/") {
      if (entering_or_leaving_bool === true) {
        document.head.appendChild(main_feed_mobile);
      } else {
        document.head.removeChild(main_feed_mobile);
      }
    } else if (url == "watch") {
      if (entering_or_leaving_bool === true) {
        document.head.appendChild(watch_feed_mobile);
      } else {
        document.head.removeChild(watch_feed_mobile);
      }
    } else if (url == "reels") {
      if (entering_or_leaving_bool === true) {
        document.head.appendChild(reels_mobile);
      } else {
        document.head.removeChild(reels_mobile);
      }
    } else if (url == "live") {
      if (entering_or_leaving_bool === true) {
        document.head.appendChild(live_feed_mobile);
      } else {
        document.head.removeChild(live_feed_mobile);
      }
    }
  }

  //Init override stylesheet styles
  const main_feed_override = document.createElement("style");
  main_feed_override.textContent = `
    div[role="main"]{
        display: block !important;
    }
`;
  document.head.appendChild(main_feed_override);

  //Init clean
  const init_path = window.location.pathname;
  if (mobile_mode === true) {
    if (init_path === "/" || init_path === "") {
      CleanEntirePageMobile(true, "/");
    } else if (init_path == "/watch/") {
      CleanEntirePageMobile(true, "watch");
    } else if (init_path.includes("reel")) {
      CleanEntirePageMobile(true, "reels");
    } else if (init_path == "/watch/live/") {
      CleanEntirePageMobile(true, "live");
    }
  } else {
    if (
      init_path === "/" ||
      init_path === "" ||
      init_path === "/reel/" ||
      init_path.includes("watch")
    ) {
      CleanEntirePage(true);
    }
  }

  let bodyObserver = null;

  // Function to set up the observer
  function setupObserver() {
    targetElementSelector = null;
    // Based on mode pick target element
    if (mobile_mode === true) {
      targetElementSelector = `#screen-root`;
    } else {
      targetElementSelector = 'div[role="main"]';
    }

    // Try to find the target element
    const targetElement = document.querySelector(targetElementSelector);
    let lastPathname = window.location.pathname;

    if (targetElement) {
      console.log("Facebook main content element found!");

      // Prevent spawning multiple observers
      if (bodyObserver !== null) {
        return;
      }

      // Observe url changes
      bodyObserver = new MutationObserver(() => {
        if (lastPathname !== window.location.pathname) {
          console.log(
            "Path changed (body observer):",
            window.location.pathname
          );

          if (mobile_mode === true) {
            console.log("mobile mode");
            // Main page
            if (lastPathname == "/" || lastPathname == "") {
              CleanEntirePageMobile(false, "/");
            }
            if (
              window.location.pathname == "/" ||
              window.location.pathname == ""
            ) {
              CleanEntirePageMobile(true, "/");
            }

            // Watch page
            if (lastPathname == "/watch/") {
              CleanEntirePageMobile(false, "watch");
            }
            if (window.location.pathname == "/watch/") {
              CleanEntirePageMobile(true, "watch");
            }

            // Reels page
            if (lastPathname.includes("reel")) {
              CleanEntirePageMobile(false, "reels");
            }
            if (window.location.pathname.includes("reel")) {
              CleanEntirePageMobile(true, "reels");
            }

            // Live page
            if (lastPathname == "/watch/live/") {
              CleanEntirePageMobile(false, "live");
            }
            if (window.location.pathname == "/watch/live/") {
              CleanEntirePageMobile(true, "live");
            }
          } else {
            if (
              window.location.pathname == "/" ||
              window.location.pathname == "" ||
              window.location.pathname == "/reel/" ||
              window.location.pathname == "/reel" ||
              window.location.pathname.includes("watch")
            ) {
              CleanEntirePage(true);
            } else if (
              lastPathname == "/" ||
              lastPathname == "" ||
              lastPathname == "/reel/" ||
              lastPathname == "/reel" ||
              lastPathname.includes("watch")
            ) {
              CleanEntirePage(false);
            }
          }
          lastPathname = window.location.pathname;
        }
      });

      bodyObserver.observe(document.body, { childList: true, subtree: true });

      return bodyObserver;
    } else {
      console.log("Main content element not found yet, will retry...");
      // Retry
      setTimeout(setupObserver, 1000);
      return null;
    }
  }

  // Whichever is soonest creates the observer (other chunks wont spawn another)

  // Run the setup with a slight delay to ensure Facebook's UI is loaded
  setTimeout(setupObserver, 500);

  // Also set up on page load events
  window.addEventListener("load", () => {
    console.log("Window loaded, setting up observer...");
    setupObserver();
  });

  // Listen for Facebook's navigation events
  window.addEventListener("popstate", () => {
    console.log("Navigation detected via popstate");
    setupObserver();
  });
}
