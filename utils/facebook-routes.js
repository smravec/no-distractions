// Facebook route rules shared by the isolated-world and MAIN-world scripts.
export const FB_FRIENDS_FEED = "/?filter=friends&sk=h_chr";

// Feeds filters the user picked themselves; everything else on / is the
// algorithmic home.
const KEEP_FILTERS = ["friends", "favorites", "groups", "pages", "notifications"];

// Returns the path to send this URL to, or null when it may load as-is.
// Relative URLs resolve against the current page, as history.pushState does:
// "?x=1", "#h" or "" on /marketplace/ stay on /marketplace/, not on /.
export function fbRedirectTarget(url) {
  let u;
  try {
    u = new URL(url, window.location.href);
  } catch (e) {
    return null;
  }
  if (u.hostname !== "www.facebook.com") {
    return null;
  }
  const p = u.pathname;
  if (p === "/" || p === "" || p === "/home.php") {
    return KEEP_FILTERS.includes(u.searchParams.get("filter"))
      ? null
      : FB_FRIENDS_FEED;
  }
  // A single reel (e.g. a friend's shared one) opens in the single-video
  // player instead of the infinite Reels viewer.
  const reel = p.match(/^\/reels?\/(\d+)/);
  if (reel) {
    return "/watch/?v=" + reel[1];
  }
  if (/^\/reels?(\/|$)/.test(p)) {
    return FB_FRIENDS_FEED;
  }
  if (/^\/watch(\/|$)/.test(p)) {
    if (/^\/watch\/saved(\/|$)/.test(p)) {
      return null;
    }
    if (/^\/watch\/?$/.test(p) && u.searchParams.get("v")) {
      return null;
    }
    return FB_FRIENDS_FEED;
  }
  if (/^\/gaming(\/|$)/.test(p)) {
    return FB_FRIENDS_FEED;
  }
  return null;
}

// True when the URL is a blocked home (/ or /home.php) — the one redirect
// that can happen as an SPA navigation. Reel/watch/gaming need a full one.
export function fbIsHomeRedirect(url) {
  if (fbRedirectTarget(url) !== FB_FRIENDS_FEED) {
    return false;
  }
  try {
    const p = new URL(url, window.location.href).pathname;
    return p === "/" || p === "" || p === "/home.php";
  } catch (e) {
    return false;
  }
}

// fbRedirectTarget plus a loop guard, for every redirect that isn't the
// plain home → friends feed one. If Facebook bounces the target back
// (e.g. /watch/?v=<id> → /reel/<id>), the third redirect to the same target
// within 30 s of the first lands on the friends feed instead, which never
// redirects, so the bounce ends there. Counting hops instead of timing a
// single one keeps a slow bounce caught and still lets a reel be reopened
// once. Each call is one redirect; callers make one per blocked load. The
// series is kept in sessionStorage ("<target>|<count>|<firstMs>") because
// the bounce may be a full load.
export function fbGuardedTarget(url) {
  const target = fbRedirectTarget(url);
  if (target === null) {
    return null;
  }
  try {
    const last = (sessionStorage.getItem("nd-fb-fastpath") || "").split("|");
    const now = Date.now();
    let count = 1;
    let first = now;
    if (last[0] === target && now - Number(last[2]) < 30000) {
      count = (Number(last[1]) || 0) + 1;
      first = Number(last[2]);
    }
    if (count > 2) {
      sessionStorage.setItem("nd-fb-fastpath", FB_FRIENDS_FEED + "|1|" + now);
      return FB_FRIENDS_FEED;
    }
    sessionStorage.setItem("nd-fb-fastpath", target + "|" + count + "|" + first);
    return target;
  } catch (e) {
    // sessionStorage unavailable (blocked site data): redirect unguarded.
    // That only loops if Facebook also bounces the target back, which the
    // guard exists for but which isn't observed today.
    return target;
  }
}

// c_user is not HttpOnly, so it is readable synchronously at document_start.
export function fbIsLoggedIn() {
  return /(^|;\s*)c_user=/.test(document.cookie);
}
