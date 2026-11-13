# No Distractions

<img src=./storepage-assets/screenshot1.png />
A browser extension to block social media distractions - Reels, Shorts, infinite feeds, suggested posts, and recommendations across YouTube, Instagram, Facebook, and Reddit.

## What it does

- Keep posts from accounts you follow  
- Strict mode (optional, per site): hide posts from accounts you follow too  
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
- **No personal data** — Only a few anonymous settings go to the uninstall page, nothing that identifies you
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

Testing the unpacked build in its own browser: see [docs/development.md](docs/development.md).

## Enterprise policy (optional)

The extension supports [managed storage](https://developer.chrome.com/docs/extensions/reference/api/storage#property-managed): admins (or self-binding setups) can set `allowPause` to `false` to hide the "Turn off blocking" pause button entirely — any paused state is also auto-reverted. On macOS, place a plist with `allowPause = false` at:

```
/Library/Managed Preferences/com.google.Chrome.extensions.<extension-id>.plist
```

Set `strictMode` to `true` to force strict mode on for every site.

(A ready-made plist for the Web Store extension ID is in `policy/`.) Verify at `chrome://policy`. With no policy configured, nothing changes.

## Changelog

### Version 1.2

- Strict mode: hide posts from people you follow too (off by default, turn it on per site in Other settings)
- YouTube strict: Subscriptions feed, subscribed channels in the sidebar and the notifications bell are gone; the Channels list stays
- Instagram strict: Following feed and stories hidden
- Facebook strict: Friends feed hidden, the post box and Shortcuts stay
- Reddit strict: Communities and Recent hidden in the sidebar
- YouTube: a single short opens in the normal player
- Enterprise policy: `strictMode=true` forces strict mode on
- The uninstall page gets a few anonymous settings (version, sites, strict mode, roughly how long it was installed)

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
