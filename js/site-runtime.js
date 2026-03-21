(function () {
  "use strict";

  var APP_VERSION = "20260321-runtime1";
  var SESSION_CACHE_KEY = "__pengu_runtime_cache_version__";
  var docEl = document.documentElement;

  if (docEl) {
    docEl.setAttribute("data-app-version", APP_VERSION);
  }

  function isLocalUrl(url) {
    if (!url) return false;

    var trimmed = url.trim();
    if (!trimmed || trimmed.startsWith("#")) return false;
    if (/^(?:[a-z]+:)?\/\//i.test(trimmed)) return false;
    if (/^(?:mailto|tel|javascript|data|blob):/i.test(trimmed)) return false;

    return true;
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

  document.addEventListener("click", handleAnchorClicks, true);
  document.addEventListener("visibilitychange", syncVisibilityState, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      installHiddenPageStyle();
      syncVisibilityState();
      versionLocalLinks();
      clearBrowserCachesOncePerVersion();
    }, { once: true });
  } else {
    installHiddenPageStyle();
    syncVisibilityState();
    versionLocalLinks();
    clearBrowserCachesOncePerVersion();
  }
})();
