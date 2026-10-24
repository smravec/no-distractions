// Dev browser: Playwright's Chrome for Testing with the unpacked build loaded.
// Its bundle ID is not com.google.Chrome, so the forced store-extension policy
// from the Mac app doesn't apply here — only the dev build runs.
//
//   pnpm dev:browser              headed window, rebuild + relaunch on file changes
//   pnpm dev:browser --headless   same, no window
//
// CDP is exposed on http://localhost:9333 for Playwright MCP / dev:check.

import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionDir = path.join(root, ".output/chrome-mv3");
const profileDir = path.join(root, ".dev-profile");
const cdpPort = 9333;
const headless = process.argv.includes("--headless");

function build() {
  const result = spawnSync("pnpm", ["exec", "wxt", "build"], { cwd: root, stdio: "inherit" });
  return result.status === 0;
}

if (!build()) process.exit(1);

// chrome.runtime.reload() unloads an extension loaded with --load-extension
// for good in Chrome for Testing, so a rebuild relaunches the whole browser
// instead: same profile (logins survive), same CDP port, same tabs.
let context = null;
let relaunching = false;

async function launch(urls = []) {
  context = await chromium.launchPersistentContext(profileDir, {
    channel: "chromium",
    headless,
    viewport: null,
    args: [
      `--disable-extensions-except=${extensionDir}`,
      `--load-extension=${extensionDir}`,
      `--remote-debugging-port=${cdpPort}`,
    ],
  });
  context.on("close", () => {
    if (!relaunching) process.exit(0);
  });
  const sw =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker", { timeout: 15_000 }).catch(() => null));
  if (!sw) {
    // A broken build can fail to load; the next save relaunches again.
    console.log("[dev-browser] extension service worker didn't start — check the build");
  }
  // The persistent context restores a blank tab; reuse it for the first URL.
  const [first] = context.pages();
  for (const [i, url] of urls.entries()) {
    const page = i === 0 && first ? first : await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => {});
  }
  return sw ? new URL(sw.url()).host : null;
}

const extensionId = await launch();
console.log(`\n[dev-browser] extension ${extensionId} loaded`);
console.log(`[dev-browser] CDP http://localhost:${cdpPort}`);
console.log(`[dev-browser] watching for changes…\n`);

async function relaunch() {
  const urls = context
    .pages()
    .map((page) => page.url())
    // Extension pages keep working too: an unpacked extension's ID is stable.
    .filter((url) => /^(https?|chrome-extension):/.test(url));
  relaunching = true;
  await context.close().catch(() => {});
  relaunching = false;
  await launch(urls);
  console.log("[dev-browser] relaunched with the new build");
}

let timer = null;
let building = false;
let pending = false;

async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  if (build()) {
    await relaunch().catch((err) => {
      console.log(`[dev-browser] relaunch failed: ${err.message}`);
    });
  } else console.log("[dev-browser] build failed, keeping the previous build loaded");
  building = false;
  if (pending) {
    pending = false;
    rebuild();
  }
}

for (const target of ["entrypoints", "assets", "public", "utils", "wxt.config.ts"]) {
  watch(path.join(root, target), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 300);
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    relaunching = true;
    // context is still null if the first launch hasn't finished yet.
    await context?.close().catch(() => {});
    process.exit(0);
  });
}
