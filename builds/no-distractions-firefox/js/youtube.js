if (typeof browser === "undefined") {
    var browser = chrome;
  }

browser.storage.sync.get(["yt", "general_switch"], (result) => {
  const GENERAL_SWITCH = result.general_switch !== undefined ? result.general_switch : true;
  const YOUTUBE_TOGGLE = result.yt !== undefined ? result.yt : true;
  const ENABLE_YOUTUBE_CSS = GENERAL_SWITCH && YOUTUBE_TOGGLE;
  
  console.log("GENERAL_SWITCH", GENERAL_SWITCH);
  console.log("YOUTUBE_TOGGLE", YOUTUBE_TOGGLE);
  console.log("ENABLE_YOUTUBE_CSS", ENABLE_YOUTUBE_CSS);

  const html = document.documentElement;

  if (!ENABLE_YOUTUBE_CSS) {
    html.classList.remove('no-distractions-css');
    console.log('YouTube CSS injection is disabled by toggle or general switch.');
    return;
  }

  html.classList.add('no-distractions-css');

  const extensionApi = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  if (extensionApi && extensionApi.runtime && extensionApi.runtime.getURL) {
    const cssUrl = extensionApi.runtime.getURL("css/youtube.css");
    fetch(cssUrl)
        .then(response => response.text())
        .then(cssText => {
            // Prevent double-injection
            if (!document.getElementById('no-distractions-youtube-css')) {
                const style = document.createElement('style');
                style.id = 'no-distractions-youtube-css';
                style.textContent = cssText;
                document.head.appendChild(style);
                console.log("Injected youtube.css as <style> tag");
            }
        })
        .catch(err => console.error('Failed to fetch/inject youtube.css:', err));
  } else {
    console.error('No extension API found. This script must be run as a browser extension content script.');
  }
}); 