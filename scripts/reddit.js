/* TODO (past mvp) fix on mobile does not apply on page reload*/
//Clean sidebar from /r popular and /r all
function injectCSSIntoShadow(interval) {
  const host = document.querySelector("left-nav-top-section");
  if (!host || !host.shadowRoot) return;

  const style = document.createElement("style");
  style.textContent = `
    faceplate-tracker[noun="popular"],
    faceplate-tracker[noun="all"]
    {
      display: none !important;
    }
  `;

  host.shadowRoot.appendChild(style);
  clearInterval(interval);
}

//Try injecting it
let tries = 0;
const interval = setInterval(() => {
  injectCSSIntoShadow(interval);
  if (++tries > 10) clearInterval(interval);
}, 500);
