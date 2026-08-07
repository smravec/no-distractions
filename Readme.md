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
| **Facebook**  | Suggested Posts, Reels, Pages You May Like, Watch recommendations  |

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

### Version 0.9

- Enterprise policy support: `allowPause=false` hides the pause button (managed storage)
- Uninstall feedback: removing the extension opens a feedback page on the website

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
