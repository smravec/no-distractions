export default defineContentScript({
  matches: ["https://www.instagram.com/*"],
  runAt: "document_start",
  allFrames: true,
  main() {
    const extensionApi =
      typeof browser !== "undefined"
        ? browser
        : typeof chrome !== "undefined"
          ? chrome
          : null;

    if (!extensionApi?.storage?.sync) {
      return;
    }

    extensionApi.storage.sync.get(["ig", "general_switch"], (result) => {
      const generalSwitch =
        result.general_switch !== undefined ? result.general_switch : true;
      const instagramToggle = result.ig !== undefined ? result.ig : true;
      const enableIg = generalSwitch && instagramToggle;

      if (!enableIg) {
        return;
      }

      const hide = (elements) => {
        if (!elements) {
          return;
        }

        if (elements instanceof Node) {
          elements.style.setProperty("display", "none", "important");
          return;
        }

        if (elements instanceof NodeList) {
          elements.forEach((element) => {
            element.style.setProperty("display", "none", "important");
          });
        }
      };

      function onMutation() {
        const body = document.body;
        if (!body) {
          return;
        }

        const suggestedFollowersLink = body.querySelector(
          "a[href*='/explore/people/']",
        );
        const suggestedFollowersTitle = suggestedFollowersLink?.closest("div");
        const suggestedFollowers = suggestedFollowersTitle?.nextElementSibling;

        hide(suggestedFollowersLink);
        hide(suggestedFollowersTitle);
        hide(suggestedFollowers);
      }

      const mutationObserver = new MutationObserver(onMutation);
      mutationObserver.observe(document, {
        subtree: true,
        childList: true,
      });

      onMutation();
    });
  },
});
