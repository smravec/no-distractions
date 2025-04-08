/* TODO 
    right away as url changes apply display none to the whole page
    then add superficial waiting time after changing url (like second or 2) till the page loads, then remove the style and clean the page 
*/
const dont_display_style = "display: none !important;";

// HomePage
const main_feed = document.createElement("style");
main_feed.textContent = `
    div[role="main"]{
        ${dont_display_style}
    }
`;
function CleanHomePage(entering_or_leaving_bool) {
  if (entering_or_leaving_bool === true) {
    document.head.appendChild(main_feed);
  } else if (entering_or_leaving_bool === false) {
    document.head.removeChild(main_feed);
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
if (init_path === "/") {
  CleanHomePage(true);
}

// Main url change checker
let lastUrl = location.href;
let lastPathname = window.location.pathname;
const urlObserver = new MutationObserver(() => {
  const url = location.href;
  setTimeout(() => {
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
  }, 100);
});

urlObserver.observe(document, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
});
