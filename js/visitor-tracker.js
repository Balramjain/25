(function () {
  const STORAGE_KEY = "penguVisitorLog";
  const PROFILE_KEY = "penguVisitorProfile";
  const SESSION_KEY = "penguVisitorSessionId";
  const LAST_UPDATED_KEY = "penguVisitorLogUpdatedAt";
  const MAX_ENTRIES = 150;
  const PAGE_NAME = window.location.pathname.split("/").pop() || "index.html";
  const PAGE_TITLE = document.title || PAGE_NAME;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readProfile() {
    return safeParse(localStorage.getItem(PROFILE_KEY), null);
  }

  function writeProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function readLog() {
    const log = safeParse(localStorage.getItem(STORAGE_KEY), []);
    return Array.isArray(log) ? log : [];
  }

  function writeLog(log) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, MAX_ENTRIES)));
    localStorage.setItem(LAST_UPDATED_KEY, String(Date.now()));
  }

  function createSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "session-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function getSessionId() {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const next = createSessionId();
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  }

  function resolveVisitorName() {
    const current = readProfile();
    if (current && current.name) return current.name;

    const shouldPrompt = document.body && document.body.dataset.visitorPrompt !== "false";
    let name = "";

    if (shouldPrompt) {
      name = window.prompt("Enter your name for the visitor log:", "") || "";
    }

    const trimmed = name.trim();
    const finalName = trimmed || "Anonymous Guest";
    writeProfile({ name: finalName });
    return finalName;
  }

  function recordVisit() {
    const visitorName = resolveVisitorName();
    const sessionId = getSessionId();
    const log = readLog();
    const nowIso = new Date().toISOString();
    const newest = log[0];

    if (
      newest &&
      newest.sessionId === sessionId &&
      newest.page === PAGE_NAME &&
      Date.now() - new Date(newest.timestamp).getTime() < 15000
    ) {
      return;
    }

    log.unshift({
      name: visitorName,
      page: PAGE_NAME,
      title: PAGE_TITLE,
      timestamp: nowIso,
      sessionId: sessionId
    });

    writeLog(log);
  }

  recordVisit();

  window.PenguVisitorTracker = {
    getLog: readLog,
    getProfile: readProfile,
    setName(name) {
      const trimmed = (name || "").trim();
      const finalName = trimmed || "Anonymous Guest";
      writeProfile({ name: finalName });
      return finalName;
    },
    clearLog() {
      writeLog([]);
    },
    getLastUpdatedAt() {
      return Number(localStorage.getItem(LAST_UPDATED_KEY) || 0);
    }
  };
})();
