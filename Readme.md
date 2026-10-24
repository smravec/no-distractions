# No Distractions

<img src=./storepage-assets/screenshot1.png />
A browser extension to block social media distractions - Reels, Shorts, infinite feeds, suggested posts, and recommendations across YouTube, Instagram, Facebook, and Reddit.

## What it does

- Keep posts from accounts you follow  
- Hide "suggested for you" algorithmic feeds  
- Block endless scrolling traps and recommendations  
- Remove explore pages, reels, and trending content

## Supported platforms

| Platform      | What gets blocked                                                  |
| ------------- | ------------------------------------------------------------------ |
| **Instagram** | Suggested Posts, Reels tab, Explore feed, "You might like" content |
| **YouTube**   | Recommended Videos, Shorts, Trending, video endscreen suggestions  |
| **Reddit**    | "Popular" feed, trending posts, recommended subreddits             |
| **Facebook**  | For You feed (Home opens the Friends feed), Reels, People You May Know, video feeds, Gaming |

## Why this extension?

- **Multi-platform** — One extension for all major social media sites
- **100% Open Source** — Transparent code you can verify
- **Zero data collection** — Completely privacy-friendly
- **Works out-of-the-box** — No complex configuration needed

## Install

- [Chrome Web Store](https://chromewebstore.google.com/detail/no-distractions-remove-re/looidefpafaogockjglamdijbaocichg)
- [Website](https://nodistractions.app)

## Building from source

```bash
pnpm install
pnpm wxt build        # build (Chrome MV3, .output/chrome-mv3)
pnpm wxt zip          # package for the Chrome Web Store (.output/*.zip)
```

## Enterprise policy (optional)

The extension supports [managed storage](https://developer.chrome.com/docs/extensions/reference/api/storage#property-managed): admins (or self-binding setups) can set `allowPause` to `false` to hide the "Turn off blocking" pause button entirely — any paused state is also auto-reverted. On macOS, place a plist with `allowPause = false` at:

```
/Library/Managed Preferences/com.google.Chrome.extensions.<extension-id>.plist
```

(A ready-made plist for the Web Store extension ID is in `policy/`.) Verify at `chrome://policy`. With no policy configured, nothing changes.

## Changelog

### Version 1.1

- Facebook: Home opens the Friends feed instead of a blank page; the "All" feed filter is hidden
- Facebook: the Friends feed gets a post box and a Shortcuts list (Groups, Marketplace, Saved, Events, Pages, Ads Manager, Meta Business Suite)
- Facebook: Reels and video feeds redirect to the Friends feed; a single shared reel opens in the video player without suggestions
- Facebook: hide People You May Know, Reels shelves, and the Reels, Gaming and Video navigation entries

### Version 0.9

- YouTube: playlist panel and player prev/next buttons stay visible when watching a playlist (Mixes stay blocked)
- YouTube Music is no longer affected by the extension
- Enterprise policy support: `allowPause=false` locks the extension — pause button and settings disabled (managed storage)

### Version 0.8

- Bug fixes

### Version 0.7

- Reddit: remove Games section
- Reddit: remove "Best of Reddit" section
- Bug fixes

### Version 0.6

- YouTube: fix endscreen suggestions
- YouTube: center video
- Bug fixes

### Version 0.5

- Instagram: remove suggested followers section
- Instagram: hide "For You" section
- Bug fixes

### Version 0.4

- Bug fixes

### Version 0.3

- Major UI overhaul
- Added 2FA-style confirmation when turning off blocking
- Reduced auto-revert timer from 2h to 1h
- Bug fixes

### Version 0.2

- Instead of removing feeds, now redirects to user-specific feeds (YouTube → Subscriptions, Instagram → Following, etc.)
- Bug fixes

### Version 0.1

- Initial launch
- Remove feeds for Instagram, Facebook, YouTube, Reddit
- General toggle to turn off extension
- Individual site toggles

## License

MIT

## Dev browser

Your everyday Chrome force-installs the store build through managed policy, so the dev build runs in Playwright's Chrome for Testing instead. That browser has a separate bundle ID, so the policy doesn't apply and only the dev build is loaded.

```bash
pnpm dev:browser              # build, open browser with .output/chrome-mv3 loaded, rebuild + relaunch on changes
pnpm dev:browser --headless   # same, no window
pnpm dev:check <url> [out.png] [--wait=ms]   # screenshot + console of a page in the running dev browser
```

- The profile is kept in `.dev-profile/` (gitignored), so you only log in to YouTube/Instagram/Facebook/Reddit once.
- CDP is on `http://localhost:9333`. The `nd-dev-browser` Playwright MCP server in `.mcp.json` attaches to it.
- There's no managed policy here, so `chrome.storage.managed` is empty and `allowPause` defaults to `true`.
