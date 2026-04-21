(function () {
  "use strict";

  var APP_VERSION = "20260331-runtime13";
  var SESSION_CACHE_KEY = "__pengu_runtime_cache_version__";
  var THEME_STORAGE_KEY = "__pengu_theme_mode__";
  var THEME_DARK_CLASS = "site-dark-mode";
  var PAGE_LOADING_CLASS = "site-page-loading";
  var pathName = (window.location.pathname || "").toLowerCase();
  var isHomePage = /\/html\/index\.html$/.test(pathName);
  var isNightversePage = /\/html\/nightverse(?:-[a-z0-9-]+)?\.html$/.test(pathName);
  var isThemeEnabledPage = false;
  var isThemeExemptPage = /\/html\/(?:type-name-fireworks|memes|surprise|nightverse(?:-[a-z0-9-]+)?)\.html$/.test(pathName);
  var loaderFontPath = isHomePage ? "../fonts/Wildcrazy-WKYO.ttf" : (/\/index\.html$/.test(pathName) || pathName === "/" ? "./fonts/Wildcrazy-WKYO.ttf" : "../fonts/Wildcrazy-WKYO.ttf");
  var docEl = document.documentElement;

  if (docEl) {
    docEl.setAttribute("data-app-version", APP_VERSION);
    docEl.classList.add(PAGE_LOADING_CLASS);
    if (isThemeExemptPage) {
      docEl.setAttribute("data-theme-exempt", "true");
    }
    if (isNightversePage) {
      docEl.setAttribute("data-nightverse-page", "true");
    }
  }

  var savedTheme = null;
  var mutationRepairObserver = null;
  var pendingRepairNodes = [];
  var repairFlushScheduled = false;

  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }

  if (docEl && isThemeEnabledPage && savedTheme === "dark") {
    docEl.classList.add(THEME_DARK_CLASS);
  }

  function isLocalUrl(url) {
    if (!url) return false;

    var trimmed = url.trim();
    if (!trimmed || trimmed.startsWith("#")) return false;
    if (/^(?:[a-z]+:)?\/\//i.test(trimmed)) return false;
    if (/^(?:mailto|tel|javascript|data|blob):/i.test(trimmed)) return false;

    return true;
  }

  function scheduleIdle(callback, timeout) {
    if ("requestIdleCallback" in window) {
      return window.requestIdleCallback(callback, { timeout: timeout || 800 });
    }

    return window.setTimeout(callback, Math.min(timeout || 800, 220));
  }

  function addVersionParam(url) {
    if (!isLocalUrl(url)) return url;

    try {
      var resolved = new URL(url, window.location.href);
      if (resolved.origin !== window.location.origin) return url;
      resolved.searchParams.set("v", APP_VERSION);
      return resolved.pathname + resolved.search + resolved.hash;
    } catch (error) {
      return url;
    }
  }

  function versionLocalLinks() {
    var selectors = [
      "a[href]",
      "link[href]",
      "script[src]",
      "img[src]",
      "audio[src]",
      "video[src]",
      "source[src]",
      "iframe[src]"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(function (el) {
      var attr = el.hasAttribute("href") ? "href" : "src";
      var value = el.getAttribute(attr);
      if (!value || el.hasAttribute("data-runtime-versioned")) return;

      var updated = addVersionParam(value);
      if (updated !== value) {
        el.setAttribute(attr, updated);
        el.setAttribute("data-runtime-versioned", "true");
      }
    });
  }

  function handleAnchorClicks(event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href");
    if (!isLocalUrl(href)) return;

    link.setAttribute("href", addVersionParam(href));
  }

  function syncVisibilityState() {
    if (!docEl) return;
    docEl.classList.toggle("page-hidden", document.hidden);
  }

  function repairVisibleText(root) {
    if (!root) return;

    var repairs = [
      ["\u00e2\u20ac\u201d", "\u2014"],
      ["\u00e2\u20ac\u201c", "\u2013"],
      ["\u00e2\u20ac\u2122", "\u2019"],
      ["\u00e2\u20ac\u02dc", "\u2018"],
      ["\u00e2\u20ac\u0153", "\u201c"],
      ["\u00e2\u20ac\u009d", "\u201d"],
      ["\u00e2\u20ac\u00a6", "\u2026"],
      ["\u00e2\u20ac\u00a2", "\u2022"],
      ["\u00e2\u2122\u00a1", "\u2661"],
      ["\u00f0\u0178\u2019\u2022", "\ud83d\udc95"],
      ["\u00f0\u0178\u0152\u00b8", "\ud83c\udf38"],
      ["\u00f0\u0178\u00a5\u00ba", "\ud83e\udd7a"],
      ["\u00f0\u0178\u00a5\u00b9", "\ud83e\udd79"],
      ["\u00f0\u0178\u2019\u008d", "\ud83d\udc8d"],
      ["\u00f0\u0178\u02dc\u201a", "\ud83d\ude02"],
      ["\u00f0\u0178\u02dc\u0160", "\ud83d\ude0a"],
      ["\u00f0\u0178\u02dc\u2026", "\ud83d\ude05"],
      ["\u00f0\u0178\u02dc\u201e", "\ud83d\ude04"],
      ["\u00f0\u0178\u02dc\u008d", "\ud83d\ude0d"],
      ["\u00f0\u0178\u02dc\u00a4", "\ud83d\ude24"],
      ["\u00f0\u0178\u00a4\u00aa", "\ud83e\udd2a"],
      ["\u00f0\u0178\u00a4\u201c", "\ud83e\udd13"],
      ["\u00f0\u0178\u2019\u0152", "\ud83d\udc8c"],
      ["\u00f0\u0178\u2019\u2122", "\ud83d\udc99"],
      ["\u00f0\u0178\u2019\u203a", "\ud83d\udc9b"],
      ["\u00f0\u0178\u2019\u00ab", "\ud83d\udcab"],
      ["\u00f0\u0178\u2019\u20ac", "\ud83d\udc80"],
      ["\u00f0\u0178\u0152\u00bc", "\ud83c\udf3c"],
      ["\u00f0\u0178\u0152\u02c6", "\ud83c\udf08"],
      ["\u00f0\u0178\u0152\u008d", "\ud83c\udf0d"],
      ["\u00f0\u0178\u0152\u2122", "\ud83c\udf19"],
      ["\u00f0\u0178\u0152\u00a7\u00ef\u00b8\u008f", "\ud83c\udf27\ufe0f"],
      ["\u00f0\u0178\u008f\u017d\u00ef\u00b8\u008f", "\ud83c\udfce\ufe0f"],
      ["\u00f0\u0178\u008f\u00cd\u00ef\u00b8\u008f", "\ud83c\udfcd\ufe0f"],
      ["\u00f0\u0178\u203a\u00a3\u00ef\u00b8\u008f", "\ud83d\udee3\ufe0f"],
      ["\u00f0\u0178\u201c\u00b8", "\ud83d\udcf8"],
      ["\u00f0\u0178\u017d\u00b6", "\ud83c\udfb6"],
      ["\u00f0\u0178\u017d\u0081", "\ud83c\udf81"],
      ["\u00f0\u0178\u017d\u2030", "\ud83c\udf89"],
      ["\u00f0\u0178\u008f\u2020", "\ud83c\udfc6"],
      ["\u00f0\u0178\u0161\u02dc", "\ud83d\ude98"],
      ["\u00f0\u0178\u0161\u2014", "\ud83d\ude97"],
      ["\u00f0\u0178\u0161\u20ac", "\ud83d\ude80"],
      ["\u00f0\u0178\u201d\u00a5", "\ud83d\udd25"],
      ["\u00f0\u0178\u2013\u00a4\u00f0\u0178\u00a4\u008d", "\ud83d\udda4\ud83e\udd0d"]
    ];

    function repairString(value) {
      if (!value) return value;
      var next = value;
      repairs.forEach(function (pair) {
        if (next.indexOf(pair[0]) !== -1) {
          next = next.split(pair[0]).join(pair[1]);
        }
      });
      return next;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      var fixedText = repairString(root.nodeValue);
      if (fixedText !== root.nodeValue) {
        root.nodeValue = fixedText;
      }
      return;
    }

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var textNode = walker.nextNode();
    while (textNode) {
      var fixedNodeText = repairString(textNode.nodeValue);
      if (fixedNodeText !== textNode.nodeValue) {
        textNode.nodeValue = fixedNodeText;
      }
      textNode = walker.nextNode();
    }

    if (root.querySelectorAll) {
      root.querySelectorAll("[placeholder],[title],[aria-label],[value]").forEach(function (el) {
        ["placeholder", "title", "aria-label", "value"].forEach(function (attr) {
          if (!el.hasAttribute(attr)) return;
          var original = el.getAttribute(attr);
          var fixed = repairString(original);
          if (fixed !== original) {
            el.setAttribute(attr, fixed);
          }
        });
      });
    }
  }

  function queueTextRepair(node) {
    if (!node) return;
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) return;

    pendingRepairNodes.push(node);
    if (repairFlushScheduled) return;

    repairFlushScheduled = true;
    scheduleIdle(function () {
      repairFlushScheduled = false;

      var seen = [];
      pendingRepairNodes.splice(0).forEach(function (pendingNode) {
        if (seen.indexOf(pendingNode) !== -1) return;
        seen.push(pendingNode);
        repairVisibleText(pendingNode);
      });
    }, 400);
  }

  function applyTheme(mode) {
    if (!docEl) return;

    var isDark = mode === "dark";
    if (!isThemeEnabledPage || isThemeExemptPage) {
      docEl.classList.remove(THEME_DARK_CLASS);
      docEl.setAttribute("data-theme-mode", "light");
    } else {
      docEl.classList.toggle(THEME_DARK_CLASS, isDark);
      docEl.setAttribute("data-theme-mode", isDark ? "dark" : "light");
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch (error) {
      // Ignore persistence failures.
    }

    var toggle = document.getElementById("site-theme-toggle");
    if (toggle) {
      toggle.textContent = "Twinverse Treat";
      toggle.setAttribute("aria-label", "Open the Twinverse portal");
    }
  }

  function playThemeFlip(nextMode) {
    var curtain = document.getElementById("site-theme-curtain");
    if (!curtain) {
      applyTheme(nextMode);
      return;
    }

    curtain.classList.remove("is-animating");
    void curtain.offsetWidth;
    curtain.classList.add("is-animating");

    window.setTimeout(function () {
      applyTheme(nextMode);
    }, 220);

    window.setTimeout(function () {
      curtain.classList.remove("is-animating");
    }, 760);
  }

  function installThemeUi() {
    if (!document.body || document.getElementById("site-theme-style")) return;

    var style = document.createElement("style");
    style.id = "site-theme-style";
    style.textContent = [
      "@font-face {",
      "  font-family: \"SiteLoaderWildcrazy\";",
      "  src: url(\"" + loaderFontPath + "\") format(\"truetype\");",
      "  font-display: swap;",
      "}",
      "html { color-scheme: light; }",
      "html body { transition: background-color 260ms ease, background-image 260ms ease, color 220ms ease, border-color 220ms ease; }",
      "html[data-theme-exempt=\"true\"] { color-scheme: light !important; }",
      "html[data-nightverse-page=\"true\"] { color-scheme: dark !important; }",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) { color-scheme: dark; background: #07080b; }",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) body {",
      "  background:",
      "    radial-gradient(circle at 12% 14%, rgba(255, 93, 177, 0.14), transparent 24%),",
      "    radial-gradient(circle at 84% 18%, rgba(79, 172, 254, 0.16), transparent 28%),",
      "    radial-gradient(circle at 70% 82%, rgba(123, 97, 255, 0.14), transparent 24%),",
      "    linear-gradient(160deg, #0b0e16 0%, #121826 48%, #161220 100%) !important;",
      "  color: #edf3ff !important;",
      "  accent-color: #ff8fc6;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) body::before {",
      "  content: '';",
      "  position: fixed;",
      "  inset: 0;",
      "  pointer-events: none;",
      "  z-index: 0;",
      "  background:",
      "    linear-gradient(180deg, rgba(255,255,255,0.02), transparent 22%),",
      "    radial-gradient(circle at top, rgba(255,255,255,0.03), transparent 38%);",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) body > * { position: relative; z-index: 1; }",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) body,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) p,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) span,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) label,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) li,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) strong,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) small {",
      "  color: #e8eefc !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) h1,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) h2,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) h3,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) h4,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) h5,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) h6 {",
      "  color: #ffffff !important;",
      "  text-shadow: 0 8px 24px rgba(0,0,0,0.28);",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) a { color: #f4c8ff !important; }",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) a:hover { color: #ffd9ff !important; }",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .feature-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .match-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .try-again-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .generate-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .action-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .playlist-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .copy-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .new-charm-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .pull-again-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .primary-btn {",
      "  background: linear-gradient(135deg, rgba(255, 117, 189, 0.22), rgba(89, 165, 255, 0.22), rgba(121, 255, 214, 0.18)) !important;",
      "  color: #f8fbff !important;",
      "  border-color: rgba(255,255,255,0.14) !important;",
      "  box-shadow: 0 14px 34px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.1) !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) input,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) textarea,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) select {",
      "  background: rgba(18, 24, 38, 0.82) !important;",
      "  color: #eef4ff !important;",
      "  border-color: rgba(255,255,255,0.14) !important;",
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04) !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .panel,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .shell,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .card,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .container,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .wrapper,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .content,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .box,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .input-panel,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .result-panel,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .feature-group,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .time-box,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .quote-block,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .shrine,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .fortune-result,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .result-box,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .toolbar,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .player-shell,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .game-card {",
      "  background: linear-gradient(160deg, rgba(20, 26, 40, 0.88), rgba(12, 16, 28, 0.94)) !important;",
      "  color: #edf3ff !important;",
      "  border-color: rgba(255,255,255,0.1) !important;",
      "  box-shadow: inherit !important;",
      "  backdrop-filter: none !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) [style*=\"background: #fff\"],",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) [style*=\"background:#fff\"],",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) [style*=\"background-color: #fff\"],",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) [style*=\"background-color:#fff\"],",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) [style*=\"background: white\"],",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) [style*=\"background-color: white\"] {",
      "  background: linear-gradient(160deg, rgba(20, 26, 40, 0.92), rgba(12, 16, 28, 0.96)) !important;",
      "  color: #edf3ff !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .quote-block,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .time-box,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .feature-group,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .input-panel,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .result-panel {",
      "  background-image: linear-gradient(155deg, rgba(24,30,44,0.94), rgba(16,19,30,0.96)) !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .feature-group.theme-bubu {",
      "  background-image: url(\"../stickers/DB/DB_BOX.jpg\") !important;",
      "  background-size: contain !important;",
      "  background-position: center top !important;",
      "  background-repeat: no-repeat !important;",
      "  background-color: #111a2a !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .feature-group.theme-bubu .feature-btn {",
      "  background: transparent !important;",
      "  box-shadow: none !important;",
      "  border: none !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) img,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) video,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) iframe,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) canvas,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) audio {",
      "  filter: none !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .bg-effects,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) #emoji-stars,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) #emoji-bubbles {",
      "  opacity: 1;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) .quick-nav-btn,",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) #musicBtn {",
      "  background: linear-gradient(135deg, rgba(255, 125, 196, 0.9), rgba(105, 169, 255, 0.9)) !important;",
      "  color: #ffffff !important;",
      "  box-shadow: inherit !important;",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) * {",
      "  transition: background-color 180ms ease, background-image 180ms ease, color 180ms ease, border-color 180ms ease;",
      "}",
      "html." + PAGE_LOADING_CLASS + " body > *:not(#site-loader-overlay):not(#site-theme-toggle):not(#site-theme-curtain) {",
      "  opacity: 0 !important;",
      "  visibility: hidden !important;",
      "}",
      "#site-loader-overlay {",
      "  position: fixed;",
      "  inset: 0;",
      "  z-index: 10002;",
      "  display: grid;",
      "  place-items: center;",
      "  padding: 24px;",
      "  background: transparent;",
      "  transition: opacity 220ms ease, visibility 220ms ease;",
      "}",
      "#site-loader-overlay.is-hidden {",
      "  opacity: 0;",
      "  visibility: hidden;",
      "  pointer-events: none;",
      "}",
      "#site-loader-card {",
      "  display: grid;",
      "  gap: 0;",
      "  justify-items: center;",
      "  text-align: center;",
      "  padding: 0;",
      "  min-width: 0;",
      "  background: transparent;",
      "  border: 0;",
      "  box-shadow: none;",
      "  backdrop-filter: none;",
      "}",
      "#site-loader-title {",
      "  font-family: \"SiteLoaderWildcrazy\", \"Segoe UI Emoji\", \"Apple Color Emoji\", \"Noto Color Emoji\", sans-serif;",
      "  font-size: clamp(1.7rem, 3.6vw, 2.5rem);",
      "  line-height: 1.2;",
      "  letter-spacing: 0.02em;",
      "  color: #45374f;",
      "  text-shadow: 0 2px 10px rgba(255,255,255,0.45);",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) #site-loader-title { color: #eef4ff; text-shadow: 0 4px 18px rgba(0,0,0,0.34); }",
      "#site-theme-toggle {",
      "  position: fixed;",
      "  top: max(14px, env(safe-area-inset-top, 0px) + 10px);",
      "  right: max(18px, env(safe-area-inset-right, 0px) + 14px);",
      "  z-index: 10001;",
      "  border: 0;",
      "  border-radius: 999px;",
      "  padding: 11px 16px;",
      "  min-width: 138px;",
      "  font-family: \"SiteLoaderWildcrazy\", \"Segoe UI Emoji\", \"Apple Color Emoji\", \"Noto Color Emoji\", sans-serif;",
      "  font-size: 14px;",
      "  font-weight: 600;",
      "  line-height: 1.1;",
      "  letter-spacing: 0.02em;",
      "  cursor: pointer;",
      "  color: #000000;",
      "  background: linear-gradient(135deg, rgba(255, 239, 246, 0.97), rgba(235, 245, 255, 0.97), rgba(255, 247, 218, 0.97));",
      "  box-shadow: 0 16px 34px rgba(18, 24, 39, 0.16), inset 0 1px 0 rgba(255,255,255,0.88);",
      "  backdrop-filter: blur(12px);",
      "  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;",
      "}",
      "#site-theme-toggle:hover {",
      "  transform: translateY(-2px);",
      "  box-shadow: 0 18px 34px rgba(18, 24, 39, 0.22);",
      "}",
      "html." + THEME_DARK_CLASS + ":not([data-theme-exempt=\"true\"]) #site-theme-toggle {",
      "  color: #f4f7ff;",
      "  background: linear-gradient(135deg, rgba(28,33,49,0.92), rgba(15,19,30,0.96));",
      "  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34);",
      "}",
      "#site-theme-curtain {",
      "  position: fixed;",
      "  inset: 0;",
      "  z-index: 10000;",
      "  pointer-events: none;",
      "  opacity: 0;",
      "  visibility: hidden;",
      "  background: linear-gradient(180deg, rgba(19, 25, 38, 0) 0%, rgba(19, 25, 38, 0.82) 50%, rgba(19, 25, 38, 0) 100%);",
      "  transform: translateY(-100%);",
      "}",
      "#site-theme-curtain.is-animating {",
      "  visibility: visible;",
      "  animation: site-theme-paint-fall 520ms ease forwards;",
      "}",
      "@keyframes site-theme-paint-fall {",
      "  0% { opacity: 0; transform: translateY(-100%); }",
      "  25% { opacity: 0.7; transform: translateY(-25%); }",
      "  55% { opacity: 0.9; transform: translateY(0%); }",
      "  100% { opacity: 0; transform: translateY(100%); }",
      "}",
      "@media (max-width: 768px) {",
      "  #site-theme-toggle {",
      "    top: max(10px, env(safe-area-inset-top, 0px) + 8px);",
      "    right: max(12px, env(safe-area-inset-right, 0px) + 10px);",
      "    padding: 10px 14px;",
      "    min-width: 122px;",
      "    font-size: 13px;",
      "  }",
      "}"
    ].join("\n");

    document.head.appendChild(style);

    var loader = document.createElement("div");
    loader.id = "site-loader-overlay";
    loader.innerHTML = [
      '<div id="site-loader-card">',
      '  <div id="site-loader-title">Loading... please wait cutie pie!!</div>',
      '</div>'
    ].join("");

    var curtain = document.createElement("div");
    curtain.id = "site-theme-curtain";

    document.body.appendChild(loader);
    document.body.appendChild(curtain);

    if (isHomePage) {
      var toggle = document.createElement("button");
      toggle.id = "site-theme-toggle";
      toggle.type = "button";
      toggle.addEventListener("click", function () {
        window.location.href = addVersionParam("nightverse.html");
      });
      document.body.appendChild(toggle);
    }

    applyTheme(docEl.classList.contains(THEME_DARK_CLASS) ? "dark" : "light");
  }

  function markPageReady() {
    if (!docEl) return;
    docEl.classList.remove(PAGE_LOADING_CLASS);
    var loader = document.getElementById("site-loader-overlay");
    if (!loader) return;
    loader.classList.add("is-hidden");
  }

  async function clearBrowserCachesOncePerVersion() {
    try {
      if (sessionStorage.getItem(SESSION_CACHE_KEY) === APP_VERSION) {
        return;
      }

      sessionStorage.setItem(SESSION_CACHE_KEY, APP_VERSION);

      if ("caches" in window) {
        var cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(function (key) {
          return caches.delete(key);
        }));
      }

      if ("serviceWorker" in navigator) {
        var registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(function (registration) {
          return registration.unregister();
        }));
      }
    } catch (error) {
      // Keep runtime silent if cache APIs are unavailable.
    }
  }

  function installHiddenPageStyle() {
    if (document.getElementById("site-runtime-hidden-style")) return;

    var style = document.createElement("style");
    style.id = "site-runtime-hidden-style";
    style.textContent = [
      "html.page-hidden *,",
      "html.page-hidden *::before,",
      "html.page-hidden *::after {",
      "  animation-play-state: paused !important;",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function installMutationRepairObserver() {
    if (!("MutationObserver" in window) || !document.body || mutationRepairObserver) return;

    mutationRepairObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          queueTextRepair(node);
        });
      });
    });

    mutationRepairObserver.observe(document.body, { childList: true, subtree: true });
  }

  function bootRuntime() {
    installHiddenPageStyle();
    installThemeUi();
    syncVisibilityState();
    versionLocalLinks();
    repairVisibleText(document.body);
    installMutationRepairObserver();
    scheduleIdle(function () {
      clearBrowserCachesOncePerVersion();
    }, 1200);
  }

  document.addEventListener("click", handleAnchorClicks, true);
  document.addEventListener("visibilitychange", syncVisibilityState, { passive: true });
  window.addEventListener("load", function () {
    window.setTimeout(markPageReady, 120);
  }, { once: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bootRuntime();
    }, { once: true });
  } else {
    bootRuntime();
  }
})();

