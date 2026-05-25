(() => {
  "use strict";

  const CONFIG = {
    idleMs: 2000,
    debounceMs: 120,
    rootId: "PoE2Dire-root",
    pillId: "PoE2Dire-type-search",
    hitClass: "pdp-type-search-hit",
    currentClass: "pdp-type-search-current",
  };

  const state = {
    buffer: "",
    matches: [],
    current: 0,
    idleTimer: 0,
    searchTimer: 0,
  };

  if (!isDesktopLike()) return;

  document.addEventListener("keydown", onKeyDown, true);
  observeRootRemoval();

  function isDesktopLike() {
    return !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function onKeyDown(event) {
    if (!root()) return;
    if (shouldIgnore(event)) return;

    if (event.key === "Escape") {
      event.preventDefault();
      clearSearch();
      return;
    }

    if (event.key === "Backspace") {
      if (!state.buffer) return;
      event.preventDefault();
      state.buffer = state.buffer.slice(0, -1);
      scheduleSearch();
      scheduleIdleClear();
      return;
    }

    if (event.key === "Enter") {
      if (!state.matches.length) return;
      event.preventDefault();
      moveCurrent(event.shiftKey ? -1 : 1);
      return;
    }

    const char = typedChar(event);
    if (!char) return;

    event.preventDefault();
    state.buffer += char;
    scheduleSearch();
    scheduleIdleClear();
  }

  function shouldIgnore(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return true;

    const target = event.target;
    if (!target) return false;
    if (target.isContentEditable) return true;
    return Boolean(target.closest?.("input, textarea, select, [contenteditable='true']"));
  }

  function typedChar(event) {
    if (event.key.length !== 1) return "";
    if (event.key === " " && !state.buffer) return "";
    return event.key;
  }

  function scheduleSearch() {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(applySearch, CONFIG.debounceMs);
  }

  function scheduleIdleClear() {
    window.clearTimeout(state.idleTimer);
    state.idleTimer = window.setTimeout(clearSearch, CONFIG.idleMs);
  }

  function applySearch() {
    clearHighlights();

    const query = normalize(state.buffer);
    if (!query) {
      removePill();
      return;
    }

    state.matches = searchTargets().filter((target) => normalize(target.text).includes(query));
    state.current = 0;
    renderPill();
    applyHighlights();
    scrollCurrentIntoView();
  }

  function searchTargets() {
    const page = root();
    if (!page) return [];

    const targets = [];
    const seen = new Set();
    const selectors = [
      ".pdp-section-title",
      ".pdp-subsection-title",
      ".pdp-list-label",
      ".pdp-group-title",
      ".pdp-changes li",
    ];

    selectors.forEach((selector) => {
      page.querySelectorAll(selector).forEach((node) => {
        const target = searchTargetNode(node);
        if (!target || seen.has(target)) return;
        seen.add(target);
        targets.push({ node: target, text: node.textContent || "" });
      });
    });

    return targets;
  }

  function searchTargetNode(node) {
    if (node.matches(".pdp-group-title")) return node.closest(".pdp-group");
    return node;
  }

  function applyHighlights() {
    state.matches.forEach((match, index) => {
      match.node.classList.add(CONFIG.hitClass);
      if (index === state.current) match.node.classList.add(CONFIG.currentClass);
    });
  }

  function clearHighlights() {
    document.querySelectorAll(`.${CONFIG.hitClass}, .${CONFIG.currentClass}`).forEach((node) => {
      node.classList.remove(CONFIG.hitClass, CONFIG.currentClass);
    });
  }

  function moveCurrent(direction) {
    if (!state.matches.length) return;
    state.matches[state.current]?.node.classList.remove(CONFIG.currentClass);
    state.current = (state.current + direction + state.matches.length) % state.matches.length;
    state.matches[state.current]?.node.classList.add(CONFIG.currentClass);
    renderPill();
    scrollCurrentIntoView();
    scheduleIdleClear();
  }

  function scrollCurrentIntoView() {
    const node = state.matches[state.current]?.node;
    node?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function renderPill() {
    const pill = ensurePill();
    const count = state.matches.length;
    pill.classList.toggle("pdp-type-search-empty", count === 0);
    pill.textContent = count
      ? `Find: ${state.buffer} ${state.current + 1}/${count}`
      : `Find: ${state.buffer} 0/0`;
  }

  function ensurePill() {
    let pill = document.getElementById(CONFIG.pillId);
    if (pill) return pill;

    pill = document.createElement("div");
    pill.id = CONFIG.pillId;
    pill.setAttribute("role", "status");
    pill.setAttribute("aria-live", "polite");
    root()?.append(pill);
    return pill;
  }

  function removePill() {
    document.getElementById(CONFIG.pillId)?.remove();
  }

  function clearSearch() {
    window.clearTimeout(state.idleTimer);
    window.clearTimeout(state.searchTimer);
    state.buffer = "";
    state.matches = [];
    state.current = 0;
    clearHighlights();
    removePill();
  }

  function observeRootRemoval() {
    const observer = new MutationObserver(() => {
      if (!root()) clearSearch();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function root() {
    return document.getElementById(CONFIG.rootId);
  }

  function normalize(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

})();
