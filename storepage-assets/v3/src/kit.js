// v3 helpers on top of lib.js (ICON, LOGO_PATH).
function mark() {
  return `<div class="mark"><svg viewBox="0 0 200 200"><path d="${LOGO_PATH}" fill="#fff"/></svg></div>`;
}

function flatTiles(size, gap = 8) {
  return `<span class="tiles" style="gap:${gap}px">${["yt", "ig", "fb", "rd"]
    .map((id) => `<span class="t ${id}" style="width:${size}px;height:${size}px"><svg viewBox="0 0 24 24">${ICON[id]}</svg></span>`)
    .join("")}</span>`;
}

function pair(before, after) {
  return `<div class="pair">
    <div><div class="lbl">Without</div><div class="shot"><img src="captures/${before}"></div></div>
    <div><div class="lbl on">With No Distractions</div><div class="shot"><img src="captures/${after}"></div></div>
  </div>`;
}
