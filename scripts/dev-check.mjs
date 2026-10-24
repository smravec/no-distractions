// One-shot check against the running dev browser (pnpm dev:browser):
// opens <url> in a new tab, waits, saves a screenshot, prints console output.
//
//   pnpm dev:check <url> [screenshot.png] [--wait=ms]

import { chromium } from "playwright";

const args = process.argv.slice(2);
const waitArg = args.find((a) => a.startsWith("--wait="));
const [url, screenshotPath = "dev-check.png"] = args.filter((a) => !a.startsWith("--"));
const waitMs = waitArg ? Number(waitArg.slice("--wait=".length)) : 3000;

if (!url) {
  console.error("usage: pnpm dev:check <url> [screenshot.png] [--wait=ms]");
  process.exit(1);
}

const browser = await chromium.connectOverCDP("http://localhost:9333").catch(() => {
  console.error("dev browser not running — start it with pnpm dev:browser");
  process.exit(1);
});
const page = await browser.contexts()[0].newPage();

page.on("console", (msg) => console.log(`[console.${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(waitMs);
await page.screenshot({ path: screenshotPath });
console.log(`screenshot: ${screenshotPath}`);

await page.close();
// Disconnects without closing the dev browser itself.
await browser.close();
