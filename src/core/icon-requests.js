  // only retry on these erros, no point in hitting 404 each time
  const RETRYABLE_HTTP_STATUS = new Set([0, 408, 425, 429, 500, 502, 503, 504]);

  async function fetchJsonWithRetry(url) {
    for (let attempt = 0; attempt <= CONFIG.network.retries; attempt += 1) {
      const response = await fetchJsonResponse(url);
      if (response.ok) return response.json;

      if (attempt === CONFIG.network.retries || !RETRYABLE_HTTP_STATUS.has(response.status)) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      await delay(retryDelayMs(response, attempt));
    }

    throw new Error("retry loop failed");
  }

  async function fetchJsonResponse(url) {
    const proxied = await fetchJsonViaExtension(url);
    if (proxied) return proxied;

    try {
      const response = await fetch(url);
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        retryAfter: response.headers.get("Retry-After") || "",
        json: response.ok ? await response.json() : null,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        statusText: error.message || "Network Error",
        retryAfter: "",
        json: null,
      };
    }
  }

  async function fetchJsonViaExtension(url) {
    const api = extensionApi();
    if (!api?.runtime?.id || !api.runtime.sendMessage) return null;

    try {
      const response = await runtimeSendMessage(api, { type: "poe2dire:fetch-json", url });
      return response?.proxied ? response : null;
    } catch (error) {
      return null;
    }
  }

  function runtimeSendMessage(api, message) {
    if (typeof browser !== "undefined" && api === browser) {
      return api.runtime.sendMessage(message);
    }

    return new Promise((resolve, reject) => {
      api.runtime.sendMessage(message, (response) => {
        const error = api.runtime.lastError;
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  function retryDelayMs(response, attempt) {
    const retryAfter = response.retryAfter;
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

      const dateDelay = Date.parse(retryAfter) - Date.now();
      if (Number.isFinite(dateDelay)) return Math.max(0, dateDelay);
    }

    return CONFIG.network.retryDelayMs * 2 ** attempt;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
