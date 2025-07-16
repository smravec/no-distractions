if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.storage.sync.get(["rd"], (result) => {
  const ENABLE_RD = result.rd !== undefined ? result.rd : true;
  const html = document.documentElement;
  if (!ENABLE_RD) {
    html.classList.remove('no-distractions-css');
    console.log('Reddit blocking is disabled by toggle.');
    return;
  }
  html.classList.add('no-distractions-css');

  const extensionApi = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (extensionApi && extensionApi.runtime && extensionApi.runtime.getURL) {
    const cssUrl = extensionApi.runtime.getURL("css/reddit.css");
    fetch(cssUrl)
      .then(response => response.text())
      .then(cssText => {
        if (!document.getElementById('no-distractions-reddit-css')) {
          const style = document.createElement('style');
          style.id = 'no-distractions-reddit-css';
          style.textContent = cssText;
          document.head.appendChild(style);
          console.log("Injected reddit.css as <style> tag");
        }
      })
      .catch(err => console.error('Failed to fetch/inject reddit.css:', err));
  } else {
    console.error('No extension API found. This script must be run as a browser extension content script.');
  }
});

/* TODO (past mvp) fix on mobile does not apply on page reload*/
//Clean sidebar from /r popular and /r all
function injectCSSIntoShadow(interval) {
  const host = document.querySelector("left-nav-top-section");
  if (!host || !host.shadowRoot) return;

  const style = document.createElement("style");
  style.textContent = `
    faceplate-tracker[noun="popular"],
    faceplate-tracker[noun="all"]
    {
      display: none !important;
    }
  `;

  host.shadowRoot.appendChild(style);
  clearInterval(interval);
}

//Try injecting it
let tries = 0;
const interval = setInterval(() => {
  injectCSSIntoShadow(interval);
  if (++tries > 10) clearInterval(interval);
}, 500);
