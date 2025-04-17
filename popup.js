if (typeof browser === "undefined") {
  var browser = chrome;
}

// chrome.storage.sync.set({ yt: true }).then(() => {
//   console.log("Value is set");
// });

// Call this function when needed, e.g., on button click or page load

let yt;
chrome.storage.local.get(["yt_var"], function (result) {
  yt = result;
});
let fb = true;
let ig = true;
let rd = true;

//Youtube button
const yt_btn = document.getElementById("youtube");

// Sets the initial style
if (yt) {
  yt_btn.style.borderColor = "greenyellow";
} else {
  yt_btn.style.borderColor = "red";
}

yt_btn.addEventListener("click", () => {
  chrome.storage.local.set({ yt_var: !yt }, function () {
    if (chrome.runtime.lastError) {
      alert("Error setting value:", chrome.runtime.lastError);
    } else {
      alert("Successfully set yt to", toString(!yt));
    }
  });

  yt = !yt;
  if (yt) {
    yt_btn.style.borderColor = "greenyellow";
  } else {
    yt_btn.style.borderColor = "red";
  }
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
