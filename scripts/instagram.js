// TODO mvp block /reels and remove all article tags from / and clean /explore page

// // mobile = true, desktop = false
// let mobile_mode = null;
// if (window.screen.width <= 500) {
//   mobile_mode = true;
// } else {
//   mobile_mode = false;
// }

// const dont_display_style = "display: none !important;";

// // Universal style to clean the main content element
// const main_feed = document.createElement("style");
// main_feed.textContent = `
//     div[role="main"]{
//         ${dont_display_style}
//     }
// `;

// function CleanEntirePage(entering_or_leaving_bool) {
//   if (entering_or_leaving_bool === true) {
//     document.head.appendChild(main_feed);
//   } else {
//     document.head.removeChild(main_feed);
//   }
// }
// // Styles for mobile
// const main_feed_mobile = document.createElement("style");
// main_feed_mobile.textContent = `
//     #screen-root > div > div:nth-child(1) > div:nth-child(5) ~ * {
//       display: none !important;
//     }
//     #screen-root > div:nth-child(1)::before {
//       background-color: white !important;
//     }
//     `;

// const watch_feed_mobile = document.createElement("style");
// watch_feed_mobile.textContent = `
//     #screen-root > div > div:nth-child(3) > div:nth-child(6) ~ * {
//       display: none;
//     }
//     #screen-root > div:nth-child(1)::before {
//       background-color: white !important;
//     }
// `;

// const reels_mobile = document.createElement("style");
// reels_mobile.textContent = `
//     video{
//       display: none;
//     }
// `;

// const live_feed_mobile = document.createElement("style");
// live_feed_mobile.textContent = `
//     #screen-root > div > div:nth-child(3) > div.m.bg-s2.displayed ~ * {
//       display: none;
//     }
// `;

// function CleanEntirePageMobile(entering_or_leaving_bool, url) {
//   if (url == "/") {
//     if (entering_or_leaving_bool === true) {
//       document.head.appendChild(main_feed_mobile);
//     } else {
//       document.head.removeChild(main_feed_mobile);
//     }
//   } else if (url == "watch") {
//     if (entering_or_leaving_bool === true) {
//       document.head.appendChild(watch_feed_mobile);
//     } else {
//       document.head.removeChild(watch_feed_mobile);
//     }
//   } else if (url == "reels") {
//     if (entering_or_leaving_bool === true) {
//       document.head.appendChild(reels_mobile);
//     } else {
//       document.head.removeChild(reels_mobile);
//     }
//   } else if (url == "live") {
//     if (entering_or_leaving_bool === true) {
//       document.head.appendChild(live_feed_mobile);
//     } else {
//       document.head.removeChild(live_feed_mobile);
//     }
//   }
// }

// //Init override stylesheet styles
// const main_feed_override = document.createElement("style");
// main_feed_override.textContent = `
//     div[role="main"]{
//         display: block !important;
//     }
// `;
// document.head.appendChild(main_feed_override);

// //Init clean
// const init_path = window.location.pathname;
// if (mobile_mode === true) {
//   if (init_path === "/" || init_path === "") {
//     CleanEntirePageMobile(true, "/");
//   } else if (init_path == "/watch/") {
//     CleanEntirePageMobile(true, "watch");
//   } else if (init_path.includes("reel")) {
//     CleanEntirePageMobile(true, "reels");
//   } else if (init_path == "/watch/live/") {
//     CleanEntirePageMobile(true, "live");
//   }
// } else {
//   if (
//     init_path === "/" ||
//     init_path === "" ||
//     init_path === "/reel/" ||
//     init_path.includes("watch")
//   ) {
//     CleanEntirePage(true);
//   }
// }

// Universal style to clean the main content element
const main_feed = document.createElement("style");
main_feed.textContent = `
    article {
        display: none !important;
    }   

    div[role="progressbar"] {
        display: none !important;
    }
`;

const explore_page = document.createElement("style");
explore_page.textContent = `
    main[role="main"] > *{
    display: none !important
    }
`;

const reels_page = document.createElement("style");
reels_page.textContent = `
    main[role="main"] > *{
    display: none !important
    }
`;

function CleanEntirePage(entering_or_leaving_bool, url) {
  if (url == "/") {
    if (entering_or_leaving_bool === true) {
      document.head.appendChild(main_feed);
    } else {
      document.head.removeChild(main_feed);
    }
  }

  if (url == "/explore/") {
    if (entering_or_leaving_bool === true) {
      document.head.appendChild(explore_page);
    } else {
      document.head.removeChild(explore_page);
    }
  }

  if (url == "/reels/") {
    if (entering_or_leaving_bool === true) {
      document.head.appendChild(reels_page);
    } else {
      document.head.removeChild(reels_page);
    }
  }
}

//Init clean
const init_path = window.location.pathname;
if (init_path === "/" || init_path === "") {
  CleanEntirePage(true, "/");
}
if (init_path === "/explore/" || init_path === "/explore") {
  CleanEntirePage(true, "/explore/");
}
if (init_path.includes("/reels/")) {
  CleanEntirePage(true, "/reels/");
}

let bodyObserver = null;

// Function to set up the observer
function setupObserver() {
  // Try to find the target element
  const targetElement = document.querySelector(`main[role="main"`);
  let lastPathname = window.location.pathname;

  if (targetElement) {
    console.log("Instagram main content element found!");

    // Prevent spawning multiple observers
    if (bodyObserver !== null) {
      return;
    }

    // Observe url changes
    bodyObserver = new MutationObserver(() => {
      if (lastPathname !== window.location.pathname) {
        console.log("Path changed (body observer):", window.location.pathname);

        // Home page
        if (lastPathname == "/" || lastPathname == "") {
          console.log("removed ");

          CleanEntirePage(false, "/");
        }
        if (window.location.pathname == "/") {
          console.log("added ");
          CleanEntirePage(true, "/");
        }

        // Explore page
        if (lastPathname == "/explore/" || lastPathname == "/explore") {
          console.log("removed ");

          CleanEntirePage(false, "/explore/");
        }
        if (window.location.pathname == "/explore/") {
          console.log("added ");
          CleanEntirePage(true, "/explore/");
        }

        // Reels page
        if (lastPathname.includes("/reels")) {
          console.log("removed ");

          CleanEntirePage(false, "/reels/");
        }
        if (window.location.pathname.includes("/reels/")) {
          console.log("added ");
          CleanEntirePage(true, "/reels/");
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
