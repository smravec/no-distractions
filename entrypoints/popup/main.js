import './style.css';

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

// Youtube button
const yt_btn = document.getElementById("youtube")
browser.storage.sync.get(["yt"]).then((result) => {
  yt = result.yt !== undefined ? result.yt : true;
  yt_btn.style.borderColor = yt ? "greenyellow" : "red";
  updateSettingsButtonText(yt_btn, yt);
});

yt_btn.addEventListener("click", () => {
  yt = !yt;
  yt_btn.style.borderColor = yt ? "greenyellow" : "red";
  updateSettingsButtonText(yt_btn, yt);
  browser.storage.sync.set({ yt });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes("youtube.com") && tab.id) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// Facebook button
const fb_btn = document.getElementById("facebook")
browser.storage.sync.get(["fb"]).then((result) => {
  fb = result.fb !== undefined ? result.fb : true;
  fb_btn.style.borderColor = fb ? "greenyellow" : "red";
  updateSettingsButtonText(fb_btn, fb);
});

fb_btn.addEventListener("click", () => {
  fb = !fb;
  fb_btn.style.borderColor = fb ? "greenyellow" : "red";
  updateSettingsButtonText(fb_btn, fb);
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
  ig_btn.style.borderColor = ig ? "greenyellow" : "red";
  updateSettingsButtonText(ig_btn, ig);
});

ig_btn.addEventListener("click", () => {
  ig = !ig;
  ig_btn.style.borderColor = ig ? "greenyellow" : "red";
  updateSettingsButtonText(ig_btn, ig);
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
  rd_btn.style.borderColor = rd ? "greenyellow" : "red";
  updateSettingsButtonText(rd_btn, rd);
});

rd_btn.addEventListener("click", () => {
  rd = !rd;
  rd_btn.style.borderColor = rd ? "greenyellow" : "red";
  updateSettingsButtonText(rd_btn, rd);
  browser.storage.sync.set({ rd });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes("reddit.com") && tab.id) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// General switch button
const general_switch_btn = document.getElementById("general_switch")

function updateCountdownDisplay() {
  browser.storage.sync.get(["general_switch", "general_switch_timer"]).then((result) => {
    general_switch = result.general_switch !== undefined ? result.general_switch : true;

    general_switch_btn.style.borderColor = general_switch ? "greenyellow" : "red";
    general_switch_btn.textContent = "Turn off blocking";

    if (!general_switch && result.general_switch_timer) {
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
            tab.url.includes("youtube.com")) && tab.id
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
  mainMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

// Back to main menu logic
const backBtn = document.getElementById("toggle_main_menu")

backBtn.addEventListener("click", () => {
  mainMenu.style.display = "flex";
  settingsMenu.style.display = "none";
});

// Confirmation menu logic
function showConfirmationMenu() {
  const confirmationMenu = document.getElementById("confirmation_menu")
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
      input.style.borderColor = "greenyellow";
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
          tab.url.includes("youtube.com")) && tab.id
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
      target.style.borderColor = "red";
    } else {
      target.style.borderColor = "greenyellow";
    }

    if (!/^\d*$/.test(value)) {
      target.value = "";
      target.style.borderColor = "greenyellow";
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
          target.style.borderColor = "greenyellow";
        }
      }, 0);
    }
  });
}

function checkConfirmationCode() {
  const expectedCode = "4257";
  let enteredCode = "";

  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`confirmation_input_${i}`)
    if (input) enteredCode += input.value;
  }

  if (enteredCode === expectedCode) {
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

    if (hasClicked) {
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