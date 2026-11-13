# No Distractions — browser extension

WXT (MV3) extension that hides Shorts, Reels, suggested posts and feeds on YouTube, Instagram, Facebook and Reddit. Store ID: `looidefpafaogockjglamdijbaocichg`.

## Testing in a browser: use the dev browser, NOT the user's Chrome

The user's everyday Google Chrome force-installs the STORE build through managed policy (`/Library/Managed Preferences/com.google.Chrome.plist`, guarded by a root daemon from the Mac app). The store copy always runs there and interferes with an unpacked build. Branded Chrome also ignores `--load-extension`. So:

- **Never** test the extension with the claude-in-chrome tools (`mcp__claude-in-chrome__*`) or in the user's Chrome, and never touch the policy, the guard daemon or the "Dev pause".
- **Always** use the dev browser. It's Playwright's Chrome for Testing (bundle ID `com.google.chrome.for.testing`, so the policy doesn't apply), with only `.output/chrome-mv3` loaded.

### Workflow
1. Start it in the background and leave it running: `pnpm dev:browser --headless`. Drop `--headless` when the user should see the window. It runs `wxt build`, loads the build, then watches `entrypoints/`, `assets/`, `public/`, `utils/` and `wxt.config.ts`. On a change it rebuilds and relaunches the browser with the new build (same profile, so logins survive; open web and extension tabs are reopened). `chrome.runtime.reload()` would unload a command-line-loaded extension for good in Chrome for Testing, so it isn't used. Wait for the `[dev-browser] watching for changes…` line before using it.
2. Check pages in one of two ways:
   - **Quick one-shot:** `pnpm dev:check <url> <scratchpad>/out.png [--wait=ms]` saves a screenshot and prints console output. Then Read the PNG.
   - **Interactive:** the `nd-dev-browser` Playwright MCP server (`.mcp.json`), which attaches over CDP to `http://localhost:9333`. Use it for navigate, click, snapshot and screenshot.
3. Stop the dev browser when done. Only one instance can use `.dev-profile/` and port 9333 at a time.

### Notes
- `.dev-profile/` is a persistent profile holding the user's logins. Instagram and Facebook feeds need them. If a site shows a login or consent wall, ask the user to run `pnpm dev:browser` headed and log in once. Never delete the profile.
- There's no managed policy in the dev browser, so `chrome.storage.managed` is empty and `allowPause` defaults to `true`. Pause-lockdown behaviour (`allowPause = false`) can't be tested there.
- An unpacked extension's ID is a hash of its path (`bfngcldmpflkcknmngcgcbahnnmmmlfg` for this checkout). Never put it in policy; policy uses the store ID.

## Strict mode
- Per-site sync keys `yt_strict`, `fb_strict`, `ig_strict`, `rd_strict` (default `false`). Managed key `strictMode: true` forces it on for every site. `utils/strict.js` reads both.
- Each site gets an `nd-<site>-strict` class on `<html>` (only while that site is on), with a localStorage cache `nd-<site>-strict` so init scripts can set it before first paint. All strict CSS is gated by that class, so a missing class or anchor hides nothing.
- Forced `strictMode` (like `allowPause = false`) can't be tested in the dev browser, because it has no managed policy.

## Uninstall link
- `background.js` keeps `setUninstallURL` up to date: `https://nodistractions.app/uninstall#v=…&on=yt,fb,ig,rd&strict=…&admin=0|1&lock=pause,strict&paused=0|1&age=<bucket>&pre=0|1`.
- The data sits after `#`, so it never reaches server logs. The website's uninstall form adds it to the feedback email.
- Only those fields. Never add time on sites (`activeTimeOnSites`), URLs or IDs: Chrome Web Store counts browsing activity as user data.
- `installedAt` / `installedPre` live in `storage.local`. `pre=1` means the user installed before 1.2, so the age is only "at least".
- Never add permissions or host permissions for this: a new warning-level permission disables the extension for every user until they accept it.

## Commands
- `pnpm build` builds to `.output/chrome-mv3`. `pnpm zip` packages for the Web Store.
- `pnpm compile` runs the typecheck (`tsc --noEmit`).
- The WXT runner is disabled in `wxt.config.ts` on purpose. Use `pnpm dev:browser`, not `pnpm dev`, for browser testing.

# Model choice: Fable only on request

Use Fable only when the user specifically asks for it. Every role runs on the newest Opus by default, including all planning and all review, and no subagent gets `model: "fable"` without that request. A session that happens to run on Fable, a plan or file that mentions Fable, or a rule that lists it as an option does not count as a request. Do not recommend Fable as a default or as a final check.
