import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: "No Distractions - Block Shorts, Reels & Feeds (YouTube, Reddit, Insta, FB)",
    description: "Remove Reels, Shorts & Suggested posts across YouTube, Instagram, Facebook & Reddit.",
    version: "0.0.0.5",
    permissions: ["storage", "alarms", "idle"],
    host_permissions: [
      "https://www.youtube.com/*", 
      "https://m.youtube.com/*",
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