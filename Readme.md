# No Distractions

<img src=./storepage-assets/block-reels-shorts-instagram-youtube-feeds.png />
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
./build-all.sh
```

## Packaging for web stores

```bash
./zip-all.sh
```

## Changelog

### Version 0.3 — 29.9.2025

- Major UI overhaul
- Added 2FA-style confirmation when turning off blocking
- Reduced auto-revert timer from 2h to 1h
- Bug fixes

### Version 0.2 — 14.9.2025

- Instead of removing feeds, now redirects to user-specific feeds (YouTube → Subscriptions, Instagram → Following, etc.)
- Bug fixes

### Version 0.1 — 13.8.2025

- Initial launch
- Remove feeds for Instagram, Facebook, YouTube, Reddit
- General toggle to turn off extension
- Individual site toggles

## License

MIT - Open source
