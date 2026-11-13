import './style.css';
import { STRICT_KEYS, STRICT_SITES } from "../../utils/strict.js";

let general_switch = true;
let yt = true;
let fb = true;
let ig = true;
let rd = true;

// Helper to update main menu title
function updateMainMenuTitle(paused) {
  const mainMenuTitle = document.querySelector(".main_menu_title");
  if (mainMenuTitle) {
    mainMenuTitle.innerHTML = paused
      ? "Temporarily <br/> turned off"
      : "Removing <br/> distractions";
  }
}

// Helper to update main menu loading animation
function updateMainMenuLoading(paused) {
  const loadingElem = document.querySelector(".main_menu_loading");
  if (!loadingElem) return;
  if (paused) {
    loadingElem.classList.add("paused-dots");
  } else {
    loadingElem.classList.remove("paused-dots");
  }
}

// Update both title and dots when paused/unpaused
function setPausedState(paused) {
  updateMainMenuTitle(paused);
  updateMainMenuLoading(paused);
}

// Helper to update settings button text
function updateSettingsButtonText(btn, isOn) {
  btn.textContent = isOn ? "On" : "Off";
}

// Match YouTube by exact hostname so music.youtube.com is never reloaded.
function isBlockedYouTubeUrl(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return hostname === "www.youtube.com" || hostname === "m.youtube.com";
  } catch (e) {
    return false;
  }
}

// Youtube button
const yt_btn = document.getElementById("youtube")
browser.storage.sync.get(["yt"]).then((result) => {
  yt = result.yt !== undefined ? result.yt : true;
  yt_btn.style.borderColor = yt ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(yt_btn, yt);
  renderStrict("yt");
});

yt_btn.addEventListener("click", () => {
  yt = !yt;
  yt_btn.style.borderColor = yt ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(yt_btn, yt);
  renderStrict("yt");
  browser.storage.sync.set({ yt });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && isBlockedYouTubeUrl(tab.url) && tab.id) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// Facebook button
const fb_btn = document.getElementById("facebook")
browser.storage.sync.get(["fb"]).then((result) => {
  fb = result.fb !== undefined ? result.fb : true;
  fb_btn.style.borderColor = fb ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(fb_btn, fb);
  renderStrict("fb");
});

fb_btn.addEventListener("click", () => {
  fb = !fb;
  fb_btn.style.borderColor = fb ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(fb_btn, fb);
  renderStrict("fb");
  browser.storage.sync.set({ fb });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes("facebook.com") && tab.id) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// Instagram button
const ig_btn = document.getElementById("instagram")
browser.storage.sync.get(["ig"]).then((result) => {
  ig = result.ig !== undefined ? result.ig : true;
  ig_btn.style.borderColor = ig ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(ig_btn, ig);
  renderStrict("ig");
});

ig_btn.addEventListener("click", () => {
  ig = !ig;
  ig_btn.style.borderColor = ig ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(ig_btn, ig);
  renderStrict("ig");
  browser.storage.sync.set({ ig });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes("instagram.com") && tab.id) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// Reddit button
const rd_btn = document.getElementById("reddit")
browser.storage.sync.get(["rd"]).then((result) => {
  rd = result.rd !== undefined ? result.rd : true;
  rd_btn.style.borderColor = rd ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(rd_btn, rd);
  renderStrict("rd");
});

rd_btn.addEventListener("click", () => {
  rd = !rd;
  rd_btn.style.borderColor = rd ? "var(--green)" : "var(--red)";
  updateSettingsButtonText(rd_btn, rd);
  renderStrict("rd");
  browser.storage.sync.set({ rd });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes("reddit.com") && tab.id) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// ===== STRICT MODE (per site) =====
// Off by default. Dimmed while the site's blocking is off; locked "On" when
// the enterprise policy forces strictMode.
const GRAY = "var(--line)";
const strictState = { yt: false, fb: false, ig: false, rd: false };
let strictForced = false;

const strictButtons = {
  yt: document.getElementById("yt_strict"),
  fb: document.getElementById("fb_strict"),
  ig: document.getElementById("ig_strict"),
  rd: document.getElementById("rd_strict"),
};

function siteBlockOn(site) {
  return { yt, fb, ig, rd }[site];
}

function siteTabMatches(site, url) {
  if (!url) return false;
  if (site === "yt") return isBlockedYouTubeUrl(url);
  if (site === "fb") return url.includes("facebook.com");
  if (site === "ig") return url.includes("instagram.com");
  if (site === "rd") return url.includes("reddit.com");
  return false;
}

function reloadSiteTabs(site) {
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && siteTabMatches(site, tab.url)) {
        browser.tabs.reload(tab.id);
      }
    });
  });
}

const STRICT_HINTS = {
  yt: "Also hide your Subscriptions feed",
  fb: "Also hide your Friends feed",
  ig: "Also hide your Following feed",
  rd: "Also hide your communities list",
};

