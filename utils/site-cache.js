import { browser } from "wxt/browser";

// Per-site "is blocking on" cache in the site's own localStorage, so the
// document_start scripts know before storage.sync answers. "1" on, "0" off.
// No value (first visit) counts as on, like the sync default.
export function siteCacheKey(site) {
  return "nd-" + site + "-enabled";
}
export function cachedSiteOff(site) {
  try {
    return localStorage.getItem(siteCacheKey(site)) === "0";
  } catch (e) {
    return false;
  }
}
export function cacheSiteEnabled(site, on) {
  try {
    localStorage.setItem(siteCacheKey(site), on ? "1" : "0");
    if (!on) localStorage.setItem("nd-" + site + "-strict", "0");
  } catch (e) {
    // localStorage unavailable: the async read still applies the state.
  }
}

// The popup sends { type: "nd-site-state", site, enabled } to a site's tabs
// before reloading them, so the reload already starts from the new state
// instead of last visit's cache.
export function listenSiteState(site) {
  try {
    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (!msg || msg.type !== "nd-site-state" || msg.site !== site) return;
      cacheSiteEnabled(site, msg.enabled === true);
      sendResponse(true);
    });
  } catch (e) {
    // No messaging: the popup's reload falls back to the old cache.
  }
}

// Hard-load fast paths (Facebook, Instagram) redirect from the cache before
// storage answers. They leave a note, so a redirect made from a stale "on"
// cache can be undone once storage says the site is off.
const FAST_PATH_MAX_AGE_MS = 15000;
// Not "nd-fb-fastpath": that key is Facebook's redirect loop guard.
function fastPathKey(site) {
  return "nd-" + site + "-fastpath-undo";
}
export function markFastPath(site) {
  try {
    sessionStorage.setItem(
      fastPathKey(site),
      JSON.stringify({ from: window.location.href, at: Date.now() }),
    );
  } catch (e) {
    // sessionStorage unavailable: nothing to undo later.
  }
}
export function clearFastPath(site) {
  try {
    sessionStorage.removeItem(fastPathKey(site));
  } catch (e) {
    // Nothing stored.
  }
}
// Call only when storage says the site is off, after caching "0" (so the
// page it goes back to doesn't redirect again). True when it navigates.
export function undoFastPath(site) {
  // Only once the off flag is cached, so the page it goes back to can't
  // redirect again.
  if (!cachedSiteOff(site)) return false;
  try {
    const raw = sessionStorage.getItem(fastPathKey(site));
    if (!raw) return false;
    const note = JSON.parse(raw);
    if (
      !note ||
      typeof note.from !== "string" ||
      typeof note.at !== "number" ||
      Date.now() - note.at > FAST_PATH_MAX_AGE_MS
    ) {
      sessionStorage.removeItem(fastPathKey(site));
      return false;
    }
    const from = new URL(note.from);
    // Still on the page the fast path is leaving: the note is for the page
    // it lands on, so leave it there.
    if (from.href === window.location.href) return false;
    sessionStorage.removeItem(fastPathKey(site));
    if (from.origin !== window.location.origin) return false;
    window.location.replace(from.href);
    return true;
  } catch (e) {
    return false;
  }
}
