  const WIKI_PLACEHOLDER_IMAGE = /Questionmark|Help\.svg|Level_up_icon/i;

  async function queryWikiIconSource(endpoint, jobs) {
    const found = new Map();
    const failed = new Set();

    await mapWithConcurrency(jobs, CONFIG.wikiLookupConcurrency, async (job) => {
      try {
        const image = await queryWikiIcon(endpoint, job);
        if (image) found.set(job.key, image);
      } catch (error) {
        failed.add(job.key);
      }
    });

    return { found, failed };
  }

  async function queryWikiIcon(endpoint, job) {
    for (const title of iconLookupCandidateTitles(job.title, job.kind)) {
      const image = await queryWikiPageImage(endpoint, title, job.kind);
      if (image) return image;
    }
    return null;
  }

  async function queryWikiPageImage(endpoint, title, kind) {
    if (kind === "passive" || (kind === "ascendancy" && !validAscendancyClassTitle(title))) {
      const passiveIcon = await queryWikiPassiveIcon(endpoint, title);
      if (passiveIcon) return passiveIcon;
    }

    const url = new URL(endpoint.api);
    url.searchParams.set("origin", "*");
    url.searchParams.set("format", "json");
    url.searchParams.set("action", "parse");
    url.searchParams.set("redirects", "1");
    url.searchParams.set("prop", "text");
    url.searchParams.set("page", title);

    const json = await fetchJsonWithRetry(url.toString());
    const html = json.parse?.text?.["*"];
    if (!html) return null;

    const parsed = new DOMParser().parseFromString(html, "text/html");
    const image = selectWikiImage(parsed, title, kind);
    const src = image?.getAttribute("src");
    if (!src) return null;

    return {
      url: new URL(src, endpoint.api).toString(),
      source: endpoint.name,
    };
  }

  async function queryWikiPassiveIcon(endpoint, title) {
    const iconFile = await queryWikiPassiveIconFile(endpoint, title);
    if (!iconFile) return null;

    const url = new URL(endpoint.api);
    url.searchParams.set("origin", "*");
    url.searchParams.set("format", "json");
    url.searchParams.set("action", "query");
    url.searchParams.set("titles", iconFile);
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url");

    const json = await fetchJsonWithRetry(url.toString());
    const pages = Object.values(json.query?.pages || {});
    const page = pages.find((value) => value.imageinfo?.[0]?.url);
    if (!page) return null;

    return {
      url: page.imageinfo[0].url,
      source: `${endpoint.name} Cargo`,
    };
  }

  async function queryWikiPassiveIconFile(endpoint, title) {
    const escapedTitle = `"${String(title || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    const url = new URL(endpoint.api);
    url.searchParams.set("origin", "*");
    url.searchParams.set("format", "json");
    url.searchParams.set("action", "cargoquery");
    url.searchParams.set("tables", "passive_skills");
    url.searchParams.set("fields", "name,icon");
    url.searchParams.set("where", `name=${escapedTitle}`);
    url.searchParams.set("limit", "1");

    const json = await fetchJsonWithRetry(url.toString());
    return json.cargoquery?.[0]?.title?.icon || "";
  }

  function selectWikiImage(parsed, title, kind) {
    const container = parsed.querySelector(".infobox-page-container") || parsed;
    const images = Array.from(container.querySelectorAll("img"));
    const titled = images.filter((image) => imageMatchesTitle(image, title));

    if (kind === "ascendancy") {
      return (
        titled.find((image) => /portrait/i.test(imageSrc(image))) ||
        images.find((image) => /portrait/i.test(imageSrc(image))) ||
        titled.find(isRealWikiImage) ||
        null
      );
    }

    if (kind === "skill" || kind === "support") {
      return (
        titled.find((image) => imageSrc(image).includes("_skill_icon")) ||
        container.querySelector("img[src*='_skill_icon']") ||
        titled.find((image) => imageSrc(image).includes("_inventory_icon")) ||
        inventoryImage(container) ||
        images.find(isRealWikiImage) ||
        null
      );
    }

    return (
      titled.find((image) => imageSrc(image).includes("_inventory_icon")) ||
      inventoryImage(container) ||
      container.querySelector(".item-icon img") ||
      titled.find((image) => imageSrc(image).includes("_skill_icon")) ||
      container.querySelector("img[src*='_skill_icon']") ||
      images.find(isRealWikiImage) ||
      null
    );
  }

  function inventoryImage(container) {
    return (
      container.querySelector(".itembox-tab.-selected img") ||
      container.querySelector(".images img[src*='_inventory_icon']") ||
      container.querySelector("img[src*='_inventory_icon']")
    );
  }

  function imageSrc(image) {
    return image?.getAttribute("src") || "";
  }

  function isRealWikiImage(image) {
    return !WIKI_PLACEHOLDER_IMAGE.test(imageSrc(image));
  }

  function imageMatchesTitle(image, title) {
    const needle = cleanTitle(title).toLowerCase().replace(/\s+/g, " ");
    const raw = [imageSrc(image), image.getAttribute("alt"), image.getAttribute("title")]
      .filter(Boolean)
      .join(" ");

    let haystack = raw;
    try {
      haystack = decodeURIComponent(raw);
    } catch (error) {
      haystack = raw;
    }

    return haystack.replace(/[_-]+/g, " ").toLowerCase().includes(needle);
  }
