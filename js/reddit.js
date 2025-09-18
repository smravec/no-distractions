if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.storage.sync.get(["rd", "general_switch"], (result) => {
  const GENERAL_SWITCH =
    result.general_switch !== undefined ? result.general_switch : true;
  const REDDIT_TOGGLE = result.rd !== undefined ? result.rd : true;
  const ENABLE_RD = GENERAL_SWITCH && REDDIT_TOGGLE;

  console.log("GENERAL_SWITCH", GENERAL_SWITCH);
  console.log("REDDIT_TOGGLE", REDDIT_TOGGLE);
  console.log("ENABLE_RD", ENABLE_RD);

  const html = document.documentElement;
  if (!ENABLE_RD) {
    html.classList.remove("no-distractions-css");
    console.log("Reddit blocking is disabled by toggle or general switch.");
    return;
  }
  html.classList.add("no-distractions-css");

  const extensionApi =
    typeof browser !== "undefined"
      ? browser
      : typeof chrome !== "undefined"
      ? chrome
      : null;
  if (extensionApi && extensionApi.runtime && extensionApi.runtime.getURL) {
    const cssUrl = extensionApi.runtime.getURL("css/reddit.css");
    fetch(cssUrl)
      .then((response) => response.text())
      .then((cssText) => {
        if (!document.getElementById("no-distractions-reddit-css")) {
          const style = document.createElement("style");
          style.id = "no-distractions-reddit-css";
          style.textContent = cssText;
          document.head.appendChild(style);
          console.log("Injected reddit.css as <style> tag");
        }
      })
      .catch((err) => console.error("Failed to fetch/inject reddit.css:", err));
  } else {
    console.error(
      "No extension API found. This script must be run as a browser extension content script."
    );
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

if (typeof browser === "undefined") {
  var browser = chrome;
}

let enforceRedditRAF = null;

function injectBannerAndHideFeed() {
  const main = document.querySelector(".main-container");
  const feed = document.getElementById("main-content");

  // hide feed
  if (feed) {
    feed.style.display = "none";
  }

  // center main container
  if (main) {
    main.style.display = "flex";
    main.style.justifyContent = "center";
    main.style.alignItems = "center";
    main.style.minHeight = "100vh";
  }

  // add banner
  if (main && !document.querySelector(".nd-banner")) {
    const banner = document.createElement("div");
    banner.className = "nd-banner";
    banner.style.display = "block";
    banner.style.textAlign = "center";
    banner.style.marginTop = "-100px";

    // Add image above text
    const img = document.createElement("img");
    img.src =
      typeof browser !== "undefined" &&
      browser.runtime &&
      browser.runtime.getURL
        ? browser.runtime.getURL("reddit-icon.png")
        : typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.getURL
        ? chrome.runtime.getURL("reddit-icon.png")
        : "reddit-icon.png";
    img.alt = "No Distractions Logo";
    img.width = 100;
    img.height = 100;
    banner.appendChild(img);

    // Add text below image
    const text = document.createElement("div");
    text.textContent = "Welcome to Reddit!";
    Object.assign(text.style, {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#0F1A1C",
      textAlign: "center",
      whiteSpace: "pre-line", // respect \n as line breaks
      marginTop: "-14px",
    });
    banner.appendChild(text);
    main.appendChild(banner);
  }
}

function restoreFeed() {
  const main = document.querySelector(".main-container");
  const feed = document.getElementById("main-content");
  const banner = document.querySelector(".nd-banner");

  if (feed) feed.style.display = "";
  if (banner) banner.remove();

  if (main) {
    main.style.display = "";
    main.style.justifyContent = "";
    main.style.alignItems = "";
    main.style.minHeight = "";
  }
}

function enforceRedditInjectLoop() {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;

  if (
    currentPath === "/" ||
    currentUrl === "https://www.reddit.com/?feed=home"
  ) {
    injectBannerAndHideFeed();
  } else {
    restoreFeed();
  }

  enforceRedditRAF = requestAnimationFrame(enforceRedditInjectLoop);
}

function startRedditBanner() {
  if (enforceRedditRAF) {
    cancelAnimationFrame(enforceRedditRAF);
    enforceRedditRAF = null;
  }
  enforceRedditInjectLoop();
}

let lastUrl = window.location.href;
function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    startRedditBanner();
  }
}

function initRedditCleaner() {
  if (!window._noDistractionsRedditPatched) {
    ["pushState", "replaceState"].forEach((fn) => {
      const orig = history[fn];
      history[fn] = function () {
        const ret = orig.apply(this, arguments);
        setTimeout(checkUrlChange, 0);
        return ret;
      };
    });
    window._noDistractionsRedditPatched = true;
  }

  // Run immediately and keep checking
  startRedditBanner();
  setInterval(checkUrlChange, 1000);
}

// Wait until full load before running
if (document.readyState === "complete") {
  initRedditCleaner();
} else {
  window.addEventListener("load", initRedditCleaner);
}
