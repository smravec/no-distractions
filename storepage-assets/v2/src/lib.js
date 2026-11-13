// Shared building blocks for the store graphics. Everything is plain HTML strings
// so each page can stay a tiny static file rendered by render.mjs.

const ICON = {
  yt: '<path fill-rule="evenodd" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
  ig: '<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>',
  fb: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
  rd: '<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>',
  gh: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3.998.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.32 3.285-.998 3.285-.998.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
};

const NAME = { yt: "YouTube", ig: "Instagram", fb: "Facebook", rd: "Reddit" };

const LOGO_PATH =
  "M39.7134 134V65.84H55.8414L82.9134 112.88V65.84H97.5054V134H81.1854L54.3054 88.592V134H39.7134ZM110.401 134V65.84H133.921C144.993 65.84 153.505 68.816 159.457 74.768C165.409 80.656 168.385 89.072 168.385 100.016C168.385 110.896 165.441 119.28 159.553 125.168C153.729 131.056 145.377 134 134.497 134H110.401ZM124.993 121.712H133.921C140.513 121.712 145.377 119.952 148.513 116.432C151.713 112.848 153.313 107.344 153.313 99.92C153.313 92.496 151.713 87.024 148.513 83.504C145.377 79.92 140.513 78.128 133.921 78.128H124.993V121.712Z";

function svg(name, extra = "") {
  return `<svg viewBox="0 0 24 24" ${extra}>${ICON[name]}</svg>`;
}

function logo(size) {
  return `<div class="logo" style="width:${size}px;height:${size}px"><svg viewBox="0 0 200 200" style="width:100%"><path d="${LOGO_PATH}" fill="#fff"/></svg></div>`;
}

function tile(id, size) {
  return `<div class="pt ${id}" style="width:${size}px;height:${size}px">${svg(id)}</div>`;
}

function tiles(size, gap = 12, ids = ["yt", "ig", "fb", "rd"]) {
  return `<div class="pts" style="gap:${gap}px">${ids.map((i) => tile(i, size)).join("")}</div>`;
}

function winBar(url) {
  return `<div class="win-bar"><div class="dots"><i></i><i></i><i></i></div>
    <div class="url"><svg width="11" height="11" viewBox="0 0 24 24" fill="#8a8a8a"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2zm-8-2a3 3 0 0 1 6 0v2H9V7z"/></svg><span>${url}</span></div>
    <div style="width:22px;height:22px;border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px rgba(184,255,60,.5)">${logo(22).replace('class="logo"', 'class="logo" style="box-shadow:none"')}</div>
  </div>`;
}

/* ---------------- thumbnails ---------------- */

// Loud "algorithm bait" thumbnail: saturated gradient, emoji, shouty caption.
function baitThumb(t) {
  return `<div class="th" style="background:linear-gradient(135deg,${t.c[0]},${t.c[1]})">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at ${t.gx || 70}% 40%,rgba(255,255,255,.35),transparent 45%)"></div>
    <div class="th-emoji" style="${t.left ? "left:6%" : "right:6%"}">${t.e}</div>
    <div class="th-cap" style="${t.left ? "right:6%;text-align:right" : "left:6%"};color:${t.tc || "#fff"}">${t.cap}</div>
    ${t.arrow ? `<svg class="th-arrow" viewBox="0 0 40 40"><path d="M6 30 L30 8 M30 8 L16 9 M30 8 L29 22" stroke="#ff2a2a" stroke-width="6" fill="none" stroke-linecap="round"/></svg>` : ""}
    <span class="dur">${t.d}</span></div>`;
}

