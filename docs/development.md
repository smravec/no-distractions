# Development

## Build

```bash
pnpm install
pnpm build        # .output/chrome-mv3
pnpm compile      # typecheck
pnpm zip          # Chrome Web Store package; the newest zip is also copied to latest-build/
```

## Dev browser

`pnpm dev:browser` opens Chrome for Testing with only the unpacked build loaded. It's handy when your normal Chrome already runs the store version, because two copies of the extension get in each other's way.

```bash
pnpm dev:browser              # build, open the browser, rebuild + relaunch on changes
pnpm dev:browser --headless   # same, no window
pnpm dev:check <url> [out.png] [--wait=ms]   # screenshot + console of a page in the running dev browser
```

- It watches `entrypoints/`, `assets/`, `public/`, `utils/` and `wxt.config.ts`. On a change it rebuilds and relaunches with the same tabs.
- Pages, content scripts and the popup pick up the new build, but Chrome keeps running the cached background service worker while the version stays the same. To test `background.js` changes, use a fresh profile or bump the version.
- The profile lives in `.dev-profile/` (gitignored), so you only log in to YouTube, Instagram, Facebook and Reddit once.
- CDP is on `http://localhost:9333`. The `nd-dev-browser` Playwright MCP server in `.mcp.json` attaches to it.
- There's no enterprise policy in this browser, so `chrome.storage.managed` is empty: `allowPause` counts as `true` and `strictMode` as `false`.
