  async function resolveIcons(patch) {
    const groups = patch.sections.flatMap((section) => section.groups);
    const jobs = collectIconJobs(groups);

    state.wikiDone = false;

    if (!jobs.length) {
      state.wikiDone = true;
      return patch;
    }

    const endpoints = apiEndpointsForPatch(patch);
    const store = createIconStore();
    const storeScope = endpoints.map((endpoint) => endpoint.name).join("+");
    const storeKeys = new Map(jobs.map((job) => [
      job.key,
      iconStoreKey(storeScope, job.title, job.kind),
    ]));

    const resolved = new Map();
    const knownMissing = new Set();
    const lookupFailed = new Set();
    const stored = await readStoredIconResults(store, jobs, storeKeys, resolved, knownMissing);

    for (const endpoint of endpoints) {
      const missingJobs = jobs.filter((job) => !resolved.has(job.key) && !knownMissing.has(job.key));
      if (!missingJobs.length) break;

      const result = await queryWikiIconSource(endpoint, missingJobs);
      result.found.forEach((image, key) => resolved.set(key, image));
      result.failed.forEach((key) => lookupFailed.add(key));
    }

    applyIconResults(groups, resolved, jobs);
    await writeStoredIconResults(store, jobs, storeKeys, stored, resolved, lookupFailed);

    state.wikiDone = true;
    return patch;
  }

  function collectIconJobs(groups) {
    const candidates = groups
      .filter((group) => !group.icon)
      .filter(isIconCandidate)
      .filter((group) => group.wikiTitle);

    const titles = unique(candidates.map((group) => group.wikiTitle));
    const kinds = new Map(candidates.map((group) => [normalKey(group.wikiTitle), group.iconKind]));

    return titles.map((title) => ({
      title,
      key: normalKey(title),
      kind: kinds.get(normalKey(title)) || "general",
    }));
  }

  function apiEndpointsForPatch(patch) {
    return /Path of Exile 2/i.test(patch.title)
      ? CONFIG.apiEndpoints
      : CONFIG.apiEndpoints.slice().reverse();
  }

  function applyIconResults(groups, resolved, jobs) {
    const attempted = new Set(jobs.map((job) => job.key));

    for (const group of groups) {
      const key = normalKey(group.wikiTitle);
      const image = resolved.get(key);

      if (image) {
        group.icon = image.url;
        group.source = image.source;
      } else if (attempted.has(key) && isIconCandidate(group)) {
        group.source = "missing";
      }
    }
  }
