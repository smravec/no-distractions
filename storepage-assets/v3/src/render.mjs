// usage: node render.mjs <srcDir> <outDir> [name ...]
// Renders each <name>.html at 2x then the caller downsamples to exact CWS size.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [srcDir, outDir, ...only] = process.argv.slice(2);
const SIZES = {
  "screenshot-1": [1280, 800], "screenshot-2": [1280, 800], "screenshot-3": [1280, 800],
  "screenshot-4": [1280, 800], "screenshot-5": [1280, 800],
  "small-promo": [440, 280], "marquee-promo": [1400, 560],
};
const names = only.length ? only : Object.keys(SIZES);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const name of names) {
  const [w, h] = SIZES[name];
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto("file://" + path.resolve(srcDir, name + ".html"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, name + "@2x.png") });
  await page.close();
  console.log("rendered", name);
}
await browser.close();