// Calm "people you follow" thumbnail: soft gradient scenes, no shouting.
const SCENES = {
  mountains: (a, b) => `<svg viewBox="0 0 160 90" preserveAspectRatio="none"><defs><linearGradient id="s${a.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="160" height="90" fill="url(#s${a.slice(1)})"/><circle cx="118" cy="30" r="11" fill="#fff" opacity=".55"/><path d="M0 70 L35 38 L58 58 L88 26 L122 62 L160 44 L160 90 L0 90Z" fill="#000" opacity=".28"/><path d="M0 80 L40 58 L75 76 L110 60 L160 78 L160 90 L0 90Z" fill="#000" opacity=".35"/></svg>`,
  desk: (a, b) => `<svg viewBox="0 0 160 90" preserveAspectRatio="none"><rect width="160" height="90" fill="${a}"/><rect x="0" y="62" width="160" height="28" fill="${b}"/><rect x="44" y="18" width="72" height="42" rx="3" fill="#111" opacity=".85"/><rect x="50" y="25" width="34" height="3" rx="1.5" fill="#b8ff3c" opacity=".7"/><rect x="50" y="32" width="50" height="3" rx="1.5" fill="#fff" opacity=".35"/><rect x="56" y="39" width="40" height="3" rx="1.5" fill="#fff" opacity=".35"/><rect x="56" y="46" width="28" height="3" rx="1.5" fill="#7cc4ff" opacity=".5"/><rect x="74" y="60" width="12" height="4" fill="#111" opacity=".6"/></svg>`,
  sea: (a, b) => `<svg viewBox="0 0 160 90" preserveAspectRatio="none"><rect width="160" height="90" fill="${a}"/><circle cx="80" cy="52" r="20" fill="#ffd7a1" opacity=".75"/><rect y="52" width="160" height="38" fill="${b}"/><path d="M0 60h160M10 67h140M24 74h112M40 81h80" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/></svg>`,
  bread: (a, b) => `<svg viewBox="0 0 160 90" preserveAspectRatio="none"><rect width="160" height="90" fill="${a}"/><rect y="58" width="160" height="32" fill="${b}"/><ellipse cx="80" cy="56" rx="42" ry="22" fill="#c98a4b"/><ellipse cx="80" cy="50" rx="38" ry="16" fill="#e0a868"/><path d="M58 46 q10 -6 18 2 M78 42 q10 -6 18 2" stroke="#9a6233" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  piano: (a, b) => `<svg viewBox="0 0 160 90" preserveAspectRatio="none"><rect width="160" height="90" fill="${a}"/><rect x="10" y="44" width="140" height="34" rx="3" fill="#f3efe6"/>${Array.from({ length: 13 }, (_, i) => `<line x1="${20 + i * 10}" y1="44" x2="${20 + i * 10}" y2="78" stroke="#bbb" stroke-width=".8"/>`).join("")}${[0, 1, 3, 4, 5, 7, 8, 10, 11].map((i) => `<rect x="${17 + i * 10}" y="44" width="6" height="20" fill="#181818"/>`).join("")}<rect y="0" width="160" height="44" fill="${b}" opacity=".6"/></svg>`,
  track: (a, b) => `<svg viewBox="0 0 160 90" preserveAspectRatio="none"><rect width="160" height="90" fill="${a}"/><path d="M-10 90 Q80 20 170 90" stroke="${b}" stroke-width="30" fill="none"/><path d="M-10 90 Q80 20 170 90" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-dasharray="6 6" fill="none"/></svg>`,
};

function calmThumb(t) {
  return `<div class="th">${SCENES[t.s](t.c[0], t.c[1])}<span class="dur">${t.d}</span></div>`;
}

const AV = ["#e8604c", "#f2b33d", "#5b8def", "#7bd389", "#c77dff", "#ff8fab", "#4dd4c6", "#f78c40"];

function card(v, i, kind) {
  return `<div class="vc">
    ${kind === "bait" ? baitThumb(v) : calmThumb(v)}
    <div class="vm"><i class="av" style="background:${v.av || AV[i % AV.length]}"></i>
      <div><div class="vt">${v.t}</div><div class="vs">${v.ch}${v.ver ? ' <svg width="11" height="11" viewBox="0 0 24 24" fill="#aaa" style="vertical-align:-1px"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z"/></svg>' : ""}<br>${v.m}</div></div></div></div>`;
}

const BAIT = [
  { c: ["#ff3d00", "#ffb300"], e: "😱", cap: "DON'T<br>TRY THIS", d: "18:42", t: "I Survived 100 Hours in the World's Scariest Place", ch: "MrChallenge", ver: 1, m: "14M views · 2 days ago", arrow: 1 },
  { c: ["#00c6ff", "#7b2ff7"], e: "🤯", cap: "99% FAIL", d: "12:07", t: "You've Been Doing This WRONG Your Whole Life", ch: "DailyShock", m: "3.2M views · 6 hours ago", left: 1 },
  { c: ["#11998e", "#38ef7d"], e: "💰", cap: "$1 vs<br>$10,000", d: "24:15", t: "$1 vs $10,000 Vacation — You Won't Believe #7", ch: "ViralVault", ver: 1, m: "8.9M views · 1 week ago", tc: "#fff200" },
  { c: ["#f953c6", "#b91d73"], e: "🔥", cap: "IT'S<br>OVER", d: "9:58", t: "This Changes EVERYTHING (Not Clickbait)", ch: "Hype House TV", m: "1.1M views · 3 hours ago", left: 1 },
  { c: ["#fc4a1a", "#f7b733"], e: "😂", cap: "TRY NOT<br>TO LAUGH", d: "31:20", t: "Funniest Fails of 2026 — Impossible Challenge", ch: "LOL Central", m: "22M views · 1 month ago" },
  { c: ["#4568dc", "#b06ab3"], e: "😳", cap: "WAIT<br>FOR IT", d: "15:33", t: "Top 10 Moments That Broke the Internet", ch: "TopTenzz", ver: 1, m: "5.6M views · 4 days ago", left: 1, arrow: 1 },
  { c: ["#e52d27", "#b31217"], e: "🚨", cap: "NOBODY<br>KNOWS", d: "11:11", t: "Why Nobody Talks About This…", ch: "Untold Facts", m: "2.4M views · 1 day ago" },
  { c: ["#f7971e", "#ffd200"], e: "🤑", cap: "FREE<br>MONEY?!", d: "8:46", t: "I Tried Every Side Hustle So You Don't Have To", ch: "Grindset", m: "900K views · 5 days ago", left: 1, tc: "#111" },
];

const CALM = [
  { s: "desk", c: ["#2b3240", "#3a3027"], d: "52:10", t: "Lecture 7: Dynamic Programming, Explained Slowly", ch: "Chris Codes", m: "41K views · 1 day ago" },
  { s: "track", c: ["#3f5e4a", "#b5653f"], d: "14:02", t: "Weekly Long Run — Training Log #14", ch: "Mia Runs", m: "8.2K views · 2 days ago" },
  { s: "mountains", c: ["#7fa7c9", "#e7c6a5"], d: "21:37", t: "Three Days in the Dolomites", ch: "Alpine Notes", m: "63K views · 4 days ago" },
  { s: "bread", c: ["#3a2f2a", "#5a4637"], d: "18:50", t: "Sunday Sourdough, Start to Finish", ch: "Bread Lab", m: "12K views · 5 days ago" },
  { s: "piano", c: ["#2a2340", "#4d3f6e"], d: "09:44", t: "Six Months Into Learning Piano — Honest Q&A", ch: "Tom Plays", m: "5.1K views · 1 week ago" },
  { s: "sea", c: ["#f0a37c", "#3a6d8c"], d: "11:25", t: "Building a Kayak From Scratch, Part 3", ch: "Woodshop Diaries", m: "27K views · 1 week ago" },
  { s: "desk", c: ["#33402f", "#2c2a26"], d: "38:05", t: "Reading Group: Chapter 4 Discussion", ch: "Slow Books", m: "3.9K views · 2 weeks ago" },
  { s: "mountains", c: ["#c99ad6", "#f2c79a"], d: "16:48", t: "A Quiet Week at the Cabin", ch: "Alpine Notes", m: "48K views · 2 weeks ago" },
];

const SHORTS = [
  { c: ["#ff0080", "#7928ca"], e: "🤪", t: "wait for the end 💀", v: "21M views" },
  { c: ["#f12711", "#f5af19"], e: "🍔", t: "rating every fast food…", v: "8.4M views" },
  { c: ["#00b4db", "#0083b0"], e: "🐶", t: "he did NOT expect that", v: "33M views" },
  { c: ["#8e2de2", "#4a00e0"], e: "💅", t: "POV: you're the main…", v: "4.7M views" },
  { c: ["#56ab2f", "#a8e063"], e: "⚽", t: "unreal skill 😳😳", v: "15M views" },
  { c: ["#ee0979", "#ff6a00"], e: "🎮", t: "rage quit compilation", v: "6.1M views" },
];

function shortCard(s) {
  return `<div class="sc"><div class="sth" style="background:linear-gradient(160deg,${s.c[0]},${s.c[1]})"><span>${s.e}</span></div>
    <div class="vt" style="margin-top:6px">${s.t}</div><div class="vs">${s.v}</div></div>`;
}

const YT_CSS = `
.ytm { position:absolute; inset:0; background:#0f0f0f; color:#f1f1f1; font-family:Roboto,Arial,sans-serif; overflow:hidden; }
.yt-top { height:52px; display:flex; align-items:center; gap:18px; padding:0 18px; }
.yt-burger { width:18px; display:grid; gap:4px; } .yt-burger i { height:2px; background:#ddd; border-radius:2px; }
.yt-mark { display:flex; align-items:center; gap:5px; font-weight:700; letter-spacing:-.06em; font-size:18px; font-family:Roboto, sans-serif; }
.yt-mark b { width:26px; height:18px; border-radius:5px; background:#ff0033; display:grid; place-items:center; }
.yt-mark b::after { content:""; border-left:7px solid #fff; border-top:4.5px solid transparent; border-bottom:4.5px solid transparent; margin-left:2px; }
.yt-search { flex:1; max-width:440px; margin:0 auto; height:34px; border-radius:18px; border:1px solid #303030; background:#121212; display:flex; align-items:center; padding-left:16px; color:#888; font-size:14px; }
.yt-me { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#8ec5fc,#e0c3fc); }
.yt-body { display:flex; }
.yt-side { width:190px; flex:none; padding:4px 10px; }
.yt-si { display:flex; align-items:center; gap:18px; height:38px; padding:0 12px; border-radius:10px; font-size:14px; color:#f1f1f1; }
.yt-si.on { background:#272727; font-weight:500; }
.yt-si svg { width:20px; height:20px; fill:#f1f1f1; flex:none; }
.yt-hr { height:1px; background:#2a2a2a; margin:10px 4px; }
.yt-main { flex:1; padding:0 18px 0 8px; min-width:0; }
.yt-chips { display:flex; gap:10px; height:44px; align-items:center; overflow:hidden; }
.yt-chips span { flex:none; font-size:13.5px; padding:6px 12px; border-radius:8px; background:#272727; font-weight:500; }
.yt-chips span:first-child { background:#f1f1f1; color:#0f0f0f; }
.grid { display:grid; grid-template-columns:repeat(var(--cols,4),1fr); gap:22px 16px; padding-top:10px; }
.vc { min-width:0; }
.th { position:relative; aspect-ratio:16/9; border-radius:10px; overflow:hidden; background:#222; }
.th > svg { position:absolute; inset:0; width:100%; height:100%; }
.th-emoji { position:absolute; top:50%; transform:translateY(-52%); font-size:var(--emoji,46px); line-height:1; filter:drop-shadow(0 4px 8px rgba(0,0,0,.4)); }
.th-cap { position:absolute; top:50%; transform:translateY(-50%); font:900 var(--cap,19px)/0.95 Geist, Impact, sans-serif; letter-spacing:-.02em; text-transform:uppercase; -webkit-text-stroke:1.5px rgba(0,0,0,.65); paint-order:stroke fill; text-shadow:0 3px 0 rgba(0,0,0,.35); }
.th-arrow { position:absolute; width:30%; left:36%; top:22%; }
.dur { position:absolute; right:6px; bottom:6px; background:rgba(0,0,0,.8); font-size:11px; font-weight:500; padding:1px 5px; border-radius:4px; color:#fff; }
.vm { display:flex; gap:10px; margin-top:10px; }
.av { width:30px; height:30px; border-radius:50%; flex:none; }
.vt { font-size:13.5px; font-weight:500; line-height:1.35; color:#f1f1f1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.vs { font-size:12px; color:#aaa; line-height:1.45; margin-top:3px; }
.shelf-h { display:flex; align-items:center; gap:10px; font-size:19px; font-weight:700; margin:26px 0 14px; }
.shelf-h b { width:22px; height:26px; border-radius:6px; background:#ff0033; display:grid; place-items:center; }
.shelf-h b::after { content:""; border-left:6px solid #fff; border-top:4px solid transparent; border-bottom:4px solid transparent; margin-left:2px; }
.shelf { display:grid; grid-template-columns:repeat(var(--scols,5),1fr); gap:12px; }
.sth { aspect-ratio:9/16; border-radius:12px; display:grid; place-items:center; font-size:54px; }
.yt-h { font-size:20px; font-weight:700; height:44px; display:flex; align-items:center; gap:12px; }
.yt-h small { font-size:13px; font-weight:500; color:#aaa; }
`;

const YI = {
  home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-6h-5v6H4z"/>',
  shorts: '<path d="M16.8 3.4a3.6 3.6 0 0 1 1.5 6.3l-1.2.7 1.3.6a3.6 3.6 0 0 1-.2 6.6l-7.4 3.6a3.6 3.6 0 0 1-3.3-6.4l1.2-.7-1.3-.6a3.6 3.6 0 0 1 .2-6.6zM10 9v6l5-3z"/>',
  subs: '<path d="M4 6h16v2H4zm2-3h12v2H6zm-2 7h16v11H4zm6 2.5v6l5-3z"/>',
  you: '<path d="M4 4h10v2H6v12h12v-4h2v6H4zm11 0h5v5h-2V7.4l-5.3 5.3-1.4-1.4L16.6 6H15z"/>',
  hist: '<path d="M13 3a9 9 0 1 1-8.95 10H6a7 7 0 1 0 2-5.6L10 9.5H4v-6l2.6 2.6A9 9 0 0 1 13 3zm-1 5h2v4.6l3.3 2-1 1.7L12 13.6z"/>',
  later: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.5 2.1-1 1.6L11 13V7h2z"/>',
  trend: '<path d="M13.5 2s1 3.5-1.5 6.5S8 13 8 15.5a4 4 0 0 0 8 0c0-1.5-.5-2.5-.5-2.5S19 14 19 17a7 7 0 0 1-14 0c0-5 4-7 6-10 1.3-2 2.5-5 2.5-5z"/>',
  music: '<path d="M12 3v10.6A4 4 0 1 0 14 17V7h4V3z"/>',
  game: '<path d="M7 7h10a5 5 0 0 1 0 10c-1.6 0-2.5-1-3.3-2h-3.4C9.5 16 8.6 17 7 17A5 5 0 0 1 7 7zm-.5 3v1.5H5v1h1.5V14h1v-1.5H9v-1H7.5V10zm9.5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>',
};

function ySide(items) {
  return `<div class="yt-side">${items
    .map((it) => (it === "hr" ? '<div class="yt-hr"></div>' : `<div class="yt-si ${it.on ? "on" : ""}"><svg viewBox="0 0 24 24">${YI[it.i]}</svg>${it.l}</div>`))
    .join("")}</div>`;
}

function ytTop() {
  return `<div class="yt-top"><div class="yt-burger"><i></i><i></i><i></i></div><div class="yt-mark"><b></b>YouTube</div>
    <div class="yt-search">Search</div><div class="yt-me"></div></div>`;
}

// Algorithmic home page: chips, bait grid, Shorts shelf, more bait.
function ytBefore(opts = {}) {
  const cols = opts.cols || 4;
  return `<div class="ytm" style="--cols:${cols};--scols:${opts.scols || 6}">${ytTop()}<div class="yt-body">
    ${ySide([{ i: "home", l: "Home", on: 1 }, { i: "shorts", l: "Shorts" }, { i: "subs", l: "Subscriptions" }, "hr", { i: "you", l: "You" }, { i: "hist", l: "History" }, { i: "later", l: "Watch later" }, "hr", { i: "trend", l: "Trending" }, { i: "music", l: "Music" }, { i: "game", l: "Gaming" }])}
    <div class="yt-main"><div class="yt-chips">${["All", "Gaming", "Music", "Mixes", "Live", "Reactions", "Challenges", "Pranks", "Podcasts", "Recently uploaded"].map((c) => `<span>${c}</span>`).join("")}</div>
      <div class="grid">${BAIT.slice(0, cols).map((v, i) => card(v, i, "bait")).join("")}</div>
      <div class="shelf-h"><b></b>Shorts</div>
      <div class="shelf">${SHORTS.slice(0, opts.scols || 6).map(shortCard).join("")}</div>
      <div class="grid" style="padding-top:26px">${BAIT.slice(cols, cols * 2).map((v, i) => card(v, i + 3, "bait")).join("")}</div>
    </div></div></div>`;
}

// What the extension leaves you with: Subscriptions, no Shorts, no trending.
function ytAfter(opts = {}) {
  const cols = opts.cols || 4;
  return `<div class="ytm" style="--cols:${cols}">${ytTop()}<div class="yt-body">
    ${ySide([{ i: "home", l: "Home" }, { i: "subs", l: "Subscriptions", on: 1 }, "hr", { i: "you", l: "You" }, { i: "hist", l: "History" }, { i: "later", l: "Watch later" }])}
    <div class="yt-main"><div class="yt-h">Latest<small>from channels you subscribe to</small></div>
      <div class="grid">${CALM.slice(0, cols).map((v, i) => card(v, i, "calm")).join("")}</div>
      <div class="grid" style="padding-top:26px">${CALM.slice(cols, cols * 2).map((v, i) => card(v, i + 2, "calm")).join("")}</div>
      <div class="grid" style="padding-top:26px">${CALM.slice(0, cols).reverse().map((v, i) => card(v, i + 5, "calm")).join("")}</div>
    </div></div></div>`;
}

/* ---------------- removed-feature cards ---------------- */

const RM_CSS = `
.rm { display:flex; align-items:center; gap:16px; padding:14px 18px 14px 14px; border-radius:16px;
  background:linear-gradient(180deg,rgba(28,28,30,.92),rgba(16,16,17,.92)); backdrop-filter:blur(14px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 0 0 1px rgba(255,255,255,.09),0 24px 50px -16px rgba(0,0,0,.9); }
.rm-x { width:40px; height:40px; flex:none; border-radius:12px; display:grid; place-items:center; background:rgba(255,77,90,.12); box-shadow:inset 0 0 0 1px rgba(255,77,90,.3); }
.rm-x svg { width:18px; height:18px; }
.rm-t { font-size:19px; font-weight:600; letter-spacing:-.015em; }
.rm-d { font-size:15px; color:var(--muted); margin-top:2px; letter-spacing:-.005em; }
.rm-tag { margin-left:auto; flex:none; font-size:12.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--lime);
  padding:6px 10px; border-radius:999px; background:rgba(184,255,60,.1); box-shadow:inset 0 0 0 1px rgba(184,255,60,.3); }
`;

function rmCard(title, desc, tag = "Removed") {
  return `<div class="rm"><div class="rm-x"><svg viewBox="0 0 24 24" fill="none" stroke="#ff5a66" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></div>
    <div><div class="rm-t">${title}</div><div class="rm-d">${desc}</div></div><span class="rm-tag">${tag}</span></div>`;
}

/* ---------------- the real popup, recreated ---------------- */

const POP_CSS = `
.pop { width:200px; height:270px; background:#000; color:#fff; display:flex; flex-direction:column; align-items:center;
  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; border-radius:0; overflow:hidden; }
.pop h1 { font-size:24px; font-weight:700; margin:10px 0; line-height:1.15; }
.pop .mm { flex:1; width:100%; display:flex; flex-direction:column; align-items:center; border-top:1px solid rgb(97,96,96); border-radius:20px 20px 0 0; }
.pop .mc { flex:1; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; border-bottom:1px solid rgb(97,96,96); border-radius:0 0 20px 20px; }
.pop .tt { font-size:20px; text-align:center; line-height:1.15; }
.pop .ld { font-size:22px; line-height:1; margin:10px 0 24px; letter-spacing:4px; }
.pop .b { font-size:16px; padding:5px 10px; border-radius:10px; border:1px solid greenyellow; }
.pop .b.red { border-color:red; font-size:15px; }
.pop .ft { font-size:13.5px; border:1px solid rgb(97,96,96); border-radius:10px; padding:5px 10px; margin:10px 0; }
.pop .cs { font-size:10px; margin:10px 0 22px; }
.pop .ci { display:flex; gap:10px; }
.pop .ci i { width:30px; height:30px; border:1px solid greenyellow; border-radius:5px; display:grid; place-items:center; font-style:normal; font-weight:700; font-size:18px; }
.pop .ci i.cur { box-shadow:0 0 0 2px rgba(173,255,47,.25); }
.pop .ci i.cur::after { content:""; width:1.5px; height:18px; background:#fff; }
.pop .row { width:80%; display:flex; margin-bottom:10px; font-size:16px; }
.pop .row span { flex:1; border-bottom:1px solid rgb(97,96,96); border-radius:0 0 5px 0; }
.pop .row b { font-weight:400; border:1px solid greenyellow; border-radius:10px; padding:1px 9px; }
`;

function popup(state) {
  if (state === "on")
    return `<div class="pop"><h1>ND</h1><div class="mm"><div class="mc"><div class="tt" style="margin-top:14px">Removing<br>distractions</div><div class="ld">•••</div><div class="b">Turn off blocking</div></div><div class="ft">Other settings</div></div></div>`;
  if (state === "code")
    return `<div class="pop"><h1>ND</h1><div class="mm"><div class="mc" style="justify-content:flex-start;padding-top:22px"><div class="tt">Type 4 2 5 7<br>to continue</div><div class="cs">*Quick friction to stop autopilot.</div><div class="ci"><i>4</i><i>2</i><i class="cur"></i><i></i></div></div><div class="ft">Back</div></div></div>`;
  if (state === "paused")
    return `<div class="pop"><h1>ND</h1><div class="mm"><div class="mc"><div class="tt" style="margin-top:14px">Temporarily<br>turned off</div><div class="ld">•••</div><div class="b red">Reverts back in: 59:53</div></div><div class="ft">Other settings</div></div></div>`;
  return `<div class="pop"><h1>ND</h1><div class="mm"><div class="mc">${["Youtube", "Facebook", "Instagram", "Reddit"].map((s) => `<div class="row"><span>${s}</span><b>On</b></div>`).join("")}</div><div class="ft">Back</div></div></div>`;
}

function inject(css) {
  const s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
}
