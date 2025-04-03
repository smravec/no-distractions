let cssInjected = false;

function injectCSS() {
  if (cssInjected) return;
  
  const style = document.createElement('style');
  style.id = 'instagram-no-suggested-posts-style';
  style.textContent = `
    article {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
  cssInjected = true;
  console.log('CSS injected for MainPage');
}

//Main page clean
//Deletes all the content under suggestions
function MainPageClean(){
    setTimeout(injectCSS, 1000)
}

//Explore/search page clean
//Deletes all the bs videos under search
function ExplorePageClean(){

}

//Reels page clean
//Deletes the entire reels leaving only the bottom bar
function ReelsPageClean(){

}

function updateCSS(){
    if (window.location.pathname === "/"){
        MainPageClean()
    }
    else if(window.location.pathname === "/explore"){
        ExplorePageClean()
    }
    else if(window.location.pathname === "/reels"){
        ReelsPageClean()
    }
}

// Check for url change
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
const url = location.href;
if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to:', url);
    setTimeout(updateCSS, 1000);
  }
});

urlObserver.observe(document, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true
});  

updateCSS()