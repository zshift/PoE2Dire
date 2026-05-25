  function iconLookupCandidateTitles(title, kind) {
    const clean = cleanTitle(title);
    const commaPrefix = commaPrefixTitle(clean);
    const titles = [];

    [clean, commaPrefix].forEach((candidate) => {
      if (!candidate) return;

      titles.push(candidate);
      addSupportTitle(titles, candidate, kind);

      const romanBase = romanTierBaseTitle(candidate);
      if (romanBase) {
        titles.push(romanBase);
        addSupportTitle(titles, romanBase, kind);
      }

      if (kind === "ascendancy" || kind === "passive") {
        const passive = passiveBaseTitle(candidate);
        if (passive) titles.push(passive);
      }

      if (kind === "skill" || kind === "support") {
        const baseSkill = baseTransfiguredTitle(candidate);
        if (baseSkill) titles.push(baseSkill);
      }
    });

    return unique(titles);
  }

  function addSupportTitle(titles, title, kind) {
    if (kind === "support" && title && !/\bSupport$/i.test(cleanTitle(title))) {
      titles.push(`${cleanTitle(title)} Support`);
    }
  }

  function commaPrefixTitle(title) {
    if (!title || !title.includes(",")) return "";
    return cleanTitle(title.split(",")[0]);
  }

  function romanTierBaseTitle(title) {
    const clean = cleanTitle(title);
    return /\s+(?:III|II|I)$/i.test(clean) ? clean.replace(/\s+(?:III|II|I)$/i, "").trim() : "";
  }

  function passiveBaseTitle(title) {
    return cleanTitle(title)
      .replace(/\s+(?:Notable|Keystone)?\s*Passive(?: Skill)?$/i, "")
      .replace(/\s+cluster$/i, "")
      .replace(/^The\s+/i, "")
      .trim();
  }

  function baseTransfiguredTitle(title) {
    const match = cleanTitle(title).match(/^(.+?)\s+of\s+.+$/i);
    if (!match) return "";

    const base = cleanTitle(match[1]);
    return base.split(/\s+/).length < 2 ? "" : base;
  }
