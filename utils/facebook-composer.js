// "What's on your mind?" card for the Feeds views. Facebook only shows its
// composer on the algorithmic home, which we redirect away from, so this
// card stands in for it and opens Facebook's own Create post dialog.

// Feeds filters that get the card. Notifications is a Feeds view too, but
// nobody posts from there.
const COMPOSER_FILTERS = ["friends", "favorites", "groups", "pages"];

const FEEDS_PANEL_LINK = "[role=navigation] a[href='/?filter=favorites&sk=h_chr']";
const CARD_SELECTOR = "[data-nd-fb-composer]";
const COMPOSING_CLASS = "nd-fb-composing";

// One open flow at a time; a double click must not toggle the menu twice.
let busy = false;

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// Resolves to fn()'s first truthy value, or null once timeoutMs has passed.
async function poll(fn, timeoutMs, stepMs = 50) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const value = fn();
    if (value) {
      return value;
    }
    if (Date.now() >= end) {
      return null;
    }
    await sleep(stepMs);
  }
}

function isComposerRoute() {
  let u;
  try {
    u = new URL(window.location.href);
  } catch (e) {
    return false;
  }
  return u.pathname === "/" && COMPOSER_FILTERS.includes(u.searchParams.get("filter"));
}

// The visually hidden "Feed posts" heading: the only h2 on Feeds views. Its
// parent holds [h2, empty aria-hidden div, feed list], so the card sits
// right above the first post.
function findAnchor() {
  const anchor = document.querySelector("div[role=main] h2");
  if (!anchor || !anchor.parentElement || anchor.parentElement.children.length < 2) {
    return null;
  }
  return anchor;
}

// The signed-in user's picture from the banner's account button. Only an
// fbcdn URL is trusted; anything else falls back to an empty circle.
function readAvatar() {
  const image = document.querySelector("[role=banner] svg[role=img] image");
  if (!image) {
    return null;
  }
  const src = image.getAttribute("xlink:href") || image.getAttribute("href");
  if (!src) {
    return null;
  }
  // Check the parsed host, not the string: "https://x.com?.fbcdn.net/"
  // would pass a pattern match.
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname.endsWith(".fbcdn.net")
      ? src
      : null;
  } catch (e) {
    return null;
  }
}

function buildAvatar(src) {
  if (src) {
    const img = document.createElement("img");
    img.className = "nd-fb-composer-avatar";
    img.setAttribute("alt", "");
    img.setAttribute("src", src);
    return img;
  }
  const span = document.createElement("span");
  span.className = "nd-fb-composer-avatar nd-fb-composer-avatar-empty";
  return span;
}

// Writes only when the avatar actually changed, so a settled page sees no
// mutations from the observer pass.
function refreshAvatar(card) {
  const current = card.querySelector(".nd-fb-composer-avatar");
  const src = readAvatar();
  if (current && current.tagName === "IMG" && src) {
    if (current.getAttribute("src") !== src) {
      current.setAttribute("src", src);
    }
    return;
  }
  if (current && current.tagName === "SPAN" && !src) {
    return;
  }
  const next = buildAvatar(src);
  if (current) {
    current.replaceWith(next);
  } else {
    card.prepend(next);
  }
}

function buildAction(label, action) {
  const btn = document.createElement("div");
  btn.className = "nd-fb-composer-action";
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-nd-fb-action", action);
  const icon = document.createElement("i");
  icon.className = "nd-fb-composer-icon";
  icon.setAttribute("data-nd-fb-icon", action);
  btn.append(icon);
  return btn;
}

function actionFrom(target) {
  const el = target && target.closest ? target.closest("[data-nd-fb-action]") : null;
  return el ? el.getAttribute("data-nd-fb-action") : null;
}

function buildCard() {
  const card = document.createElement("div");
  card.className = "nd-fb-composer";
  card.setAttribute("data-nd-fb-composer", "1");

  card.append(buildAvatar(readAvatar()));

  const pill = document.createElement("div");
  pill.className = "nd-fb-composer-pill";
  pill.setAttribute("role", "button");
  pill.setAttribute("tabindex", "0");
  pill.setAttribute("data-nd-fb-action", "text");
  const text = document.createElement("span");
  text.textContent = "What's on your mind?";
  pill.append(text);
  card.append(pill);

  card.append(buildAction("Photo/video", "photo"));
  card.append(buildAction("Feeling/activity", "feeling"));

  card.addEventListener("click", function (e) {
    const action = actionFrom(e.target);
    if (action) {
      openComposer(action);
    }
  });
  card.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }
    const action = actionFrom(e.target);
    if (action) {
      e.preventDefault();
      openComposer(action);
    }
  });
  return card;
}

// Runs on every observer pass, so it must not touch a DOM that is already
// right; any write here would retrigger the observer forever.
export function fbSyncComposer() {
  const anchor =
    isComposerRoute() && document.querySelector(FEEDS_PANEL_LINK) ? findAnchor() : null;
  const keep = anchor ? anchor.nextElementSibling : null;
  const ours = keep && keep.matches(CARD_SELECTOR) ? keep : null;

  for (const card of document.querySelectorAll(CARD_SELECTOR)) {
    if (card !== ours) {
      card.remove();
    }
  }
  if (!anchor) {
    return;
  }
  if (ours) {
    refreshAvatar(ours);
    return;
  }
  anchor.after(buildCard());
}

