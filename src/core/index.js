  async function run() {
    if (!isAllowedForumUrl(location.href)) {
      destroyPatchPage(document);
      return null;
    }

    const root = findSourceRoot(document);
    if (!root) {
      destroyPatchPage(document);
      return null;
    }
    const runId = ++state.renderRunId;

    injectStyles(document);

    const tokens = collectTokens(root);
    const patch = parsePatch(tokens);
    renderPatchPage(document, root, patch);

    return resolveIcons(patch)
      .then((resolvedPatch) => {
        if (runId !== state.renderRunId) return null;
        renderPatchPage(document, root, resolvedPatch);
        return resolvedPatch;
      })
      .catch((error) => {
        if (runId !== state.renderRunId) return null;
        state.wikiDone = true;
        renderPatchPage(document, root, patch);
        console.warn("[PoE2Dire] Wiki icon lookup failed:", error);
        return patch;
      });
  }

  function setupExtensionMessages() {
    const api = extensionApi();
    if (!api?.runtime?.onMessage) return;

    api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type !== "poe2dire:toggle") return false;

      toggleCurrentPage()
        .then((result) => sendResponse(result))
        .catch((error) => {
          console.warn("[PoE2Dire] Toggle failed:", error);
          sendResponse({ transformed: false, error: error.message });
        });
      return true;
    });
  }

  async function toggleCurrentPage() {
    if (document.getElementById("PoE2Dire-root")) {
      destroyPatchPage(document);
      return { transformed: false };
    }
    return activateOnce();
  }

  async function activateOnce() {
    const patch = await run();
    return { transformed: Boolean(patch) };
  }

  function extensionApi() {
    if (typeof browser !== "undefined" && browser?.runtime) return browser;
    if (typeof chrome !== "undefined" && chrome?.runtime) return chrome;
    return null;
  }

  setupExtensionMessages();
  if (!extensionApi()?.runtime?.id) {
    run().catch((error) => {
      console.warn("[PoE2Dire] Startup failed:", error);
    });
  }
