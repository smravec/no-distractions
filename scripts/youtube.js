// Get the extension API object in a cross-browser way
const extensionApi = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (!extensionApi || !extensionApi.runtime || !extensionApi.runtime.getURL) {
    console.error('No extension API found. This script must be run as a browser extension content script.');
} else {
    const cssUrl = extensionApi.runtime.getURL("css/youtube.css");
    console.log("Injecting CSS from:", cssUrl);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    document.documentElement.appendChild(link);
    console.log("Injected youtube.css into page");
}
    
      


  
  