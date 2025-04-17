// TODO fix styles flickering on the main feed
// (there is display none on article should just find suggested posts headline and remove everything below )

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

const explore_page_mobile = document.createElement("style");
explore_page_mobile.textContent = `
    main[role="main"] > *:not(nav){
    display: none !important;
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

  if (url == "/explore-mobile/") {
    if (entering_or_leaving_bool === true) {
      document.head.appendChild(explore_page_mobile);
    } else {
      document.head.removeChild(explore_page_mobile);
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
if (
  (init_path === "/explore/" || init_path === "/explore") &&
  window.screen.width <= 500
) {
  CleanEntirePage(true, "/explore-mobile/");
}

if (
  (init_path === "/explore/" || init_path === "/explore") &&
  window.screen.width > 500
) {
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
        // Diferent version for mobile & desktop
        // Mobile
        if (window.screen.width <= 500) {
          if (lastPathname == "/explore/" || lastPathname == "/explore") {
            console.log("removed");
            CleanEntirePage(false, "/explore-mobile/");
          }
          if (window.location.pathname == "/explore/") {
            console.log("added");
            CleanEntirePage(true, "/explore-mobile/");
          }
        }
        // Desktop
        else {
          if (lastPathname == "/explore/" || lastPathname == "/explore") {
            console.log("removed ");

            CleanEntirePage(false, "/explore/");
          }
          if (window.location.pathname == "/explore/") {
            console.log("added ");
            CleanEntirePage(true, "/explore/");
          }
        }

        // Reels page
        if (lastPathname.includes("/reels")) {
          console.log("removed");

          CleanEntirePage(false, "/reels/");
        }
        if (window.location.pathname.includes("/reels/")) {
          console.log("added");
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
