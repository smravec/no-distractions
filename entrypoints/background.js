export default defineBackground({
  main() {
    // Match YouTube by exact hostname so music.youtube.com is never touched.
    function isBlockedYouTubeUrl(url) {
      if (!url) return false;
      try {
        const hostname = new URL(url).hostname;
        return hostname === "www.youtube.com" || hostname === "m.youtube.com";
      } catch (e) {
        return false;
      }
    }

    // ===== ACTIVE TIME TRACKING FOR RATE BUTTON =====
    const SUPPORTED_SITES = [
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
      return (
        isBlockedYouTubeUrl(url) ||
        SUPPORTED_SITES.some((site) => url.includes(site))
      );
    }

    // Update active time periodically
    function updateActiveTime() {
      browser.idle.queryState(IDLE_DETECTION_INTERVAL).then((state) => {
        if (state === "active") {
          // Check if user is on a supported site
          browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0] && isOnSupportedSite(tabs[0].url)) {
              // User is active on a supported site, increment time
              browser.storage.sync.get(["activeTimeOnSites"]).then((result) => {
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
        browser.storage.sync.set({ general_switch: true }).then(() => {
          // Refresh all tabs with supported sites
          browser.tabs.query({}).then((tabs) => {
            tabs.forEach((tab) => {
              if (
                tab.url &&
                (tab.url.includes("facebook.com") ||
                  tab.url.includes("instagram.com") ||
                  tab.url.includes("reddit.com") ||
                  isBlockedYouTubeUrl(tab.url))
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
      browser.storage.sync.get(["general_switch_timer"]).then((result) => {
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

    // ===== UNINSTALL FEEDBACK =====
    // Opens the feedback page on the website when the extension is removed.
    browser.runtime.setUninstallURL("https://nodistractions.app/uninstall");

    // ===== ENTERPRISE POLICY (managed storage) =====
    // If the policy sets allowPause=false, any paused state is snapped back on
    // immediately — covers stale synced state and storage tampering, not just
    // the (hidden) popup button.
    function enforcePausePolicy() {
      browser.storage.managed
        .get({ allowPause: true })
        .then((result) => {
          if (!result || result.allowPause !== false) return;
          browser.storage.sync.get(["general_switch"]).then((res) => {
            if (res.general_switch === false) {
              browser.alarms.clear("general_switch_timer");
              browser.storage.sync.set({ general_switch: true });
              browser.storage.sync.remove(["general_switch_timer"]);
            }
          });
        })
        .catch(() => {
          // storage.managed unavailable (no policy configured) — nothing to enforce
        });
    }

    // Runs on every service-worker start, and re-checks whenever the policy
    // changes or anything tries to flip the switch off.
    enforcePausePolicy();

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "managed" && changes.allowPause) {
        enforcePausePolicy();
      }
      if (
        area === "sync" &&
        changes.general_switch &&
        changes.general_switch.newValue === false
      ) {
        enforcePausePolicy();
      }
    });
  }
});