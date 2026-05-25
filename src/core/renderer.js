  function renderPatchPage(doc, sourceRoot, patch) {
    doc.getElementById("PoE2Dire-root")?.remove();

    const page = el("main", "pdp-page", [
      renderHero(patch),
      el("div", "pdp-shell", patch.sections.map((section) => renderSection(doc, section))),
    ]);

    const mount = doc.createElement("div");
    mount.id = "PoE2Dire-root";
    mount.append(renderTopButton(doc), page);

    doc.body.classList.add("pdp-body");
    applyViewport(doc);
    hideOriginalPage(doc);
    doc.body.prepend(mount);
    sourceRoot.classList.add("pdp-hidden-source");
  }

  function destroyPatchPage(doc) {
    state.renderRunId += 1;
    doc.getElementById("PoE2Dire-root")?.remove();
    doc.getElementById("PoE2Dire-style")?.remove();
    restoreViewport(doc);
    doc.body.classList.remove("pdp-body");
    Array.from(doc.querySelectorAll(".pdp-hidden-original")).forEach((node) => {
      node.classList.remove("pdp-hidden-original");
    });
    Array.from(doc.querySelectorAll(".pdp-hidden-source")).forEach((node) => {
      node.classList.remove("pdp-hidden-source");
    });
  }

  function hideOriginalPage(doc) {
    Array.from(doc.body.children).forEach((child) => {
      if (child.id === "PoE2Dire-root" || child.matches("script,style")) return;
      child.classList.add("pdp-hidden-original");
    });
  }

  function applyViewport(doc) {
    if (!state.viewport) {
      const existing = doc.querySelector("meta[name='viewport']");
      state.viewport = {
        node: existing,
        content: existing?.getAttribute("content") || "",
        created: !existing,
      };
    }

    const meta = state.viewport.node || doc.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", "width=device-width, initial-scale=1");
    if (!meta.parentNode) doc.head.append(meta);
    state.viewport.node = meta;
  }

  function restoreViewport(doc) {
    if (!state.viewport) return;

    if (state.viewport.created) {
      state.viewport.node?.remove();
    } else if (state.viewport.node?.parentNode) {
      state.viewport.node.setAttribute("content", state.viewport.content);
    } else {
      const meta = doc.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", state.viewport.content);
      doc.head.append(meta);
    }
    state.viewport = null;
  }

  function renderTopButton(doc) {
    const button = el("button", "pdp-top-button", "TOP");
    button.type = "button";
    button.setAttribute("aria-label", "Go back to top");
    button.addEventListener("click", () => {
      doc.defaultView.scrollTo({ top: 0, behavior: "smooth" });
    });
    return button;
  }

  function renderHero(patch) {
    return el("header", "pdp-hero", [
      el("div", "pdp-hero-inner", [
        el("div", "pdp-eyebrow", patch.eyebrow),
        el("h1", "pdp-version", patch.version),
      ]),
    ]);
  }

  function renderSection(doc, section) {
    const groups = orderedSectionGroups(section);
    return el("section", "pdp-section", [
      el("h2", "pdp-section-title", section.displayTitle),
      el("div", "pdp-section-body", groups.map((group) => renderGroup(doc, section, group))),
    ]);
  }

  function orderedSectionGroups(section) {
    if (!isEntitySection(section.title)) return section.groups;

    const general = [];
    const entities = [];
    for (const group of section.groups) {
      if (group.title === section.title) general.push(group);
      else entities.push(group);
    }
    return general.concat(entities);
  }

  function renderGroup(doc, section, group) {
    if (isEntitySection(section.title) && group.title === section.title) {
      return renderGeneralList(doc, group);
    }

    if (!isEntitySection(section.title)) {
      return renderSubsection(doc, group);
    }

    return renderEntityGroup(doc, group);
  }

  function renderGeneralList(doc, group) {
    return el("div", "pdp-general-list", [
      el("h3", "pdp-subsection-title", "General Changes"),
      el("ul", "pdp-changes", group.items.map((item) => el("li", "", highlightChange(doc, item)))),
    ]);
  }

  function renderSubsection(doc, group) {
    const children = [
      el("h3", "pdp-subsection-title", group.title),
    ];
    if (group.blocks.length) {
      group.blocks.forEach((block) => {
        children.push(renderUpdateBlock(doc, block));
      });
    } else {
      children.push(el("ul", "pdp-changes", group.items.map((item) => el("li", "", highlightChange(doc, item)))));
    }
    return el("div", "pdp-subsection", children);
  }

  function renderUpdateBlock(doc, block) {
    return el("div", "pdp-update-block", [
      el("div", "pdp-list-label", block.label),
      el("ul", "pdp-changes pdp-update-changes", block.items.map((item) => el("li", "", highlightChange(doc, item)))),
    ]);
  }

  function renderEntityGroup(doc, group) {
    const icon = renderIcon(group);
    const meta = el("div", "pdp-group-meta", groupLabel(group));
    const title = el("div", "pdp-group-title", group.title);
    const items = el("ul", "pdp-changes", group.items.map((item) => el("li", "", highlightChange(doc, item))));
    return el("article", "pdp-group", [icon, el("div", "pdp-group-body", [title, meta, items])]);
  }

  function groupLabel(group) {
    if (group.iconKind === "item") return "ITEM";
    if (group.iconKind === "skill") return "SKILL";
    if (group.iconKind === "support") return "SUPPORT";
    if (group.iconKind === "ascendancy") return "ASCENDANCY";
    if (group.iconKind === "passive") return passiveLabel(group);
    if (group.iconKind === "monster") return "MONSTER";
    return "UPDATE";
  }

  function passiveLabel(group) {
    const text = `${group.title} ${group.items.join(" ")}`;
    if (/\bkeystone\b/i.test(text)) return "KEYSTONE";
    if (/\bnotable\b/i.test(text)) return "NOTABLE";
    return "PASSIVE";
  }

  function renderIcon(group) {
    const box = el("div", `pdp-icon pdp-icon-${group.iconKind}`);
    const isFallback = !group.icon;
    const icon = group.icon || CONFIG.fallbackIcon;
    if (icon) {
      box.classList.add(iconStateClass(group, isFallback));
      const img = el("img", "", "");
      img.alt = "";
      img.loading = "eager";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.src = icon;
      img.onerror = () => {
        if (img.src !== CONFIG.fallbackIcon) {
          img.src = CONFIG.fallbackIcon;
          return;
        }
        img.remove();
        box.textContent = iconInitials(group.title);
      };
      box.append(img);
    } else {
      box.textContent = iconInitials(group.title);
    }
    return box;
  }

  function iconInitials(title) {
    const words = cleanTitle(title).split(/\s+/).filter(Boolean);
    return (words[0]?.[0] || "P") + (words[1]?.[0] || "");
  }

  function iconStateClass(group, isFallback) {
    if (!isFallback) return "pdp-icon-resolved";
    if (!state.wikiDone) return "pdp-icon-pending";
    if (group.source === "missing") return "pdp-icon-missing";
    return "pdp-icon-default";
  }

  function highlightChange(doc, text) {
    const fragment = doc.createDocumentFragment();
    const regex = /[+-]?\d+(?:\.\d+)?(?:-[+-]?\d+(?:\.\d+)?)?%?/g;
    let lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      fragment.append(doc.createTextNode(text.slice(lastIndex, match.index)));
      fragment.append(el("span", "pdp-num", match[0]));
      lastIndex = match.index + match[0].length;
    }
    fragment.append(doc.createTextNode(text.slice(lastIndex)));
    return fragment;
  }

  function injectStyles(doc) {
    if (doc.getElementById("PoE2Dire-style")) return;
    if (!CORE_STYLES) return;

    const style = doc.createElement("style");
    style.id = "PoE2Dire-style";
    style.textContent = CORE_STYLES;
    doc.head.append(style);
  }
