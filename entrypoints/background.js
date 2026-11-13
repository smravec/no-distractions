export default defineBackground({
  main() {
    // ===== UNINSTALL LINK =====
    // The uninstall page gets a few anonymous settings after "#" (never sent
    // to the server's logs; the page forwards them only with feedback the user
    // chooses to send). No IDs, no URLs, no time on sites.
    const UNINSTALL_BASE = "https://nodistractions.app/uninstall";
    const UN_SITES = ["yt", "fb", "ig", "rd"];
    const UN_STRICT_KEYS = { yt: "yt_strict", fb: "fb_strict", ig: "ig_strict", rd: "rd_strict" };
    const DAY_MS = 24 * 60 * 60 * 1000;
    let lastUninstallUrl = null;

    function ageBucket(installedAt) {
      const days = Math.floor((Date.now() - installedAt) / DAY_MS);
      if (!(days >= 1)) return "0d"; // also clock skew / NaN
      if (days === 1) return "1d";
      if (days <= 7) return "2-7d";
      if (days <= 30) return "8-30d";
      if (days <= 90) return "31-90d";
      if (days <= 365) return "91-365d";
      return "1y+";
    }

    function buildUninstallUrl({ version, sync, managed, local, installType }) {
      const on = UN_SITES.filter((s) => sync[s] !== false);
      const forced = managed.strictMode === true;
      const strict = on.filter((s) => forced || sync[UN_STRICT_KEYS[s]] === true);
      const lock = [];
      if (managed.allowPause === false) lock.push("pause");
      if (forced) lock.push("strict");
      const parts = [
        "v=" + encodeURIComponent(version || ""),
        "on=" + on.join(","),
        "strict=" + strict.join(","),
        "admin=" + (installType === "admin" ? "1" : "0"),
        "lock=" + lock.join(","),
        "paused=" + (sync.general_switch === false ? "1" : "0"),
      ];
      if (typeof local.installedAt === "number") {
        parts.push("age=" + ageBucket(local.installedAt));
        parts.push("pre=" + (local.installedPre === true ? "1" : "0"));
      }
      return UNINSTALL_BASE + "#" + parts.join("&");
    }

    function refreshUninstallUrl() {
      return Promise.all([
        browser.storage.sync
          .get(["yt", "fb", "ig", "rd", "general_switch", ...Object.values(UN_STRICT_KEYS)])
          .catch(() => ({})),
        Promise.resolve()
          .then(() => browser.storage.managed.get({ allowPause: true, strictMode: false }))
          .catch(() => ({})),
        browser.storage.local.get(["installedAt", "installedPre"]).catch(() => ({})),
        Promise.resolve()
          .then(() => browser.management.getSelf())
          .catch(() => null),
      ])
        .then(([sync, managed, local, self]) => {
          const url = buildUninstallUrl({
            version: browser.runtime.getManifest().version,
            sync: sync || {},
            managed: managed || {},
            local: local || {},
            installType: self && self.installType,
          });
          if (url === lastUninstallUrl) return;
          lastUninstallUrl = url;
          globalThis.__ndLastUninstallUrl = url; // debug read-back only
          return browser.runtime.setUninstallURL(url);
        })
        .catch(() => {
          // Worst case the plain page still opens.
          browser.runtime.setUninstallURL(UNINSTALL_BASE).catch(() => {});
        });
    }

    // installedAt is set ONLY here, never by refresh (a refresh racing the first
    // onInstalled must not mark a fresh install as "pre").
    function recordInstall(details) {
      if (details && details.reason === "install") {
        return browser.storage.local
          .set({ installedAt: Date.now(), installedPre: false })
          .catch(() => {});
      }
      return browser.storage.local
        .get(["installedAt"])
        .then((r) => {
          if (typeof r.installedAt !== "number") {
            return browser.storage.local.set({ installedAt: Date.now(), installedPre: true });
          }
        })
        .catch(() => {});
    }

    refreshUninstallUrl(); // every service-worker start

    browser.runtime.onInstalled.addListener((details) => {
      recordInstall(details).then(refreshUninstallUrl);
    });
    browser.runtime.onStartup.addListener(() => {
      refreshUninstallUrl();
    });

    // Daily, so the age bucket stays current. alarms.create resets an existing
    // alarm's schedule, so only create it when missing.
    browser.alarms
      .get("uninstallUrlRefresh")
      .then((a) => {
        if (!a) browser.alarms.create("uninstallUrlRefresh", { periodInMinutes: 1440 });
      })
      .catch(() => {});

    const UN_WATCH = ["yt", "fb", "ig", "rd", "general_switch", ...Object.values(UN_STRICT_KEYS)];
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "managed" || (area === "sync" && UN_WATCH.some((k) => k in changes))) {
        refreshUninstallUrl();
      }
    });

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
      if (alarm.name === "uninstallUrlRefresh") {
        refreshUninstallUrl();
        return;
      }
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