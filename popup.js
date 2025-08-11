if (typeof browser === "undefined") {
  var browser = chrome;
}

// chrome.storage.sync.set({ yt: true }).then(() => {
//   console.log("Value is set");
// });

// Call this function when needed, e.g., on button click or page load


// chrome.storage.sync.get("yt_hidden", (result) => {
//   if (result.yt_hidden == undefined) {
//     yt = true;
//   } else {
//     yt = false;
//   }
// });

let general_switch = true;

let yt = true;
let fb = true;
let ig = true;
let rd = true;

// Helper to update main menu title
function updateMainMenuTitle(paused) {
  const mainMenuTitle = document.querySelector('.main_menu_title');
  if (mainMenuTitle) {
    mainMenuTitle.textContent = paused ? "Don't Waste It" : "Saving Your GPA";
  }
}

// Helper to update main menu loading animation
function updateMainMenuLoading(paused) {
  const loadingElem = document.querySelector('.main_menu_loading');
  if (!loadingElem) return;
  if (paused) {
    loadingElem.classList.add('paused-dots');
  } else {
    loadingElem.classList.remove('paused-dots');
  }
}

// Update both title and dots when paused/unpaused
function setPausedState(paused) {
  updateMainMenuTitle(paused);
  updateMainMenuLoading(paused);
}

// Helper to update settings button text
function updateSettingsButtonText(btn, isOn) {
  btn.textContent = isOn ? 'On' : 'Off';
}

//Youtube button
const yt_btn = document.getElementById("youtube");

// Load saved value on popup open
browser.storage.sync.get(["yt"], (result) => {
  yt = result.yt !== undefined ? result.yt : true;
  yt_btn.style.borderColor = yt ? "greenyellow" : "red";
  updateSettingsButtonText(yt_btn, yt);
});

// Add click listener
yt_btn.addEventListener("click", () => {
  yt = !yt; // toggle
  yt_btn.style.borderColor = yt ? "greenyellow" : "red";
  updateSettingsButtonText(yt_btn, yt);
  browser.storage.sync.set({ yt });
  browser.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes("youtube.com")) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

//Facebook button
const fb_btn = document.getElementById("facebook");

// Load saved value on popup open
browser.storage.sync.get(["fb"], (result) => {
  fb = result.fb !== undefined ? result.fb : true;
  fb_btn.style.borderColor = fb ? "greenyellow" : "red";
  updateSettingsButtonText(fb_btn, fb);
});

// Add click listener
fb_btn.addEventListener("click", () => {
  fb = !fb; // toggle
  fb_btn.style.borderColor = fb ? "greenyellow" : "red";
  updateSettingsButtonText(fb_btn, fb);
  browser.storage.sync.set({ fb });
  browser.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes("facebook.com")) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

//Instagram button
const ig_btn = document.getElementById("instagram");

// Load saved value on popup open
browser.storage.sync.get(["ig"], (result) => {
  ig = result.ig !== undefined ? result.ig : true;
  ig_btn.style.borderColor = ig ? "greenyellow" : "red";
  updateSettingsButtonText(ig_btn, ig);
});

// Add click listener
ig_btn.addEventListener("click", () => {
  ig = !ig; // toggle
  ig_btn.style.borderColor = ig ? "greenyellow" : "red";
  updateSettingsButtonText(ig_btn, ig);
  browser.storage.sync.set({ ig });
  browser.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes("instagram.com")) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

  //Reddit button
const rd_btn = document.getElementById("reddit");

// Load saved value on popup open
browser.storage.sync.get(["rd"], (result) => {
  rd = result.rd !== undefined ? result.rd : true;
  rd_btn.style.borderColor = rd ? "greenyellow" : "red";
  updateSettingsButtonText(rd_btn, rd);
});

// Add click listener
rd_btn.addEventListener("click", () => {
  rd = !rd; // toggle
  rd_btn.style.borderColor = rd ? "greenyellow" : "red";
  updateSettingsButtonText(rd_btn, rd);
  browser.storage.sync.set({ rd });
  browser.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes("reddit.com")) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

//General switch button
const general_switch_btn = document.getElementById("general_switch");

// Function to update countdown display
function updateCountdownDisplay() {
  browser.storage.sync.get(["general_switch", "general_switch_timer"], (result) => {
    general_switch = result.general_switch !== undefined ? result.general_switch : true;
    
    // Update button style
    general_switch_btn.style.borderColor = general_switch ? "greenyellow" : "red";
    
    // Reset button text
    general_switch_btn.textContent = "Turn off blocking";
    
    // Check if timer is active
    if (!general_switch && result.general_switch_timer) {
      const timeRemaining = result.general_switch_timer.expiryTime - Date.now();
      if (timeRemaining > 0) {
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        general_switch_btn.textContent = `Reverts back in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    setPausedState(!general_switch);
  });
}

// Load saved value on popup open
updateCountdownDisplay();

// Set up countdown interval that updates every second
let countdownInterval = setInterval(() => {
  updateCountdownDisplay();
}, 1000);

// Add click listener
general_switch_btn.addEventListener("click", () => {
  general_switch = !general_switch; // toggle

  if (!general_switch) {
    // General switch turned OFF - start 2-hour timer
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const expiryTime = Date.now() + TWO_HOURS_MS;
    
    // Store timer data
    browser.storage.sync.set({ 
      general_switch: false,
      general_switch_timer: {
        expiryTime: expiryTime,
        duration: TWO_HOURS_MS
      }
    });
    
    // Create alarm for 2 hours
    browser.alarms.create("general_switch_timer", { delayInMinutes: 120 });
    
    setPausedState(true);
  } else {
    // General switch turned ON - clear any existing timer
    browser.alarms.clear("general_switch_timer");
    browser.storage.sync.set({ general_switch: true });
    browser.storage.sync.remove(["general_switch_timer"]);
    setPausedState(false);
  }

  // Refresh all tabs with supported sites
  browser.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && (tab.url.includes("facebook.com") || tab.url.includes("instagram.com") || tab.url.includes("reddit.com") || tab.url.includes("youtube.com"))) {
        browser.tabs.reload(tab.id);
      }
    });
  });
});

// Settings menu toggle logic
const settingsBtn = document.getElementById("toggle_settings");
const mainMenu = document.getElementById("main_menu");
const settingsMenu = document.getElementById("settings_menu");

settingsBtn.addEventListener("click", () => {
  // when this button is clicked show an popup that says under construction
  // alert("Feature under construction.");
  mainMenu.style.display = "none";
  settingsMenu.style.display = "flex";
});

// Back to main menu logic
const backBtn = document.getElementById("toggle_main_menu");

backBtn.addEventListener("click", () => {
  mainMenu.style.display = "flex";
  settingsMenu.style.display = "none";
});