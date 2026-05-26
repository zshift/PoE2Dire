  function createIconStore() {
    const api = extensionApi();
    if (api?.storage?.local) {
      return storageIconStore(
        (keys) => extensionStorageGet(api, keys),
        (entries) => {
          const payload = {};
          entries.forEach((entry, key) => {
            payload[key] = entry;
          });
          return extensionStorageSet(api, payload);
        },
        (keys) => extensionStorageRemove(api, keys)
      );
    }

    const storage = getLocalStorage();
    if (storage) {
      return storageIconStore(
        (keys) => {
          const raw = {};
          keys.forEach((key) => {
            raw[key] = parseStoredIcon(storage.getItem(key));
          });
          return raw;
        },
        (entries) => {
          entries.forEach((entry, key) => {
            storage.setItem(key, JSON.stringify(entry));
          });
        },
        (keys) => {
          keys.forEach((key) => storage.removeItem(key));
        }
      );
    }

    return nullIconStore();
  }

  async function readStoredIconResults(store, jobs, storeKeys, resolved, knownMissing) {
    const stored = await store.getMany(Array.from(storeKeys.values()));

    for (const job of jobs) {
      const entry = stored.get(storeKeys.get(job.key));
      if (!entry) continue;

      if (entry.url) {
        resolved.set(job.key, { url: entry.url, source: entry.source || "icon-cache" });
      } else if (entry.missing) {
        if (shouldCacheMissingIcon(job)) knownMissing.add(job.key);
        else stored.delete(storeKeys.get(job.key));
      }
    }

    return stored;
  }

  async function writeStoredIconResults(store, jobs, storeKeys, stored, resolved, lookupFailed) {
    const writes = new Map();

    for (const job of jobs) {
      const key = storeKeys.get(job.key);
      if (!key || stored.has(key) || lookupFailed.has(job.key)) continue;

      const image = resolved.get(job.key);
      if (!image && !shouldCacheMissingIcon(job)) continue;

      writes.set(key, image ? {
        url: image.url,
        source: image.source,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CONFIG.cache.hitTtlMs,
      } : {
        missing: true,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CONFIG.cache.missTtlMs,
      });
    }

    await store.setMany(writes);
  }

  function shouldCacheMissingIcon(job) {
    return job.kind !== "support";
  }

  function storageIconStore(readMany, writeMany, removeMany) {
    return {
      async getMany(keys) {
        const raw = await readMany(keys);
        const found = new Map();
        const expired = [];

        keys.forEach((key) => {
          const entry = raw[key];
          if (!entry) return;

          if (entry.expiresAt <= Date.now()) {
            expired.push(key);
          } else {
            found.set(key, entry);
          }
        });

        if (expired.length) await this.removeMany(expired);
        return found;
      },
      async setMany(entries) {
        await writeMany(entries);
      },
      async removeMany(keys) {
        await removeMany(keys);
      },
    };
  }

  function extensionStorageGet(api, keys) {
    if (typeof browser !== "undefined" && api === browser) return api.storage.local.get(keys);
    return new Promise((resolve) => api.storage.local.get(keys, (value) => resolve(value || {})));
  }

  function extensionStorageSet(api, value) {
    if (typeof browser !== "undefined" && api === browser) return api.storage.local.set(value);
    return new Promise((resolve) => api.storage.local.set(value, resolve));
  }

  function extensionStorageRemove(api, keys) {
    if (typeof browser !== "undefined" && api === browser) return api.storage.local.remove(keys);
    return new Promise((resolve) => api.storage.local.remove(keys, resolve));
  }

  function getLocalStorage() {
    try {
      return typeof window !== "undefined" ? window.localStorage : null;
    } catch (error) {
      return null;
    }
  }

  function nullIconStore() {
    return {
      getMany: async () => new Map(),
      setMany: async () => {},
      removeMany: async () => {},
    };
  }

  function parseStoredIcon(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function iconStoreKey(scope, title, kind) {
    return CONFIG.cache.namespace + [
      scope,
      kind || "general",
      normalKey(title),
    ].map(encodeURIComponent).join(":");
  }