function renderStrict(site) {
  const btn = strictButtons[site];
  if (!btn) return;
  const on = strictForced || strictState[site];
  btn.textContent = on ? "On" : "Off";
  btn.style.borderColor = !strictForced && on ? "var(--green)" : GRAY;
  btn.classList.toggle("locked", strictForced);
  btn.classList.toggle("dimmed", !siteBlockOn(site));
  btn.title = strictForced
    ? "Strict mode is set by your organisation"
    : !siteBlockOn(site)
      ? "Turn on blocking for this site first"
      : STRICT_HINTS[site];
}

function renderAllStrict() {
  STRICT_SITES.forEach(renderStrict);
}

browser.storage.sync.get(Object.values(STRICT_KEYS)).then((result) => {
  STRICT_SITES.forEach((site) => {
    strictState[site] = result[STRICT_KEYS[site]] === true;
  });
  renderAllStrict();
});

STRICT_SITES.forEach((site) => {
  strictButtons[site]?.addEventListener("click", () => {
    if (strictForced || !siteBlockOn(site)) return; // locked / dimmed
    strictState[site] = !strictState[site];
    renderStrict(site);
    browser.storage.sync.set({ [STRICT_KEYS[site]]: strictState[site] });
    reloadSiteTabs(site);
  });
});

// General switch button
const general_switch_btn = document.getElementById("general_switch")

// ===== ENTERPRISE POLICY (managed storage) =====
// When the enterprise policy sets allowPause=false, the popup is locked down:
// the pause button reads "Extension Locked" and does nothing, the settings
// page is hidden, and the review prompt takes the settings button's place at
// the bottom. storage.managed is read-only for the user, so this can't be
// toggled from inside the browser.
let pauseAllowed = true;

function applyPausePolicy() {
  const locked = !pauseAllowed;
  general_switch_btn.classList.toggle("locked", locked);
  document.getElementById("toggle_settings").style.display = locked ? "none" : "";
  if (locked) {
    // Force the main view; settings and confirmation menus are inaccessible.
    document.getElementById("settings_menu").style.display = "none";
    document.getElementById("confirmation_menu").style.display = "none";
    document.getElementById("strict_info_menu").style.display = "none";
    document.getElementById("main_menu").style.display = "flex";
    // The review prompt takes the settings button's slot at the bottom.
    document.getElementById("main_menu").appendChild(rateLink);
    rateLink.classList.add("bottom");
  } else {
    document.querySelector(".main_menu_container").appendChild(rateLink);
    rateLink.classList.remove("bottom");
  }
  updateCountdownDisplay();
  updateRateButtonVisibility();
}

browser.storage.managed
  .get({ allowPause: true, strictMode: false })
  .then((result) => {
    pauseAllowed = !result || result.allowPause !== false;
    strictForced = !!result && result.strictMode === true;
    applyPausePolicy();
    renderAllStrict();
  })
  .catch(() => {
    // storage.managed unavailable (no policy configured) — pausing stays allowed
  });

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "managed" && changes.allowPause) {
    pauseAllowed = changes.allowPause.newValue !== false;
    applyPausePolicy();
  }
  if (area === "managed" && changes.strictMode) {
    strictForced = changes.strictMode.newValue === true;
    renderAllStrict();
  }
});

