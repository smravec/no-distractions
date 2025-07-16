if (typeof browser === "undefined") {
  var browser = chrome;
}

// chrome.storage.sync.set({ yt: true }).then(() => {
//   console.log("Value is set");
// });

// Call this function when needed, e.g., on button click or page load


// chrome.storage.sync.get("yt_hidden", (result) => {
//   if (result.yt_hidden == undefined) {
//     yt = true;
//   } else {
//     yt = false;
//   }
// });

let general_switch = true;

let yt = true;
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

// Load saved value on popup open
browser.storage.sync.get(["fb"], (result) => {
  fb = result.fb !== undefined ? result.fb : true;

  // Update button style
  fb_btn.style.borderColor = fb ? "greenyellow" : "red";
});

// Add click listener
fb_btn.addEventListener("click", () => {
  fb = !fb; // toggle
  fb_btn.style.borderColor = fb ? "greenyellow" : "red";

  // Save to storage
  browser.storage.sync.set({ fb });

  // Check if active tab is facebook.com → reload it
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && activeTab.url.includes("facebook.com")) {
      browser.tabs.reload(activeTab.id);
    }
  });
});

//Instagram button
const ig_btn = document.getElementById("instagram");

// Load saved value on popup open
browser.storage.sync.get(["ig"], (result) => {
  ig = result.ig !== undefined ? result.ig : true;

  // Update button style
  ig_btn.style.borderColor = ig ? "greenyellow" : "red";
});

// Add click listener
ig_btn.addEventListener("click", () => {
  ig = !ig; // toggle
  ig_btn.style.borderColor = ig ? "greenyellow" : "red";

  // Save to storage
  browser.storage.sync.set({ ig });

  // Check if active tab is instagram.com → reload it
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && activeTab.url.includes("instagram.com")) {
      browser.tabs.reload(activeTab.id);
    }
  });
});

  //Reddit button
const rd_btn = document.getElementById("reddit");

// Load saved value on popup open
browser.storage.sync.get(["rd"], (result) => {
  rd = result.rd !== undefined ? result.rd : true;

  // Update button style
  rd_btn.style.borderColor = rd ? "greenyellow" : "red";
});

// Add click listener
rd_btn.addEventListener("click", () => {
  rd = !rd; // toggle
  rd_btn.style.borderColor = rd ? "greenyellow" : "red";

  // Save to storage
  browser.storage.sync.set({ rd });

      // Check if active tab is reddit.com → reload it
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && activeTab.url.includes("reddit.com")) {
      browser.tabs.reload(activeTab.id);
    }
  });
});

// //General switch button
// const general_switch_btn = document.getElementById("general_switch");

// // Sets the initial style
// if (fb) {
//   general_switch_btn.style.borderColor = "greenyellow";
// } else {
//   general_switch_btn.style.borderColor = "red";
// }

// general_switch_btn.addEventListener("click", () => {
//   general_switch = !general_switch;
//   if (general_switch) {
//     general_switch_btn.style.borderColor = "greenyellow";
//   } else {
//     general_switch_btn.style.borderColor = "red";
//   }
// });