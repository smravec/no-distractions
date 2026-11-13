import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: "No Distractions - Block Shorts, Reels & Feeds (YouTube, Reddit, Insta, FB)",
    description: "Remove Reels, Shorts & Suggested posts across YouTube, Instagram, Facebook & Reddit.",
    version: "0.0.1.1",
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
    action: {
      default_icon: "no_distractions_logo.png",
    },
    permissions: ["storage", "alarms", "idle"],
    storage: {
      managed_schema: "managed_schema.json",
    },
    host_permissions: [
      "*://www.youtube.com/*",
      "*://m.youtube.com/*",
      "*://*.facebook.com/*",
      "*://*.instagram.com/*",
      "*://*.reddit.com/*"
    ],
    web_accessible_resources: [
      {
        resources: ["reddit-icon.png"],
        matches: ["https://*.reddit.com/*"]
      }
    ]
  },
  runner: {
    disabled: true
  },
  hooks: {
    // Keep only the newest zip in latest-build/, so it's easy to find for upload.
    'zip:extension:done': (wxt, zipPath) => {
      const dir = resolve(wxt.config.root, 'latest-build');
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir);
      copyFileSync(zipPath, resolve(dir, basename(zipPath)));
    },
  },
});