//TODO 
//make it remove the css just in time when the page loads (the next page) and not on timeout of fixed 1.5s

let cssInjected = false;

function injectCSS() {
  // Prevent multiple injections
  if (cssInjected) return;
  
  const style = document.createElement('style');
  style.id = 'reddit-no-recommendations-style';
  style.textContent = `
    #subgrid-container {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
  cssInjected = true;
  console.log('CSS injected for homepage');
  
}

// Function to remove CSS
function removeCSS() {
  const style = document.getElementById('reddit-no-recommendations-style');
  if (style && !cleanCurrentUrl()) {
    style.remove();
    cssInjected = false;
    console.log('CSS removed');
  }
}

// Decide if current page is one among those that should be cleaned
function cleanCurrentUrl() {
  const path = window.location.pathname;
  return path === "/" || path === "/r/all/" || path === "/r/popular/";
}

// Function to update CSS based on current URL
function updateCSS() {
  if (cleanCurrentUrl()) {
    injectCSS();
  } else if (cssInjected) {
    setTimeout(() => {
      removeCSS();
    }, 1500);
  }
}

// Initial check and setup
updateCSS();

// Handle navigation in single-page apps
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to:', url);
    // Wait a moment for the page to update
    setTimeout(updateCSS, 50);
  }
});

// Start observing with a more comprehensive configuration
urlObserver.observe(document, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true
});

// Also watch for popstate events (browser back/forward buttons)
window.addEventListener('popstate', function() {
  console.log('Popstate event detected');
  setTimeout(updateCSS, 50);
});

// Watch for Reddit's internal navigation events
document.addEventListener('click', function(e) {
  // Check if clicking on a Reddit internal link
  const closest = e.target.closest('a[href^="/"]');
  if (closest) {
    console.log('Internal navigation detected');
    setTimeout(updateCSS, 50);
  }
});
  