export function fbRemoveComposer() {
  for (const card of document.querySelectorAll(CARD_SELECTOR)) {
    card.remove();
  }
  const root = document.documentElement;
  if (root.classList.contains(COMPOSING_CLASS)) {
    root.classList.remove(COMPOSING_CLASS);
  }
}

// The banner's last navigation holds the menu, notifications and account
// buttons; the menu is first. Matched by structure, never by its
// (localised) label.
function findMenuButton() {
  const navs = [...document.querySelectorAll("[role=banner] [role=navigation]")];
  const last = navs[navs.length - 1];
  return last ? last.querySelector("[role=button]") : null;
}

// The menu's Create grid reads Post (button), Story (link), Reel (button)...
// The story link has a stable href, so Post is the button just before it.
// Two copies of the menu exist; only the rendered one has rects.
function findPostButton() {
  for (const story of document.querySelectorAll("[role=dialog] a[href='/stories/create/']")) {
    if (!story.getClientRects().length) {
      continue;
    }
    let c = story.parentElement;
    while (c && !c.querySelector("[role=button]")) {
      c = c.parentElement;
    }
    if (!c) {
      continue;
    }
    const post = [...c.querySelectorAll("[role=button]")].find(function (b) {
      return b.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    if (post) {
      return post;
    }
  }
  return null;
}

function findComposerDialog() {
  for (const dialog of document.querySelectorAll("[role=dialog]")) {
    if (dialog.getClientRects().length && dialog.querySelector("[contenteditable=true]")) {
      return dialog;
    }
  }
  return null;
}

// The "Add to your post" row: buttons after the text box with a real icon
// (the composer's own decoration lives under /images/composer/). Live order
// is Photo/video, Tag people, Feeling/activity, Check in, GIF.
function findAddButtons(dialog) {
  const editor = dialog.querySelector("[contenteditable=true]");
  return [...dialog.querySelectorAll("[role=button]")].filter(function (b) {
    if (!(editor.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      return false;
    }
    const img = b.querySelector("img");
    return img && !(img.getAttribute("src") || "").includes("/images/composer/");
  });
}

// True when the buttons are one row of siblings. Each icon button sits in
// its own stack of wrappers (Photo/video's also holds the file input), so
// rather than a shared parentElement this checks for a close common
// ancestor in which every button occupies a different child.
const ROW_MAX_DEPTH = 5;

function isOneRow(buttons) {
  function holdsAll(el) {
    return buttons.every(function (b) {
      return el.contains(b);
    });
  }
  let row = buttons[0].parentElement;
  for (let i = 0; row && i < ROW_MAX_DEPTH && !holdsAll(row); i++) {
    row = row.parentElement;
  }
  if (!row || !holdsAll(row)) {
    return false;
  }
  const cells = new Set();
  for (const b of buttons) {
    let cell = b;
    let depth = 0;
    while (cell.parentElement !== row) {
      cell = cell.parentElement;
      depth++;
      if (!cell || depth >= ROW_MAX_DEPTH) {
        return false;
      }
    }
    cells.add(cell);
  }
  return cells.size === buttons.length;
}

// Opens the real Create post dialog in place by driving the hidden menu
// (the CSS keeps the menu invisible while nd-fb-composing is set). The
// photo picker needs the user's click activation, which lasts a few
// seconds, so the whole flow has to stay quick.
async function openComposer(action) {
  if (busy) {
    return;
  }
  busy = true;
  const root = document.documentElement;
  try {
    root.classList.add(COMPOSING_CLASS);
    const menuBtn = findMenuButton();
    let post = null;
    if (menuBtn) {
      if (menuBtn.getAttribute("aria-expanded") !== "true") {
        menuBtn.click();
      }
      post = await poll(findPostButton, 3000);
    }
    if (!post) {
      // The own profile has its own composer.
      if (menuBtn && menuBtn.getAttribute("aria-expanded") === "true") {
        menuBtn.click();
      }
      root.classList.remove(COMPOSING_CLASS);
      window.location.assign("/me/");
      return;
    }
    post.click();
    const closed = await poll(function () {
      return menuBtn.getAttribute("aria-expanded") !== "true";
    }, 1000);
    if (!closed) {
      menuBtn.click();
    }
    if (action !== "photo" && action !== "feeling") {
      return;
    }
    const dialog = await poll(findComposerDialog, 3000);
    if (!dialog) {
      return;
    }
    const buttons = findAddButtons(dialog);
    // Integrity gate: if the row doesn't look as expected, leave the plain
    // dialog open rather than click the wrong button.
    if (buttons.length < 5 || !isOneRow(buttons)) {
      return;
    }
    buttons[action === "photo" ? 0 : 2].click();
  } catch (e) {
    // Never throw out of the event handler.
  } finally {
    if (root.classList.contains(COMPOSING_CLASS)) {
      root.classList.remove(COMPOSING_CLASS);
    }
    busy = false;
  }
}
