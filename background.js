if (typeof browser === "undefined") {
  var browser = chrome;
}

// Handle alarm when timer expires
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "general_switch_timer") {
    console.log("2-hour timer expired, reverting general switch to ON");
    
    // Set general switch back to true
    browser.storage.sync.set({ general_switch: true }, () => {
      // Refresh all tabs with supported sites
      browser.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && (tab.url.includes("facebook.com") || tab.url.includes("instagram.com") || tab.url.includes("reddit.com") || tab.url.includes("youtube.com"))) {
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
        console.log(`Restoring timer with ${timeRemaining}ms remaining`);
        browser.alarms.create("general_switch_timer", { delayInMinutes: timeRemaining / (1000 * 60) });
      } else {
        // Timer has expired, clean up and revert
        console.log("Timer expired during shutdown, reverting general switch");
        browser.storage.sync.set({ general_switch: true });
        browser.storage.sync.remove(["general_switch_timer"]);
      }
    }
  });
} 