function updateCountdownDisplay() {
  browser.storage.sync.get(["general_switch", "general_switch_timer"]).then((result) => {
    general_switch = result.general_switch !== undefined ? result.general_switch : true;

    general_switch_btn.style.borderColor = pauseAllowed
      ? general_switch
        ? "var(--green)"
        : "var(--red)"
      : "var(--line)";
    general_switch_btn.textContent = pauseAllowed
      ? "Turn off blocking"
      : "Extension Locked";

    if (pauseAllowed && !general_switch && result.general_switch_timer) {
      const timeRemaining = result.general_switch_timer.expiryTime - Date.now();
      if (timeRemaining > 0) {
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        general_switch_btn.textContent = `Reverts back in: ${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
    }
    setPausedState(!general_switch);
  });
}

updateCountdownDisplay();
setInterval(updateCountdownDisplay, 1000);

general_switch_btn.addEventListener("click", () => {
  if (!pauseAllowed) return; // policy: pausing disabled
  if (general_switch) {
    showConfirmationMenu();
  } else {
    browser.alarms.clear("general_switch_timer");
    browser.storage.sync.set({ general_switch: true });
    browser.storage.sync.remove(["general_switch_timer"]);
    setPausedState(false);

    browser.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (
          tab.url &&
          (tab.url.includes("facebook.com") ||
            tab.url.includes("instagram.com") ||
            tab.url.includes("reddit.com") ||
            isBlockedYouTubeUrl(tab.url)) && tab.id
        ) {
          browser.tabs.reload(tab.id);
        }
      });
    });
  }
});

// Settings menu toggle logic
const settingsBtn = document.getElementById("toggle_settings")
const mainMenu = document.getElementById("main_menu")
const settingsMenu = document.getElementById("settings_menu")

settingsBtn.addEventListener("click", () => {
  if (!pauseAllowed) return; // policy: settings disabled
  mainMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

// Strict mode explainer (info button in the settings header)
const strictInfoMenu = document.getElementById("strict_info_menu")
document.getElementById("strict_info").addEventListener("click", () => {
  settingsMenu.style.display = "none";
  strictInfoMenu.style.display = "flex";
});
document.getElementById("strict_info_back").addEventListener("click", () => {
  strictInfoMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

// Back to main menu logic
const backBtn = document.getElementById("toggle_main_menu")

backBtn.addEventListener("click", () => {
  mainMenu.style.display = "flex";
  settingsMenu.style.display = "none";
});

// Confirmation menu logic
// A new random code every time, so typing it never becomes muscle memory.
let expectedCode = "";
function newConfirmationCode() {
  const digits = new Uint8Array(4);
  crypto.getRandomValues(digits);
  expectedCode = Array.from(digits, (d) => String(d % 10)).join("");
  document.getElementById("confirmation_code").textContent = expectedCode.split("").join(" ");
}

function showConfirmationMenu() {
  const confirmationMenu = document.getElementById("confirmation_menu")
  newConfirmationCode();
  // Start empty: digits left from an earlier open (e.g. before a policy lock)
  // would sit next to the new code and block typing.
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`confirmation_input_${i}`)
    if (input) {
      input.value = "";
      input.style.borderColor = "var(--green)";
    }
  }
  mainMenu.style.display = "none";
  confirmationMenu.style.display = "flex";
  document.getElementById("confirmation_input_1")?.focus();
}

function hideConfirmationMenu() {
  const confirmationMenu = document.getElementById("confirmation_menu")
  confirmationMenu.style.display = "none";
  mainMenu.style.display = "flex";

  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`confirmation_input_${i}`)
    if (input) {
      input.value = "";
      input.style.borderColor = "var(--green)";
    }
  }
}

function turnOffBlocking() {
  general_switch = false;
  const ONE_HOUR_MS = 1 * 60 * 60 * 1000;
  const expiryTime = Date.now() + ONE_HOUR_MS;

  browser.storage.sync.set({
    general_switch: false,
    general_switch_timer: {
      expiryTime: expiryTime,
      duration: ONE_HOUR_MS,
    },
  });

  browser.alarms.create("general_switch_timer", { delayInMinutes: 60 });
  setPausedState(true);

  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (
        tab.url &&
        (tab.url.includes("facebook.com") ||
          tab.url.includes("instagram.com") ||
          tab.url.includes("reddit.com") ||
          isBlockedYouTubeUrl(tab.url)) && tab.id
      ) {
        browser.tabs.reload(tab.id);
      }
    });
  });

  hideConfirmationMenu();
}

const confirmationBackBtn = document.getElementById("confirmation_back")
confirmationBackBtn.addEventListener("click", hideConfirmationMenu);

// Handle input navigation and validation
for (let i = 1; i <= 4; i++) {
  const input = document.getElementById(`confirmation_input_${i}`)

  input.addEventListener("input", (e) => {
    const target = e.target
    const value = target.value;

    if (value) {
      target.style.borderColor = "var(--line)";
    } else {
      target.style.borderColor = "var(--green)";
    }

    if (!/^\d*$/.test(value)) {
      target.value = "";
      target.style.borderColor = "var(--green)";
      return;
    }

    if (value && i < 4) {
      document.getElementById(`confirmation_input_${i + 1}`)?.focus();
    }

    checkConfirmationCode();
  });

  input.addEventListener("keydown", (e) => {
    const target = e.target
    if (e.key === "Backspace" && !target.value && i > 1) {
      document.getElementById(`confirmation_input_${i - 1}`)?.focus();
    }
    if (e.key === "Backspace") {
      setTimeout(() => {
        if (!target.value) {
          target.style.borderColor = "var(--green)";
        }
      }, 0);
    }
  });
}

function checkConfirmationCode() {
  let enteredCode = "";

  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`confirmation_input_${i}`)
    if (input) enteredCode += input.value;
  }

  if (expectedCode.length === 4 && enteredCode === expectedCode) {
    setTimeout(() => {
      turnOffBlocking();
    }, 200);
  }
}

// ===== RATE BUTTON LOGIC =====
const ACTIVE_TIME_THRESHOLD = 30 * 60;
const rateLink = document.getElementById("rate_link")

function updateRateButtonVisibility() {
  browser.storage.sync.get(["activeTimeOnSites", "rateButtonClicked"]).then((result) => {
    const activeTime = result.activeTimeOnSites || 0;
    const hasClicked = result.rateButtonClicked || false;

    if (!pauseAllowed) {
      // Locked popup: the review prompt is the only bottom action.
      rateLink.style.display = "block";
    } else if (hasClicked) {
      rateLink.style.display = "none";
    } else if (activeTime >= ACTIVE_TIME_THRESHOLD) {
      rateLink.style.display = "block";
    } else {
      rateLink.style.display = "none";
    }
  });
}

rateLink.addEventListener("click", () => {
  browser.storage.sync.set({ rateButtonClicked: true });
  browser.tabs.create({
    url: "https://chromewebstore.google.com/detail/no-distractions-remove-re/looidefpafaogockjglamdijbaocichg/reviews",
  });
  updateRateButtonVisibility();
});

updateRateButtonVisibility();