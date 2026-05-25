  const CONFIG = {
    apiEndpoints: [
      { name: "PoE2Wiki", api: "https://www.poe2wiki.net/api.php" },
      { name: "PoEWiki", api: "https://www.poewiki.net/api.php" },
    ],
    wikiLookupConcurrency: 40,
    fallbackIcon: "https://www.poewiki.net/images/b/b6/Scroll_of_Wisdom_inventory_icon.png",
    cache: {
      namespace: "PoE2DireCache-25-05-2026:",
      // 4 months
      hitTtlMs: 120 * 24 * 60 * 60 * 1000,
      // 7 days
      missTtlMs: 7 * 24 * 60 * 60 * 1000,
    },
    network: {
      retries: 2,
      retryDelayMs: 650,
    },
  };

  const state = {
    renderRunId: 0,
    wikiDone: false,
    viewport: null,
  };
