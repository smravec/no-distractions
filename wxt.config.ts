import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: "No Distractions - Block Shorts, Reels & Feeds (YouTube, Reddit, Insta, FB)",
    description: "Remove Reels, Shorts & Suggested posts across YouTube, Instagram, Facebook & Reddit.",
    version: "0.0.0.6",
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
    host_permissions: [
      "*://*.youtube.com/*",
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
  }
});