if (typeof browser === "undefined") {
  var browser = chrome;
}

// chrome.storage.sync.set({ yt: true }).then(() => {
//   console.log("Value is set");
// });

// Call this function when needed, e.g., on button click or page load

let yt = true;
// chrome.storage.sync.get("yt_hidden", (result) => {
//   if (result.yt_hidden == undefined) {
//     yt = true;
//   } else {
//     yt = false;
//   }
// });

let fb = true;
let ig = true;
let rd = true;

//Youtube button
const yt_btn = document.getElementById("youtube");

// Load saved value on popup open
browser.storage.sync.get(["yt"], (result) => {
  yt = result.yt !== undefined ? result.yt : true;

  // Update button style
  yt_btn.style.borderColor = yt ? "greenyellow" : "red";
});

// Add click listener
yt_btn.addEventListener("click", () => {
  yt = !yt; // toggle
  yt_btn.style.borderColor = yt ? "greenyellow" : "red";

  // Save to storage
  browser.storage.sync.set({ yt });

  // Check if active tab is youtube.com → reload it
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && activeTab.url.includes("youtube.com")) {
      browser.tabs.reload(activeTab.id);
    }
  });
});

//Facebook button
const fb_btn = document.getElementById("facebook");

// Sets the initial style
if (fb) {
  fb_btn.style.borderColor = "greenyellow";
} else {
  fb_btn.style.borderColor = "red";
}

fb_btn.addEventListener("click", () => {
  fb = !fb;
  if (fb) {
    fb_btn.style.borderColor = "greenyellow";
  } else {
    fb_btn.style.borderColor = "red";
  }
});

//Instragram button
const ig_btn = document.getElementById("instagram");

// Sets the initial style
if (ig) {
  ig_btn.style.borderColor = "greenyellow";
} else {
  ig_btn.style.borderColor = "red";
}

ig_btn.addEventListener("click", () => {
  ig = !ig;
  if (ig) {
    ig_btn.style.borderColor = "greenyellow";
  } else {
    ig_btn.style.borderColor = "red";
  }
});

//Reddit button
const rd_btn = document.getElementById("reddit");

// Sets the initial style
if (rd) {
  rd_btn.style.borderColor = "greenyellow";
} else {
  rd_btn.style.borderColor = "red";
}

rd_btn.addEventListener("click", () => {
  rd = !rd;
  if (rd) {
    rd_btn.style.borderColor = "greenyellow";
  } else {
    rd_btn.style.borderColor = "red";
  }
});
