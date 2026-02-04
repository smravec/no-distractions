if (typeof browser === "undefined") {
  let browser = chrome;
}

// ===== ACTIVE TIME TRACKING FOR RATE BUTTON =====
const SUPPORTED_SITES = [
  "youtube.com",
  "instagram.com",
  "facebook.com",
  "reddit.com",
];
const IDLE_DETECTION_INTERVAL = 60; // Check idle state every 60 seconds
const ACTIVE_TIME_THRESHOLD = 30 * 60; // 30 minutes in seconds

// Initialize idle detection
browser.idle.setDetectionInterval(IDLE_DETECTION_INTERVAL);

// Track active time when user is on supported sites
function isOnSupportedSite(url) {
  if (!url) return false;
  return SUPPORTED_SITES.some((site) => url.includes(site));
}

// Update active time periodically
function updateActiveTime() {
  browser.idle.queryState(IDLE_DETECTION_INTERVAL, (state) => {
    if (state === "active") {
      // Check if user is on a supported site
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && isOnSupportedSite(tabs[0].url)) {
          // User is active on a supported site, increment time
          browser.storage.sync.get(["activeTimeOnSites"], (result) => {
            const currentTime = result.activeTimeOnSites || 0;
            const newTime = currentTime + IDLE_DETECTION_INTERVAL;
            browser.storage.sync.set({ activeTimeOnSites: newTime });
          });
        }
      });
    }
  });
}

// Set up periodic active time tracking (every 60 seconds)
browser.alarms.create("activeTimeTracker", { periodInMinutes: 1 });

// Handle alarm when timer expires
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "activeTimeTracker") {
    updateActiveTime();
    return;
  }
  if (alarm.name === "general_switch_timer") {

    // Set general switch back to true
    browser.storage.sync.set({ general_switch: true }, () => {
      // Refresh all tabs with supported sites
      browser.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (
            tab.url &&
            (tab.url.includes("facebook.com") ||
              tab.url.includes("instagram.com") ||
              tab.url.includes("reddit.com") ||
              tab.url.includes("youtube.com"))
          ) {
            browser.tabs.reload(tab.id);
          }
        });
      });
    });
  }
});

// Check for existing timer on extension startup
browser.runtime.onStartup.addListener(() => {
  checkAndRestoreTimer();
});

browser.runtime.onInstalled.addListener(() => {
  checkAndRestoreTimer();
});

function checkAndRestoreTimer() {
  browser.storage.sync.get(["general_switch_timer"], (result) => {
    if (result.general_switch_timer) {
      const timerData = result.general_switch_timer;
      const now = Date.now();
      const timeRemaining = timerData.expiryTime - now;

      if (timeRemaining > 0) {
        // Timer hasn't expired yet, restore it
        browser.alarms.create("general_switch_timer", {
          delayInMinutes: timeRemaining / (1000 * 60),
        });
      } else {
        // Timer has expired, clean up and revert
        browser.storage.sync.set({ general_switch: true });
        browser.storage.sync.remove(["general_switch_timer"]);
      }
    }
  });
}
