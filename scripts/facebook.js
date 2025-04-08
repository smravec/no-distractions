const dont_display_style = "display: none !important;";
// HomePage
const main_feed = document.createElement("style");
main_feed.textContent = `
 div[role="main"]{
${dont_display_style}
 }
`;

function CleanHomePage(entering_or_leaving_bool) {
  // Make sure document.head exists before trying to use it
  if (!document.head) {
    console.log("Head element not found. Will retry.");
    setTimeout(() => CleanHomePage(entering_or_leaving_bool), 100);
    return;
  }

  if (entering_or_leaving_bool === true) {
    // Check if the style is already applied
    if (!document.head.contains(main_feed)) {
      document.head.appendChild(main_feed);
    }
  } else if (entering_or_leaving_bool === false) {
    // Check if the style is present before removing
    if (document.head.contains(main_feed)) {
      document.head.removeChild(main_feed);
    }
  }
}

// Wait for the DOM to be ready before running init
function initExtension() {
  if (!document.body) {
    setTimeout(initExtension, 100);
    return;
  }

  //Init clean
  const init_path = window.location.pathname;
  if (init_path === "/") {
    CleanHomePage(true);
  }

  // Main url change checker
  let lastUrl = location.href;
  let lastPathname = window.location.pathname;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log("URL changed to:", url);
      // Remove old style
      if (lastPathname === "/") {
        CleanHomePage(false);
      }
      lastPathname = window.location.pathname;
      // Set new style
      if (window.location.pathname === "/") {
        CleanHomePage(true);
      }
    }
  });

  urlObserver.observe(document, {
    subtree: true,
    childList: true,
  });
}

// Start the extension
initExtension();
