(() => {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;

  api.action.onClicked.addListener(async (tab) => {
    if (!tab?.id) return;

    try {
      await sendMessage(tab.id, { type: "poe2dire:toggle" });
    } catch (error) {
      // poe forum only, the rest ignore
    }
  });

  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "poe2dire:fetch-json") return false;

    fetchJson(message.url)
      .then((result) => sendResponse(result))
      .catch((error) => {
        sendResponse({
          proxied: true,
          ok: false,
          status: 0,
          statusText: "Network Error",
          error: error.message,
        });
      });
    return true;
  });

  async function fetchJson(url) {
    if (!isAllowedWikiApiUrl(url)) {
      return {
        proxied: true,
        ok: false,
        status: 400,
        statusText: "Blocked URL",
        error: "Only PoE wiki API requests are allowed.",
      };
    }

    const response = await fetch(url);
    return {
      proxied: true,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      retryAfter: response.headers.get("Retry-After") || "",
      json: response.ok ? await response.json() : null,
    };
  }

  function isAllowedWikiApiUrl(url) {
    try {
      const parsed = new URL(url);
      return (
        parsed.pathname === "/api.php" &&
        (parsed.origin === "https://www.poewiki.net" || parsed.origin === "https://www.poe2wiki.net")
      );
    } catch (error) {
      return false;
    }
  }

  function sendMessage(tabId, message) {
    if (typeof browser !== "undefined" && api === browser) {
      return api.tabs.sendMessage(tabId, message);
    }
    return new Promise((resolve, reject) => {
      api.tabs.sendMessage(tabId, message, (response) => {
        const error = api.runtime.lastError;
        if (error) reject(error);
        else resolve(response);
      });
    });
  }
})();
