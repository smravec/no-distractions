// Real captures of No Distractions working, in a throwaway profile (no login).
// usage: node capture.mjs <outDir> [job ...]   jobs: probe yt-search yt-watch reddit popup
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const EXT = "/Users/simon/Projects/no-distractions/no-distractions-extension/.output/chrome-mv3";
const EXE = path.join(os.homedir(), "Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const [outDir, ...jobs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

// EU consent walls (YouTube/Google) — pre-accept so pages render normally.
const CONSENT = [".youtube.com", ".google.com"].map((domain) => ({
  name: "SOCS", value: "CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg", domain, path: "/", secure: true, sameSite: "Lax",
}));

async function launch(withExt) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nd-prof-"));
  const args = ["--lang=en-US", "--hide-scrollbars"];
  if (withExt) args.push(`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`);
  const ctx = await chromium.launchPersistentContext(dir, {
    executablePath: EXE, headless: true, args, locale: "en-US", colorScheme: "light",
    viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  });
  if (process.env.ACCEPT) {
    // Click through Google's consent page with "Accept all" so YouTube serves a normal home feed.
    const p = await ctx.newPage();
    await p.goto("https://www.youtube.com/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(2500);
    const btn = p.locator('button:has-text("Accept all")').first();
    if (await btn.count()) { await btn.click(); await p.waitForTimeout(3000); console.log("consent accepted"); }
    await p.close();
  } else await ctx.addCookies(CONSENT);
  let extId = null;
  if (withExt) {
    let sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent("serviceworker", { timeout: 15000 }));
    extId = sw.url().split("/")[2];
  }
  return { ctx, extId };
}

async function shot(ctx, url, file, { wait = 5000, scroll = 0, prep } = {}) {
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(wait);
  if (prep) await prep(p);
  if (scroll) { await p.mouse.wheel(0, scroll); await p.waitForTimeout(1500); }
  await p.screenshot({ path: path.join(outDir, file) });
  console.log("saved", file, "->", p.url());
  await p.close();
}

const JOBS = {
  async probe() {
    const { ctx, extId } = await launch(true);
    console.log("extension id", extId);
    await ctx.close();
  },
  async "yt-search"() {
    const q = "https://www.youtube.com/results?search_query=how+to+focus+better";
    for (const on of [false, true]) {
      const { ctx } = await launch(on);
      await shot(ctx, q, `yt-search-${on ? "after" : "before"}.png`, { wait: 7000 });
      await ctx.close();
    }
  },
  async "yt-watch"() {
    const u = "https://www.youtube.com/watch?v=" + (process.env.VID || "arj7oStGLkU");
    for (const on of [false, true]) {
      const { ctx } = await launch(on);
      await shot(ctx, u, `yt-watch-${on ? "after" : "before"}.png`, {
        wait: 8000,
        prep: async (p) => { await p.evaluate(() => document.querySelector("video")?.pause()); },
      });
      await ctx.close();
    }
  },
  async "yt-home"() {
    for (const on of [false, true]) {
      const { ctx } = await launch(on);
      // Seed a little watch history so the logged-out home page has a feed to show.
      const w = await ctx.newPage();
      if (process.env.SEED) for (const v of ["arj7oStGLkU", "9bZkp7q19f0", "kJQP7kiw5Fk", "JGwWNGJdvx8"]) {
        await w.goto("https://www.youtube.com/watch?v=" + v, { waitUntil: "domcontentloaded" });
        await w.waitForTimeout(9000);
      }
      await w.close();
      await shot(ctx, "https://www.youtube.com/", `yt-home-${on ? "after" : "before"}.png`, { wait: 7000 });
      await ctx.close();
    }
  },
  async reddit() {
    for (const on of [false, true]) {
      const { ctx } = await launch(on);
      await shot(ctx, "https://www.reddit.com/?geo_filter=GLOBAL", `reddit-${on ? "after" : "before"}.png`, {
        wait: 8000,
        prep: async (p) => {
          // Blur post media so no stranger's photo ends up in the store listing.
          await p.addStyleTag({ content: '[slot="post-media-container"], shreddit-post img, shreddit-player, shreddit-player-2, video { filter: blur(22px) !important; } shreddit-ad-post { display: none !important; }' });
          const b = p.locator('button:has-text("Reject Optional Cookies")').first();
          if (await b.count()) { await b.click(); await p.waitForTimeout(1500); }
        },
      });
      await ctx.close();
    }
  },
  async popup() {
    const { ctx, extId } = await launch(true);
    const p = await ctx.newPage();
    await p.setViewportSize({ width: 200, height: 270 });
    await p.emulateMedia({ colorScheme: "dark" });
    const url = `chrome-extension://${extId}/popup.html`;
    const snap = async (f) => { await p.waitForTimeout(700); await p.screenshot({ path: path.join(outDir, f) }); console.log("saved", f); };
    // Freeze the animated "..." on its full frame so the still shot isn't caught mid-cycle.
    const freeze = () => p.addStyleTag({ content: '.main_menu_loading::after{content:"..." !important;animation:none !important}' });
    await p.goto(url); await p.waitForTimeout(1500); await freeze(); await snap("popup-on.png");
    await p.click("#toggle_settings"); await snap("popup-settings.png");
    await p.click("#toggle_main_menu");
    await p.click("#general_switch"); await p.waitForTimeout(500);
    const code = (await p.textContent(".confirmation_title")).match(/\d/g);
    await p.fill("#confirmation_input_1", code[0]); await p.fill("#confirmation_input_2", code[1]);
    await p.focus("#confirmation_input_3");
    await snap("popup-code.png");
    for (let i = 2; i < 4; i++) await p.type(`#confirmation_input_${i + 1}`, code[i]);
    await p.waitForTimeout(1500); await p.goto(url); await p.waitForTimeout(2500); await freeze(); await snap("popup-paused.png");
    await ctx.close();
  },
};

for (const j of jobs.length ? jobs : ["probe"]) await JOBS[j]();
