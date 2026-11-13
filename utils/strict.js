import { browser } from "wxt/browser";

// Per-site strict mode: also hides content from accounts you follow.
// Sync keys default to false; managed `strictMode: true` (enterprise
// policy) forces strict on for every site.
export const STRICT_SITES = ["yt", "fb", "ig", "rd"];
export const STRICT_KEYS = {
  yt: "yt_strict",
  fb: "fb_strict",
  ig: "ig_strict",
  rd: "rd_strict",
};

// True when the policy forces strict mode. Never rejects.
export function readStrictForced() {
  try {
    if (!browser?.storage?.managed) return Promise.resolve(false);
    return Promise.resolve(browser.storage.managed.get({ strictMode: false }))
      .then((r) => !!r && r.strictMode === true)
      .catch(() => false);
  } catch (e) {
    return Promise.resolve(false);
  }
}

// The user's own sync toggle for one site. Never rejects.
export function readStrictSync(site) {
  const key = STRICT_KEYS[site];
  if (!key) return Promise.resolve(false);
  try {
    return Promise.resolve(browser.storage.sync.get([key]))
      .then((r) => !!r && r[key] === true)
      .catch(() => false);
  } catch (e) {
    return Promise.resolve(false);
  }
}

// Sync toggle OR policy. Callers AND this with their own ENABLE_<SITE>
// (general_switch && site toggle).
export function readStrict(site) {
  return Promise.all([readStrictSync(site), readStrictForced()]).then(
    ([own, forced]) => own || forced,
  );
}

// No-flash cache read by document_start init scripts (same pattern as
// nd-fb-enabled). Values "1" / "0".
export function strictCacheKey(site) {
  return "nd-" + site + "-strict";
}
export function cacheStrict(site, on) {
  try {
    localStorage.setItem(strictCacheKey(site), on ? "1" : "0");
  } catch (e) {
    // localStorage unavailable: the async read still applies the class.
  }
}
export function cachedStrict(site) {
  try {
    return localStorage.getItem(strictCacheKey(site)) === "1";
  } catch (e) {
    return false;
  }
}
// The html class for a site, e.g. "nd-yt-strict".
export function strictClass(site) {
  return "nd-" + site + "-strict";
}
