// A "Shortcuts" section under the Feeds panel on Facebook's left rail. The
// home page's own shortcut column is hidden with the algorithmic feed, so
// these give back the destinations people actually use.

// Order and keys are shared with facebook.css (the icon sprite offsets).
// Never point an entry at the Friends feed: that link is the healthy marker
// fixFriendsRender looks for.
const SHORTCUTS = [
  { key: "groups", label: "Groups", href: "/groups/feed/" },
  { key: "marketplace", label: "Marketplace", href: "/marketplace/" },
  { key: "saved", label: "Saved", href: "/saved/" },
  { key: "events", label: "Events", href: "/events/" },
  { key: "pages", label: "Pages", href: "/pages/?category=your_pages" },
  {
    key: "ads",
    label: "Ads Manager",
    href: "https://adsmanager.facebook.com/adsmanager/",
  },
  {
    key: "suite",
    label: "Meta Business Suite",
    href: "https://business.facebook.com/latest/home",
  },
];

const FAVORITES_HREF = "/?filter=favorites&sk=h_chr";

// Feeds rows to copy markup from, best first. All is never used: the content
// script hides it inline.
const TEMPLATE_HREFS = [
  "/?filter=pages&sk=h_chr",
  "/?filter=groups&sk=h_chr",
  FAVORITES_HREF,
  "/?filter=notifications&sk=h_chr",
];

// Attributes that must not be duplicated (ids, the a11y references to them)
// or that mark the selected filter or the content script's own bookkeeping.
const STRIP_ATTRS = [
  "id",
  "aria-current",
  "aria-labelledby",
  "aria-describedby",
  "data-nd-fb-hidden",
  "data-nd-fb-href",
];

// The outermost single-child wrapper of a Feeds link, i.e. its row in the
// list. Same walk as hideFeedsAllItem, so both agree on what a row is.
function rowOf(a, nav) {
  let n = a;
  while (
    n.parentElement &&
    n.parentElement !== nav &&
    n.parentElement.children.length === 1
  ) {
    n = n.parentElement;
  }
  return n;
}

// The row of a filter link that is neither selected nor hidden, so the
// clone never carries the current filter's highlight.
function findTemplate(nav) {
  for (const href of TEMPLATE_HREFS) {
    const a = nav.querySelector("a[href='" + href + "']");
    if (!a || a.hasAttribute("aria-current")) {
      continue;
    }
    const row = rowOf(a, nav);
    if (row.hasAttribute("data-nd-fb-hidden")) {
      continue;
    }
    return row;
  }
  return null;
}

function depthIn(el, root) {
  let d = 0;
  for (let n = el; n && n !== root; n = n.parentElement) {
    d++;
  }
  return d;
}

// The deepest element holding visible text: Facebook nests the label in
// several spans and only the innermost one carries the string.
function labelElement(root) {
  let best = null;
  let bestDepth = -1;
  for (const el of root.querySelectorAll("*")) {
    const hasText = Array.from(el.childNodes).some(
      (c) => c.nodeType === Node.TEXT_NODE && c.textContent.trim() !== ""
    );
    if (!hasText) {
      continue;
    }
    const d = depthIn(el, root);
    if (d > bestDepth) {
      best = el;
      bestDepth = d;
    }
  }
  return best;
}

function buildRow(template, item) {
  const row = template.cloneNode(true);
  const a = row.tagName === "A" ? row : row.querySelector("a");
  if (a) {
    a.setAttribute("href", item.href);
  }
  for (const el of [row, ...row.querySelectorAll("*")]) {
    for (const name of STRIP_ATTRS) {
      if (el.hasAttribute(name)) {
        el.removeAttribute(name);
      }
    }
    if (el.style && el.style.getPropertyValue("display")) {
      el.style.removeProperty("display");
    }
  }
  row.setAttribute("data-nd-fb-shortcut", item.key);

  const label = labelElement(row);
  if (label) {
    label.textContent = item.label;
  }

  // Swap the filter's round icon (and its single-child wrappers) for a
  // sprite slot; facebook.css sizes it and picks the image by key.
  const svg = row.querySelector("svg");
  if (svg) {
    let icon = svg;
    while (
      icon.parentElement &&
      icon.parentElement !== a &&
      icon.parentElement.children.length === 1 &&
      (!a || a.contains(icon.parentElement))
    ) {
      icon = icon.parentElement;
    }
    const span = document.createElement("span");
    span.className = "nd-fb-shortcut-icon";
    span.setAttribute("data-nd-fb-icon", item.key);
    icon.replaceWith(span);
  }
  return row;
}

function buildSection(template) {
  const section = document.createElement("div");
  section.className = "nd-fb-shortcuts";
  section.setAttribute("data-nd-fb-shortcuts", "1");
  const divider = document.createElement("div");
  divider.className = "nd-fb-shortcuts-divider";
  const head = document.createElement("div");
  head.className = "nd-fb-shortcuts-head";
  head.textContent = "Shortcuts";
  section.append(divider, head);
  for (const item of SHORTCUTS) {
    section.append(buildRow(template, item));
  }
  return section;
}

export function fbRemoveShortcuts() {
  document.querySelectorAll("[data-nd-fb-shortcuts]").forEach((s) => {
    s.remove();
  });
}

// Runs on every observer pass, so it must not touch the DOM when the section
// is already in place: any write would trigger the next pass, forever.
export function fbSyncShortcuts() {
  const fav = document.querySelector(
    "[role=navigation] a[href='" + FAVORITES_HREF + "']"
  );
  if (!fav) {
    fbRemoveShortcuts();
    return;
  }
  const nav = fav.closest("[role=navigation]");
  const list = rowOf(fav, nav).parentElement;
  if (!list) {
    fbRemoveShortcuts();
    return;
  }

  const sections = document.querySelectorAll("[data-nd-fb-shortcuts]");
  if (
    sections.length === 1 &&
    sections[0].previousElementSibling === list &&
    sections[0].querySelectorAll("[data-nd-fb-shortcut]").length ===
      SHORTCUTS.length
  ) {
    return;
  }

  fbRemoveShortcuts();
  const template = findTemplate(nav);
  if (!template) {
    return;
  }
  // After the list, not inside it: hideFeedsAllItem's single-child walk from
  // the All link stays exactly as before.
  list.after(buildSection(template));
}
