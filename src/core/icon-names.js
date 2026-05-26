  function iconLookupCandidateTitles(title, kind) {
    const clean = cleanTitle(title);
    const commaPrefix = commaPrefixTitle(clean);
    const titles = [];

    [clean, commaPrefix].forEach((candidate) => {
      if (!candidate) return;

      if (kind === "support") addSupportLookupTitles(titles, candidate);
      else titles.push(candidate);

      const romanSource = kind === "support" ? supportBaseTitle(candidate) || candidate : candidate;
      const romanBase = romanTierBaseTitle(romanSource);
      if (romanBase) {
        if (kind === "support") addSupportLookupTitles(titles, romanBase);
        else titles.push(romanBase);
      }

      if (kind === "ascendancy" || kind === "passive") {
        const passive = passiveBaseTitle(candidate);
        if (passive) titles.push(passive);
      }

      if (kind === "skill" || kind === "support") {
        const baseSkill = baseTransfiguredTitle(romanSource);
        if (baseSkill) {
          if (kind === "support") addSupportLookupTitles(titles, baseSkill);
          else titles.push(baseSkill);
        }
      }
    });

    return unique(titles);
  }

  function addSupportLookupTitles(titles, title) {
    const clean = cleanTitle(title);
    if (!clean) return;

    titles.push(clean);
    const base = supportBaseTitle(clean);
    if (base) titles.push(base);
    else addSupportTitle(titles, clean);
  }

  function addSupportTitle(titles, title) {
    if (title && !/\bSupport$/i.test(cleanTitle(title))) {
      titles.push(`${cleanTitle(title)} Support`);
    }
  }

  function supportBaseTitle(title) {
    const clean = cleanTitle(title);
    return /\s+Support$/i.test(clean) ? clean.replace(/\s+Support$/i, "").trim() : "";
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
