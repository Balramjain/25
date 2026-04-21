(function () {
  "use strict";

  var docEl = document.documentElement;
  var body = document.body;
  var app = document.getElementById("nightverse-app");
  var APP_VERSION = docEl.getAttribute("data-app-version") || "20260331-runtime13";

  if (!body || !app) {
    return;
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function sample(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    var copy = list.slice();
    var index = copy.length - 1;

    for (; index > 0; index -= 1) {
      var swapIndex = Math.floor(Math.random() * (index + 1));
      var temp = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temp;
    }

    return copy;
  }

  function pick(list, count) {
    return shuffle(list).slice(0, count);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function safeParagraph(value) {
    return escapeHtml(value).replace(/\n/g, "<br />");
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function setTheme(feature) {
    var accent = feature && feature.colors ? feature.colors[0] : "#8dd5ff";
    var accent2 = feature && feature.colors ? feature.colors[1] : "#ff8fd3";
    var accent3 = feature && feature.colors ? feature.colors[2] : "#ffe18c";

    docEl.style.setProperty("--accent", accent);
    docEl.style.setProperty("--accent-2", accent2);
    docEl.style.setProperty("--accent-3", accent3);
    docEl.style.setProperty("--hero-glow", "radial-gradient(circle at top, " + accent + "22, transparent 55%)");
  }

  function featureFile(slug) {
    return "nightverse-" + slug + ".html";
  }

  function statsMarkup(feature) {
    return [
      { label: "Lab", value: feature.lab },
      { label: "Play style", value: feature.mode },
      { label: "Visual hook", value: feature.visual },
      { label: "Replay value", value: feature.replay }
    ].map(function (item) {
      return [
        '<div class="nv-stat">',
        '  <span>' + escapeHtml(item.label) + '</span>',
        '  <strong>' + escapeHtml(item.value) + '</strong>',
        "</div>"
      ].join("");
    }).join("");
  }

  function badgesMarkup(items) {
    return items.map(function (item) {
      return '<span class="nv-pill">' + escapeHtml(item) + "</span>";
    }).join("");
  }

  function renderPanelHead(eyebrow, title, copy) {
    return [
      '<div class="nv-panel__head">',
      '  <span class="nv-panel__eyebrow">' + escapeHtml(eyebrow) + "</span>",
      '  <h2 class="nv-panel__title">' + escapeHtml(title) + "</h2>",
      '  <p class="nv-panel__copy">' + escapeHtml(copy) + "</p>",
      "</div>"
    ].join("");
  }

  function renderCard(feature) {
    return [
      '<a class="nv-card" href="' + featureFile(feature.slug) + '" style="--card-accent:' + feature.colors[0] + ";--card-accent-2:" + feature.colors[1] + ';">',
      '  <span class="nv-card__no">' + escapeHtml(feature.id) + "</span>",
      '  <span class="nv-card__kicker">' + escapeHtml(feature.kicker) + "</span>",
      '  <h3 class="nv-card__title">' + escapeHtml(feature.title) + "</h3>",
      '  <p class="nv-card__copy">' + escapeHtml(feature.description) + "</p>",
      '  <div class="nv-card__meta">' + badgesMarkup(feature.tags.slice(0, 2)) + "</div>",
      '  <span class="nv-card__cta"><strong>' + escapeHtml(feature.cta) + '</strong><span>tap to open portal</span></span>',
      "</a>"
    ].join("");
  }

  function portalRail(currentSlug) {
    var suggestions = pick(FEATURE_ORDER.filter(function (slug) {
      return slug !== currentSlug;
    }), 3);

    return [
      '<section class="nv-panel nv-panel--full">',
      renderPanelHead("Try another portal", "More dark-side detours", "You do not have to go back to the hub each time. Here are three nearby portals to keep the chaos moving."),
      '<div class="nv-grid">',
      suggestions.map(function (slug) {
        return renderCard(FEATURES[slug]);
      }).join(""),
      "</div>",
      "</section>"
    ].join("");
  }

  function featureShell(feature, options) {
    return [
      '<div class="nv-shell">',
      '  <div class="nv-topbar">',
      '    <div style="display:flex;gap:12px;flex-wrap:wrap;">',
      '      <a class="nv-back" href="nightverse.html">&larr; Back to Twinverse</a>',
      '      <a class="nv-back nv-back--ghost" href="index.html" onclick="sessionStorage.setItem(\'cameBack\',\'true\');">&larr; Back to Blues</a>',
      "    </div>",
      '    <div class="nv-topnote">Separate portal. Same devotion. This one is meant to feel like its own little midnight toybox, so poke around and let it be ridiculous.</div>',
      "  </div>",
      '  <section class="nv-hero">',
      '    <span class="nv-hero__eyebrow">' + escapeHtml(feature.kicker) + "</span>",
      '    <h1 class="nv-hero__title">' + escapeHtml(feature.title) + "</h1>",
      '    <p class="nv-hero__copy">' + escapeHtml(feature.description) + "</p>",
      '    <div class="nv-badges">' + badgesMarkup(feature.tags) + "</div>",
      '    <div class="nv-hero__stats">' + statsMarkup(feature) + "</div>",
      "  </section>",
      '  <div class="nv-layout">',
      '    <section class="nv-panel">',
      renderPanelHead(options.controlsEyebrow || "Tune it", options.controlsTitle, options.controlsCopy),
      '      <div class="nv-form">' + options.controlsHtml + "</div>",
      "    </section>",
      '    <section class="nv-panel">',
      renderPanelHead(options.stageEyebrow || "Watch it", options.stageTitle, options.stageCopy),
      '      <div class="nv-stack">' + options.stageHtml + "</div>",
      "    </section>",
      options.footerHtml ? [
        '    <section class="nv-panel nv-panel--full">',
        options.footerHtml,
        "    </section>"
      ].join("") : "",
      portalRail(feature.slug),
      "  </div>",
      "</div>"
    ].join("");
  }

  function bindChipGroup(containerId) {
    var container = qs("#" + containerId);
    if (!container) {
      return function () {
        return "";
      };
    }

    container.addEventListener("click", function (event) {
      var button = event.target.closest(".nv-chipbtn");
      if (!button) {
        return;
      }

      qsa(".nv-chipbtn", container).forEach(function (chip) {
        chip.classList.toggle("is-active", chip === button);
      });
    });

    return function () {
      var active = qs(".nv-chipbtn.is-active", container) || qs(".nv-chipbtn", container);
      return active ? active.getAttribute("data-value") || "" : "";
    };
  }

  function bindRange(inputId, readoutId, formatter) {
    var input = qs("#" + inputId);
    var readout = qs("#" + readoutId);

    if (!input || !readout) {
      return null;
    }

    function sync() {
      readout.textContent = formatter ? formatter(input.value) : input.value;
    }

    input.addEventListener("input", sync);
    sync();
    return input;
  }

  function renderBlocks(targetId, items, cardClass) {
    var target = qs("#" + targetId);
    if (!target) {
      return;
    }

    target.innerHTML = items.map(function (item) {
      return [
        '<div class="' + escapeHtml(cardClass) + '">',
        item.title ? "<strong>" + escapeHtml(item.title) + "</strong>" : "",
        "<p>" + safeParagraph(item.body || "") + "</p>",
        "</div>"
      ].join("");
    }).join("");
  }

  function setHtml(targetId, value) {
    var node = qs("#" + targetId);
    if (node) {
      node.innerHTML = value;
    }
  }

  function setText(targetId, value) {
    var node = qs("#" + targetId);
    if (node) {
      node.textContent = value;
    }
  }

  function setWidth(targetId, value) {
    var node = qs("#" + targetId);
    if (node) {
      node.style.width = clamp(value, 0, 100) + "%";
    }
  }

  function renderHub() {
    setTheme({ colors: ["#8dd5ff", "#ff8fd3", "#ffe18c"] });
    document.title = "Bangari After Dark";
    var portalCount = FEATURE_ORDER.length;
    var labCount = SECTION_ORDER.length;

    app.innerHTML = [
      '<div class="nv-shell">',
      '  <div class="nv-topbar">',
      '    <a class="nv-back" href="index.html" onclick="sessionStorage.setItem(\'cameBack\',\'true\');">&larr; Back to Blues</a>',
      '    <div class="nv-topnote">The Twinverse is supposed to feel like a secret toybox now: softer, cuter, and way less like a catalog.</div>',
      "  </div>",
      '  <section class="nv-hero">',
      '    <span class="nv-hero__eyebrow">Twinverse cuddle arcade</span>',
      '    <h1 class="nv-hero__title">Bangari, your secret second world is now a glittery little portal carnival.</h1>',
      '    <p class="nv-hero__copy">' + portalCount + ' tiny portals, each with its own mood. Pick one when you want soft chaos, fake drama, late-night sweetness, or a mini-game that feels like it only exists for you.</p>',
      '    <div class="nv-badges">' + badgesMarkup([portalCount + " portal treats", labCount + " spark zones", "cute chaos ready", "pick a portal"]) + "</div>",
      '    <div class="nv-hero__stats">',
      '      <div class="nv-stat"><span>Portal candy</span><strong>' + portalCount + ' tiny worlds</strong></div>',
      '      <div class="nv-stat"><span>Playrooms</span><strong>' + labCount + ' sparkle labs</strong></div>',
      '      <div class="nv-stat"><span>Night signal</span><strong id="nvNightSignal">soft riot mode</strong></div>',
      '      <div class="nv-stat"><span>Mood clock</span><strong id="nvVibeClock">2:07 AM pillow fort quest</strong></div>',
      "    </div>",
      "  </section>",
      SECTION_ORDER.map(function (sectionKey) {
        var section = SECTION_META[sectionKey];
        return [
          '<section class="nv-section">',
          '  <div class="nv-section__head">',
          "    <div>",
          "      <h2>" + escapeHtml(section.title) + "</h2>",
          "    </div>",
          "    <p>" + escapeHtml(section.copy) + "</p>",
          "  </div>",
          '  <div class="nv-grid">',
          section.features.map(function (slug) {
            return renderCard(FEATURES[slug]);
          }).join(""),
          "  </div>",
          "</section>"
        ].join("");
      }).join(""),
      '  <div class="nv-footer-note">Still the same girl. Just a cuter midnight dimension now: pick a portal, fall into it, come back giggling, repeat.</div>',
      "</div>"
    ].join("");

    installHubTicker();
  }

  function installHubTicker() {
    var signal = qs("#nvNightSignal");
    var vibe = qs("#nvVibeClock");

    if (!signal || !vibe) {
      return;
    }

    var signals = ["soft riot mode", "dangerously cuddly", "sparkle gremlin", "pocket chaos angel", "romantic glitch active"];
    var vibes = ["2:07 AM pillow fort quest", "1:43 AM glittery menace", "3:12 AM cuddle arcade", "12:58 AM secret portal hour", "2:26 AM zero chill mode"];

    function sync() {
      signal.textContent = sample(signals);
      vibe.textContent = sample(vibes);
    }

    sync();
    window.setInterval(sync, 3400);
  }

  var SECTION_META = {
    arcade: {
      title: "Night Arcade",
      copy: "Tap things, chase streaks, and let the Twinverse act like a candy-lit mini arcade for a while.",
      features: ["whack-the-overthought", "dark-fate-slot-machine", "heartbeat-sync"]
    },
    orbit: {
      title: "Orbit Playground",
      copy: "Portals, missions, silly alternate timelines, and future-home nonsense with extra midnight glow.",
      features: ["midnight-mission", "parallel-universe", "soft-roast-engine", "future-apartment-builder", "cosmic-nickname-forge"]
    },
    heart: {
      title: "Heart Glow Lab",
      copy: "Comfort tools, repair rituals, and soft little systems for nights that need reassurance without losing the charm.",
      features: ["rescue-kit", "apology-architect", "protective-spellbook", "jealousy-antidote", "sleep-call-script"]
    },
    chaos: {
      title: "Chaos Cutie Club",
      copy: "Fake trailers, dramatic drives, future texts, and affection-powered nonsense with absolutely no normal energy.",
      features: ["night-drive-plotter", "tiny-heist-planner", "movie-trailer", "future-text-thread", "cuddle-protocol"]
    },
    future: {
      title: "Someday Spark Lab",
      copy: "Dates, wishes, outfit drops, and ridiculous future plans that already feel halfway real.",
      features: ["dream-date-blueprint", "promise-contract", "wish-vault", "future-closet-drop", "joint-bucket-shock"]
    },
    signal: {
      title: "Soft Signal Studio",
      copy: "Scanners, maps, constellations, and pretty feeling-machines for when emotions deserve extra sparkle.",
      features: ["soul-signal-meter", "comfort-map", "memory-remix-machine", "constellation-for-her", "aura-portrait"]
    }
  };

  var SECTION_ORDER = ["arcade", "orbit", "heart", "chaos", "future", "signal"];

  var FEATURE_ORDER = [
    "whack-the-overthought",
    "dark-fate-slot-machine",
    "heartbeat-sync",
    "midnight-mission",
    "parallel-universe",
    "soft-roast-engine",
    "future-apartment-builder",
    "cosmic-nickname-forge",
    "rescue-kit",
    "apology-architect",
    "protective-spellbook",
    "jealousy-antidote",
    "sleep-call-script",
    "night-drive-plotter",
    "tiny-heist-planner",
    "movie-trailer",
    "future-text-thread",
    "cuddle-protocol",
    "dream-date-blueprint",
    "promise-contract",
    "wish-vault",
    "future-closet-drop",
    "joint-bucket-shock",
    "soul-signal-meter",
    "comfort-map",
    "memory-remix-machine",
    "constellation-for-her",
    "aura-portrait"
  ];

  var FEATURES = {
    "whack-the-overthought": featureMeta("26", "whack-the-overthought", "Whack the Overthought", "Tap-game for the spiral brain", "An actual pressure game where bad thoughts pop up, you whack them down, and combo streaks keep the calm from collapsing.", "Start round", "Night Arcade", "Tap reaction game", "Live target board", "Very high", ["score chase", "combo streak", "anti spiral"], ["#ff8fd3", "#ffd77e", "#8ce7ff"], renderWhackTheOverthought, initWhackTheOverthought),
    "dark-fate-slot-machine": featureMeta("27", "dark-fate-slot-machine", "Dark Fate Slot Machine", "Jackpots, near misses, promise cards", "A darker slot machine with credits, jackpot logic, near-miss roasts, and promise-card reveals when fate actually behaves.", "Spin fate", "Night Arcade", "Arcade slots", "Fate reels", "Very high", ["slot machine", "jackpot", "promise reveal"], ["#d3b0ff", "#ff8fd3", "#ffe18c"], renderDarkFateSlotMachine, initDarkFateSlotMachine),
    "heartbeat-sync": featureMeta("28", "heartbeat-sync", "Heartbeat Sync", "Pure timing pressure", "A skill game where you hit the sync zone on a moving heartbeat rail before the streak or lives run out.", "Start sync", "Night Arcade", "Timing skill game", "Pulse rail", "Very high", ["skill game", "timing", "streak"], ["#8ce7ff", "#88ffc9", "#ff8fd3"], renderHeartbeatSync, initHeartbeatSync),
    "midnight-mission": featureMeta("01", "midnight-mission", "Midnight Mission", "Orbit Lab side quest", "Spin up a late-night mission dossier with objectives, pressure, and a tiny reward at the end.", "Launch mission", "Orbit Lab", "Generator + board", "Quest dossier", "Very high", ["story engine", "objective chain", "replay"], ["#8ce7ff", "#ff91cb", "#ffe18c"], renderMidnightMission, initMidnightMission),
    "parallel-universe": featureMeta("02", "parallel-universe", "Parallel Universe Us", "Elsewhere but still us", "Open a portal and see what kind of ridiculous couple we become in another reality.", "Open portal", "Orbit Lab", "Portal reveal", "Animated orb", "High", ["alternate world", "duo lore", "visual scene"], ["#83b3ff", "#8ce7ff", "#d1b1ff"], renderParallelUniverse, initParallelUniverse),
    "soft-roast-engine": featureMeta("03", "soft-roast-engine", "Soft Roast Engine", "Lovingly rude machine", "Dial in the sweetness, then let the Twinverse roast with affection and immediate aftercare.", "Roast gently", "Orbit Lab", "Slider + output", "Heat meter", "High", ["teasing", "aftercare", "fast reroll"], ["#ff9fcf", "#ffd77e", "#8ce7ff"], renderSoftRoast, initSoftRoast),
    "future-apartment-builder": featureMeta("04", "future-apartment-builder", "Future Apartment Builder", "Our imaginary home lab", "Build a tiny shared future apartment vibe and watch the blueprint fill itself in.", "Build blueprint", "Orbit Lab", "Builder", "Room grid", "High", ["future home", "visual builder", "layout"], ["#8ce7ff", "#88ffc9", "#ffd77e"], renderApartmentBuilder, initApartmentBuilder),
    "cosmic-nickname-forge": featureMeta("05", "cosmic-nickname-forge", "Cosmic Nickname Forge", "Slot machine of endearment", "Spin a cosmic slot machine until it spits out a ridiculous, overdramatic nickname.", "Spin forge", "Orbit Lab", "Spinner", "Reel animation", "High", ["nickname lab", "slot machine", "chaos cute"], ["#d2a6ff", "#ff8fd3", "#8ce7ff"], renderNicknameForge, initNicknameForge),
    "rescue-kit": featureMeta("06", "rescue-kit", "3AM Rescue Kit", "Emergency softness pack", "Choose the mood and battery level, then assemble a practical emotional rescue kit.", "Assemble kit", "Heart Lab", "Mood builder", "Kit board", "High", ["comfort", "support", "night rescue"], ["#8ce7ff", "#c3b2ff", "#ffe18c"], renderRescueKit, initRescueKit),
    "apology-architect": featureMeta("07", "apology-architect", "Apology Architect", "Repair plan generator", "Turn a messy situation into a clear apology structure with emotional follow-through.", "Draft repair", "Heart Lab", "Prompt + builder", "Repair cards", "High", ["repair", "thoughtful", "structure"], ["#ffd77e", "#ff8fd3", "#8ce7ff"], renderApologyArchitect, initApologyArchitect),
    "protective-spellbook": featureMeta("08", "protective-spellbook", "Protective Spellbook", "Tiny rituals for her day", "Pick your runes, cast a purpose, and build a made-up but reassuring protection spell.", "Cast spell", "Heart Lab", "Rune ritual", "Sigil circle", "High", ["runes", "ritual", "comfort fantasy"], ["#b79cff", "#8ce7ff", "#ff8fd3"], renderProtectiveSpellbook, initProtectiveSpellbook),
    "jealousy-antidote": featureMeta("09", "jealousy-antidote", "Jealousy Antidote", "Pop the bad thoughts", "Tap anxious thought-bubbles until the reassurance field takes over the page.", "Reset antidote", "Heart Lab", "Tap mini-game", "Thought bubbles", "Very high", ["mini game", "reassurance", "pop"], ["#ff8fd3", "#8ce7ff", "#ffe18c"], renderJealousyAntidote, initJealousyAntidote),
    "sleep-call-script": featureMeta("10", "sleep-call-script", "Sleep Call Script", "Bedtime teleprompter", "Generate a bedtime call flow and page through it like a tiny dark-mode teleprompter.", "Write script", "Heart Lab", "Script viewer", "Teleprompter", "High", ["bedtime", "soft talk", "step through"], ["#8ce7ff", "#9cb8ff", "#ffd77e"], renderSleepCallScript, initSleepCallScript),
    "night-drive-plotter": featureMeta("11", "night-drive-plotter", "Night Drive Plotter", "Weather, music, destination", "Plot a dramatic night drive and get a route board full of stops and tiny scenes.", "Plot drive", "Chaos Lab", "Route builder", "Drive strip", "High", ["drive fantasy", "route", "scene builder"], ["#8ce7ff", "#ffd77e", "#ff8fd3"], renderNightDrivePlotter, initNightDrivePlotter),
    "tiny-heist-planner": featureMeta("12", "tiny-heist-planner", "Tiny Heist Planner", "Adorable crime board", "Plan a fictional little heist where the prize is always something affectionate and ridiculous.", "Plan heist", "Chaos Lab", "Board generator", "Dossier cards", "High", ["heist", "silly plan", "crew board"], ["#ff8fd3", "#ffd77e", "#8ce7ff"], renderTinyHeistPlanner, initTinyHeistPlanner),
    "movie-trailer": featureMeta("13", "movie-trailer", "Movie Trailer Of Us", "Poster and trailer beats", "Generate a fake relationship trailer with title cards, scenes, and scandal level.", "Roll trailer", "Chaos Lab", "Poster generator", "Trailer board", "High", ["poster", "tagline", "cinematic"], ["#ffd77e", "#ff8fd3", "#8ce7ff"], renderMovieTrailer, initMovieTrailer),
    "future-text-thread": featureMeta("14", "future-text-thread", "Future Text Thread", "Simulated chat from later us", "Drop into a future year and watch a little text conversation type itself out.", "Open thread", "Chaos Lab", "Chat simulation", "Message bubbles", "Very high", ["chat sim", "future us", "typing"], ["#8ce7ff", "#88ffc9", "#ff8fd3"], renderFutureTextThread, initFutureTextThread),
    "cuddle-protocol": featureMeta("15", "cuddle-protocol", "Cuddle Protocol", "Comfort science", "Dial in the warmth and cling level, then let the protocol machine define the perfect cuddle setup.", "Run protocol", "Chaos Lab", "Parameter tuner", "Comfort bars", "High", ["cuddles", "soft system", "tunable"], ["#ff8fd3", "#b79cff", "#ffd77e"], renderCuddleProtocol, initCuddleProtocol),
    "dream-date-blueprint": featureMeta("16", "dream-date-blueprint", "Dream Date Blueprint", "Itinerary builder", "Sketch a date arc with timing, mood, budget, and scenes that feel like their own mini movie.", "Sketch date", "Future Lab", "Timeline builder", "Date itinerary", "High", ["date idea", "timeline", "future"], ["#8ce7ff", "#ffd77e", "#88ffc9"], renderDreamDateBlueprint, initDreamDateBlueprint),
    "promise-contract": featureMeta("17", "promise-contract", "Promise Contract", "Wax-sealed nonsense document", "Draft a dramatic little forever contract and stamp it with a glowing seal.", "Draft contract", "Future Lab", "Form + parchment", "Seal sheet", "High", ["contract", "signature", "keepsake"], ["#ffd77e", "#ff8fd3", "#b79cff"], renderPromiseContract, initPromiseContract),
    "wish-vault": featureMeta("18", "wish-vault", "Wish Vault", "Persistent little star jar", "Save tiny wishes into a vault that remembers them between visits.", "Store wish", "Future Lab", "Persistent vault", "Saved cards", "Very high", ["storage", "wishes", "persistent"], ["#8ce7ff", "#ff8fd3", "#ffe18c"], renderWishVault, initWishVault),
    "future-closet-drop": featureMeta("19", "future-closet-drop", "Future Closet Drop", "Dress the mannequin", "Build an outfit vibe and watch the Twinverse mannequin change shape and energy.", "Style look", "Future Lab", "Look builder", "Fashion mannequin", "High", ["outfit", "visual styling", "builder"], ["#ff8fd3", "#8ce7ff", "#ffe18c"], renderFutureClosetDrop, initFutureClosetDrop),
    "joint-bucket-shock": featureMeta("20", "joint-bucket-shock", "Joint Bucket Shock", "Reroll the someday list", "Draw one slightly unhinged future plan with a budget and chaos difficulty attached.", "Draw shock", "Future Lab", "Card draw", "Shock card", "High", ["bucket list", "surprise draw", "chaos"], ["#ffd77e", "#8ce7ff", "#ff8fd3"], renderJointBucketShock, initJointBucketShock),
    "soul-signal-meter": featureMeta("21", "soul-signal-meter", "Soul Signal Meter", "Bad science but pretty", "Run a suspiciously biased scan and watch the signal radar decide tonight's emotional bandwidth.", "Scan signal", "Signal Lab", "Scanner", "Radar visual", "High", ["radar", "scan", "meter"], ["#8ce7ff", "#88ffc9", "#b79cff"], renderSoulSignalMeter, initSoulSignalMeter),
    "comfort-map": featureMeta("22", "comfort-map", "Comfort Map", "Clickable route planner", "Generate a comfort route and tap through each node to see what happens there.", "Draw route", "Signal Lab", "Path map", "Node grid", "Very high", ["map", "comfort", "click through"], ["#88ffc9", "#8ce7ff", "#ffd77e"], renderComfortMap, initComfortMap),
    "memory-remix-machine": featureMeta("23", "memory-remix-machine", "Memory Remix Machine", "Ordinary memory to cinema", "Feed the machine a normal memory and get back a three-scene dramatic remix.", "Remix memory", "Signal Lab", "Text transformer", "Storyboard", "High", ["memory", "storyboard", "cinema"], ["#ff8fd3", "#8ce7ff", "#b79cff"], renderMemoryRemixMachine, initMemoryRemixMachine),
    "constellation-for-her": featureMeta("24", "constellation-for-her", "Constellation For Her", "Draw or auto-generate the sky", "Click stars into a canvas or let the page generate a constellation and name it for tonight.", "Redraw sky", "Signal Lab", "Canvas interaction", "Star canvas", "Very high", ["canvas", "constellation", "draw"], ["#8ce7ff", "#d3c0ff", "#ffe18c"], renderConstellationForHer, initConstellationForHer),
    "aura-portrait": featureMeta("25", "aura-portrait", "Aura Portrait", "Animated aura orb", "Pick traits and pulse speed, then paint an abstract aura portrait that glows with them.", "Read aura", "Signal Lab", "Trait mixer", "Aura canvas", "Very high", ["canvas art", "aura", "traits"], ["#ff8fd3", "#8ce7ff", "#88ffc9"], renderAuraPortrait, initAuraPortrait)
  };

  function featureMeta(id, slug, title, kicker, description, cta, lab, mode, visual, replay, tags, colors, render, init) {
    return {
      id: id,
      slug: slug,
      title: title,
      kicker: kicker,
      description: description,
      cta: cta,
      lab: lab,
      mode: mode,
      visual: visual,
      replay: replay,
      tags: tags,
      colors: colors,
      render: render,
      init: init
    };
  }

  // FEATURE_MODULES_START
  function renderWhackTheOverthought(feature) {
    return featureShell(feature, {
      controlsTitle: "Start the anti-spiral round",
      controlsCopy: "Pick the pressure and round length, then whack every overthought before it costs you lives.",
      controlsHtml: [
        '<label class="nv-label">Difficulty<select class="nv-select" id="whackDifficulty"><option value="easy">easy</option><option value="normal" selected>normal</option><option value="hard">hard</option></select></label>',
        '<label class="nv-label">Round length<select class="nv-select" id="whackLength"><option value="20">20 seconds</option><option value="30" selected>30 seconds</option><option value="40">40 seconds</option></select></label>',
        '<button class="nv-button nv-button--primary" id="whackStart" type="button">Start round</button>',
        '<div class="nv-output"><strong>Goal</strong><p>Keep the board clear. Missed overthoughts cost lives. Clean hits build combo and score.</p></div>'
      ].join(""),
      stageTitle: "Overthought board",
      stageCopy: "This one is real pressure: live targets expire, combos matter, and the board does not wait for you to over-explain yourself.",
      stageHtml: [
        '<div class="nv-grid-4" id="whackStats"></div>',
        '<div class="nv-whack-board" id="whackBoard"></div>',
        '<div class="nv-output"><strong>Round state</strong><p id="whackMessage" class="nv-empty">Start a round to begin clearing the spiral.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Result read", "How the round ended", "The point is not only score. It is how long you can keep the spiral from owning the screen."),
        '<div class="nv-output"><strong id="whackResultTitle">No round yet</strong><p id="whackResultCopy" class="nv-empty">The board is waiting.</p></div>'
      ].join("")
    });
  }

  function initWhackTheOverthought() {
    var board = qs("#whackBoard");
    var startButton = qs("#whackStart");
    var thoughts = [
      "what if I am too much?",
      "what if the vibe changed?",
      "what if silence means trouble?",
      "what if I read it wrong?",
      "what if distance wins tonight?",
      "what if I should have said less?",
      "what if my brain is right this time?",
      "what if the fear is the whole story?",
      "what if I ruined the mood?"
    ];
    var config = {
      easy: { spawnMs: 1150, comboBoost: 2 },
      normal: { spawnMs: 880, comboBoost: 3 },
      hard: { spawnMs: 680, comboBoost: 4 }
    };
    var state = {
      running: false,
      score: 0,
      combo: 0,
      lives: 5,
      timeLeft: 30,
      difficulty: "normal",
      activeIndex: -1,
      activeHit: false,
      roundTimer: null,
      spawnTimer: null
    };

    board.innerHTML = Array.from({ length: 9 }, function (_, index) {
      return '<button class="nv-whack-hole" type="button" data-index="' + index + '"><div><strong>steady</strong><span>keep it calm</span></div></button>';
    }).join("");

    function renderStats() {
      setHtml("whackStats", [
        { title: "Score", body: String(state.score) },
        { title: "Combo", body: "x" + state.combo },
        { title: "Lives", body: String(state.lives) },
        { title: "Time", body: state.timeLeft + "s" }
      ].map(function (item) {
        return '<div class="nv-bar-card"><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.body) + "</p></div>";
      }).join(""));
    }

    function clearTarget(index) {
      var hole = qs('[data-index="' + index + '"]', board);
      if (!hole) {
        return;
      }
      hole.classList.remove("is-live", "is-hit");
      hole.innerHTML = "<div><strong>steady</strong><span>keep it calm</span></div>";
    }

    function endRound(success) {
      state.running = false;
      window.clearInterval(state.roundTimer);
      window.clearInterval(state.spawnTimer);
      state.roundTimer = null;
      state.spawnTimer = null;
      if (state.activeIndex > -1) {
        clearTarget(state.activeIndex);
      }
      state.activeIndex = -1;
      renderStats();
      setText("whackResultTitle", success ? "Round won" : "Round ended");
      setText("whackResultCopy", success
        ? "You kept the spiral from taking the screen. Final score: " + state.score + "."
        : "Final score: " + state.score + ". The overthoughts got messy, but the round can always be restarted.");
    }

    function spawnTarget() {
      if (!state.running) {
        return;
      }

      if (state.activeIndex > -1 && !state.activeHit) {
        state.lives -= 1;
        state.combo = 0;
        setText("whackMessage", "Missed one. The spiral got louder.");
        clearTarget(state.activeIndex);
        state.activeIndex = -1;
        if (state.lives <= 0) {
          endRound(false);
          return;
        }
      }

      var nextIndex = Math.floor(Math.random() * 9);
      var hole = qs('[data-index="' + nextIndex + '"]', board);
      state.activeIndex = nextIndex;
      state.activeHit = false;
      hole.classList.add("is-live");
      hole.innerHTML = "<div><strong>WHACK</strong><span>" + escapeHtml(sample(thoughts)) + "</span></div>";
      renderStats();
    }

    board.addEventListener("click", function (event) {
      var hole = event.target.closest(".nv-whack-hole");
      if (!hole || !state.running) {
        return;
      }

      var holeIndex = Number(hole.getAttribute("data-index"));
      if (holeIndex !== state.activeIndex || state.activeHit) {
        return;
      }

      state.activeHit = true;
      state.combo += 1;
      state.score += 10 + (state.combo * config[state.difficulty].comboBoost);
      hole.classList.remove("is-live");
      hole.classList.add("is-hit");
      hole.innerHTML = "<div><strong>cleared</strong><span>spiral interrupted</span></div>";
      setText("whackMessage", "Hit clean. Combo x" + state.combo + ".");
      renderStats();
      window.setTimeout(function () {
        clearTarget(holeIndex);
        if (state.activeIndex === holeIndex) {
          state.activeIndex = -1;
        }
      }, 180);
    });

    function startRound() {
      state.running = true;
      state.score = 0;
      state.combo = 0;
      state.lives = 5;
      state.timeLeft = Number(qs("#whackLength").value || 30);
      state.difficulty = qs("#whackDifficulty").value;
      state.activeIndex = -1;
      state.activeHit = false;
      setText("whackMessage", "Round live. Keep the board clear.");
      setText("whackResultTitle", "Round running");
      setText("whackResultCopy", "Do not let the board fill with doubt.");
      qsa(".nv-whack-hole", board).forEach(function (hole) {
        hole.classList.remove("is-live", "is-hit");
        hole.innerHTML = "<div><strong>steady</strong><span>keep it calm</span></div>";
      });
      window.clearInterval(state.roundTimer);
      window.clearInterval(state.spawnTimer);
      renderStats();
      spawnTarget();
      state.spawnTimer = window.setInterval(spawnTarget, config[state.difficulty].spawnMs);
      state.roundTimer = window.setInterval(function () {
        if (!state.running) {
          return;
        }
        state.timeLeft -= 1;
        renderStats();
        if (state.timeLeft <= 0) {
          endRound(true);
        }
      }, 1000);
    }

    startButton.addEventListener("click", startRound);
    renderStats();
  }

  function renderDarkFateSlotMachine(feature) {
    return featureShell(feature, {
      controlsTitle: "Spin the dark fate reels",
      controlsCopy: "Choose your bet, then let the machine decide whether it owes you a promise card or a near-miss roast.",
      controlsHtml: [
        '<label class="nv-label">Bet<select class="nv-select" id="fateBet"><option value="1">1 coin</option><option value="2" selected>2 coins</option><option value="3">3 coins</option></select></label>',
        '<button class="nv-button nv-button--primary" id="fateSpin" type="button">Spin fate</button>',
        '<div class="nv-output"><strong>How it works</strong><p>Three of a kind wins big. Triple PROMISE is the real jackpot. Two of a kind unlocks a near-miss roast.</p></div>'
      ].join(""),
      stageTitle: "Fate machine",
      stageCopy: "The reels carry actual credit and streak logic, so it behaves more like a game cabinet than a random quote button.",
      stageHtml: [
        '<div class="nv-grid-4" id="fateStats"></div>',
        '<div class="nv-slot-machine nv-slot-machine--dark"><div class="nv-slot" id="fateSlotOne">MOON</div><div class="nv-slot" id="fateSlotTwo">PROMISE</div><div class="nv-slot" id="fateSlotThree">CHAOS</div></div>',
        '<div class="nv-output"><strong>Machine call</strong><p id="fateMessage" class="nv-empty">Spin to see what the cabinet thinks of your luck.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Promise card", "Prize or roast", "The cabinet either gives you something tender or makes fun of your near miss."),
        '<div class="nv-output"><strong id="fateRevealTitle">Nothing revealed yet</strong><p id="fateRevealCopy" class="nv-empty">Spin the machine to reveal the card.</p></div><div class="nv-grid-3" id="fateHistory"></div>'
      ].join("")
    });
  }

  function initDarkFateSlotMachine() {
    var reels = [qs("#fateSlotOne"), qs("#fateSlotTwo"), qs("#fateSlotThree")];
    var spinButton = qs("#fateSpin");
    var symbols = [
      { key: "PROMISE", type: "promise" },
      { key: "MOON", type: "moon" },
      { key: "HEART", type: "heart" },
      { key: "CHAOS", type: "chaos" },
      { key: "VEIL", type: "veil" }
    ];
    var state = {
      credits: 12,
      streak: 0,
      jackpots: 0,
      spins: 0,
      spinning: false,
      history: []
    };

    function renderFateStats() {
      setHtml("fateStats", [
        { title: "Credits", body: String(state.credits) },
        { title: "Streak", body: String(state.streak) },
        { title: "Jackpots", body: String(state.jackpots) },
        { title: "Spins", body: String(state.spins) }
      ].map(function (item) {
        return '<div class="nv-bar-card"><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.body) + "</p></div>";
      }).join(""));
    }

    function weightedOutcome() {
      var roll = Math.random();
      if (roll < 0.08) {
        return ["PROMISE", "PROMISE", "PROMISE"];
      }
      if (roll < 0.18) {
        var triple = sample(["MOON", "HEART", "CHAOS"]);
        return [triple, triple, triple];
      }
      if (roll < 0.42) {
        var pair = sample(["PROMISE", "MOON", "HEART", "CHAOS"]);
        var odd = sample(symbols.map(function (symbol) { return symbol.key; }).filter(function (key) {
          return key !== pair;
        }));
        return shuffle([pair, pair, odd]);
      }
      return [sample(symbols).key, sample(symbols).key, sample(symbols).key];
    }

    function updateHistory(resultTitle, resultCopy) {
      state.history.unshift({ title: resultTitle, body: resultCopy });
      state.history = state.history.slice(0, 3);
      renderBlocks("fateHistory", state.history, "nv-scene-card");
    }

    function finishSpin(outcome, bet) {
      reels.forEach(function (reel, index) {
        reel.textContent = outcome[index];
        reel.classList.remove("is-winning");
      });

      state.spinning += 1;
      var unique = Array.from(new Set(outcome));
      if (unique.length === 1 && outcome[0] === "PROMISE") {
        state.credits += bet * 10;
        state.streak += 1;
        state.jackpots += 1;
        reels.forEach(function (reel) { reel.classList.add("is-winning"); });
        setText("fateMessage", "Jackpot. The dark cabinet behaved.");
        setText("fateRevealTitle", "Promise card");
        setText("fateRevealCopy", sample([
          "Prize: one future night that lands exactly right without forcing it.",
          "Prize: one full-power reassurance with no awkward hedging in it.",
          "Prize: a promise that the right person will still feel right even in the messy hours."
        ]));
        updateHistory("Jackpot", "Triple PROMISE paid out " + (bet * 10) + " coins.");
      } else if (unique.length === 1) {
        state.credits += bet * 6;
        state.streak += 1;
        reels.forEach(function (reel) { reel.classList.add("is-winning"); });
        setText("fateMessage", "Clean triple. The machine respects that.");
        setText("fateRevealTitle", "Fate reward");
        setText("fateRevealCopy", sample([
          "Reward: one suspiciously cinematic evening is now statistically likely.",
          "Reward: bonus devotion points applied to the night.",
          "Reward: the cabinet grants extra luck for saying the softer truth first."
        ]));
        updateHistory("Triple hit", "Three of a kind paid out " + (bet * 6) + " coins.");
      } else if (unique.length === 2) {
        state.credits += bet * 2;
        state.streak = 0;
        setText("fateMessage", "Near miss. The cabinet laughs before refunding some dignity.");
        setText("fateRevealTitle", "Near-miss roast");
        setText("fateRevealCopy", sample([
          "Roast: fate saw the effort and still chose drama.",
          "Roast: that was close enough to hurt and not close enough to brag about.",
          "Roast: the cabinet loves tension more than it loves kindness."
        ]));
        updateHistory("Near miss", "Two symbols matched. Partial payout: " + (bet * 2) + " coins.");
      } else {
        state.streak = 0;
        setText("fateMessage", "Nothing landed. The cabinet remains morally suspicious.");
        setText("fateRevealTitle", "Cold fate");
        setText("fateRevealCopy", sample([
          "Roast: sometimes the machine simply wants character development.",
          "Roast: fate said no, but in a visually interesting way.",
          "Roast: the reels believe patience builds lore."
        ]));
        updateHistory("Bust", "No payout. The cabinet chose cruelty.");
      }

      renderFateStats();
      state.spinning = false;
    }

    function spinFate() {
      if (state.spinning) {
        return;
      }

      var bet = Number(qs("#fateBet").value || 2);
      if (state.credits < bet) {
        state.credits = 12;
        state.streak = 0;
        renderFateStats();
        setText("fateMessage", "Cabinet reloaded. Dark fate is ready for another run.");
        setText("fateRevealTitle", "Cabinet reset");
        setText("fateRevealCopy", "The machine took pity on the bankroll and reopened the table.");
        return;
      }

      state.spinning = true;
      state.credits -= bet;
      renderFateStats();
      setText("fateMessage", "Reels spinning...");
      reels.forEach(function (reel) {
        reel.classList.remove("is-winning");
      });

      var intervals = reels.map(function (reel) {
        return window.setInterval(function () {
          reel.textContent = sample(symbols).key;
        }, 90);
      });
      var outcome = weightedOutcome();

      reels.forEach(function (_, index) {
        window.setTimeout(function () {
          window.clearInterval(intervals[index]);
          reels[index].textContent = outcome[index];
          if (index === reels.length - 1) {
            finishSpin(outcome, bet);
          }
        }, 420 + (index * 220));
      });
    }

    spinButton.addEventListener("click", spinFate);
    renderFateStats();
    renderBlocks("fateHistory", [], "nv-scene-card");
  }

  function renderHeartbeatSync(feature) {
    return featureShell(feature, {
      controlsTitle: "Start the sync test",
      controlsCopy: "Pick the speed and target hits, then tap sync while the marker crosses the live zone.",
      controlsHtml: [
        '<label class="nv-label">Speed<select class="nv-select" id="syncDifficulty"><option value="slow">slow</option><option value="normal" selected>normal</option><option value="fast">fast</option></select></label>',
        '<label class="nv-label">Target hits<select class="nv-select" id="syncTarget"><option value="6">6 hits</option><option value="8" selected>8 hits</option><option value="10">10 hits</option></select></label>',
        '<div class="nv-grid-2"><button class="nv-button nv-button--primary" id="syncStart" type="button">Start sync</button><button class="nv-button nv-button--secondary" id="syncTap" type="button">Tap sync</button></div>',
        '<div class="nv-output"><strong>Goal</strong><p>Hit inside the zone to build streak. Misses cost lives. Spacebar also triggers sync.</p></div>'
      ].join(""),
      stageTitle: "Heartbeat rail",
      stageCopy: "This one is pure timing pressure. The marker never stops moving, and the sync zone keeps changing after clean hits.",
      stageHtml: [
        '<div class="nv-grid-4" id="syncStats"></div>',
        '<div class="nv-heart-track"><div class="nv-heart-zone" id="syncZone"></div><div class="nv-heart-marker" id="syncMarker"></div></div>',
        '<div class="nv-output"><strong>Round call</strong><p id="syncMessage" class="nv-empty">Start the test to begin.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Readout", "What the machine thinks", "The rail is biased toward rhythm, not patience. It rewards fast calm instead of frantic mashing."),
        '<div class="nv-output"><strong id="syncResultTitle">No test yet</strong><p id="syncResultCopy" class="nv-empty">The rail is waiting.</p></div>'
      ].join("")
    });
  }

  function initHeartbeatSync() {
    var state = {
      running: false,
      hits: 0,
      misses: 0,
      streak: 0,
      lives: 4,
      targetHits: 8,
      pos: 8,
      velocity: 0.95,
      direction: 1,
      zoneLeft: 38,
      zoneWidth: 18,
      frame: 0
    };
    var speedMap = {
      slow: 0.65,
      normal: 0.95,
      fast: 1.35
    };
    var marker = qs("#syncMarker");
    var zone = qs("#syncZone");

    function renderSyncStats() {
      setHtml("syncStats", [
        { title: "Hits", body: String(state.hits) + "/" + state.targetHits },
        { title: "Lives", body: String(state.lives) },
        { title: "Streak", body: "x" + state.streak },
        { title: "Misses", body: String(state.misses) }
      ].map(function (item) {
        return '<div class="nv-bar-card"><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.body) + "</p></div>";
      }).join(""));
    }

    function placeZone() {
      var minWidth = qs("#syncDifficulty").value === "fast" ? 10 : qs("#syncDifficulty").value === "slow" ? 20 : 15;
      state.zoneWidth = Math.max(minWidth, 22 - state.hits);
      state.zoneLeft = 6 + Math.random() * (94 - state.zoneWidth - 6);
      zone.style.left = state.zoneLeft + "%";
      zone.style.width = state.zoneWidth + "%";
    }

    function stopSync(success) {
      state.running = false;
      window.cancelAnimationFrame(state.frame);
      renderSyncStats();
      setText("syncResultTitle", success ? "Sync complete" : "Sync broken");
      setText("syncResultCopy", success
        ? "You landed " + state.hits + " clean sync hits before the rail could shake you off."
        : "The rail won this run. Final line: " + state.hits + " hits, " + state.misses + " misses.");
    }

    function animate() {
      if (!state.running) {
        return;
      }

      state.pos += state.velocity * state.direction;
      if (state.pos >= 100) {
        state.pos = 100;
        state.direction = -1;
      } else if (state.pos <= 0) {
        state.pos = 0;
        state.direction = 1;
      }

      marker.style.left = "calc(" + state.pos + "% - 9px)";
      state.frame = window.requestAnimationFrame(animate);
    }

    function tapSync() {
      if (!state.running) {
        return;
      }

      var inZone = state.pos >= state.zoneLeft && state.pos <= (state.zoneLeft + state.zoneWidth);
      if (inZone) {
        state.hits += 1;
        state.streak += 1;
        setText("syncMessage", "Clean sync. Streak x" + state.streak + ".");
        if (state.hits >= state.targetHits) {
          renderSyncStats();
          stopSync(true);
          return;
        }
        placeZone();
      } else {
        state.misses += 1;
        state.lives -= 1;
        state.streak = 0;
        setText("syncMessage", "Missed the zone. Breathe and catch the next pass.");
        if (state.lives <= 0) {
          renderSyncStats();
          stopSync(false);
          return;
        }
      }

      renderSyncStats();
    }

    function startSync() {
      state.running = true;
      state.hits = 0;
      state.misses = 0;
      state.streak = 0;
      state.lives = 4;
      state.targetHits = Number(qs("#syncTarget").value || 8);
      state.pos = 8;
      state.direction = 1;
      state.velocity = speedMap[qs("#syncDifficulty").value] || speedMap.normal;
      setText("syncMessage", "Rail active. Hit inside the zone.");
      setText("syncResultTitle", "Test running");
      setText("syncResultCopy", "Keep the rhythm steady.");
      placeZone();
      renderSyncStats();
      window.cancelAnimationFrame(state.frame);
      state.frame = window.requestAnimationFrame(animate);
    }

    qs("#syncStart").addEventListener("click", startSync);
    qs("#syncTap").addEventListener("click", tapSync);
    window.addEventListener("keydown", function (event) {
      if (body.getAttribute("data-nightverse-feature") !== "heartbeat-sync") {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        tapSync();
      }
    });

    renderSyncStats();
    placeZone();
    marker.style.left = "calc(" + state.pos + "% - 9px)";
  }

  function renderMidnightMission(feature) {
    return featureShell(feature, {
      controlsTitle: "Tune tonight's mission",
      controlsCopy: "Pick the mood, pressure, and wildcard so the dossier feels specific instead of random.",
      controlsHtml: [
        '<label class="nv-label">Mission mood<select class="nv-select" id="missionMood"><option value="soft">soft and devoted</option><option value="chaos">chaotic and funny</option><option value="brave">bold main-character</option><option value="dreamy">dreamy and cinematic</option></select></label>',
        '<label class="nv-label">Drama level<div class="nv-range-wrap"><input class="nv-range" id="missionDrama" type="range" min="1" max="10" value="6" /><span class="nv-range-readout" id="missionDramaValue"></span></div></label>',
        '<label class="nv-label">Wildcard<select class="nv-select" id="missionWildcard"><option value="weather">weather twist</option><option value="timing">timing stunt</option><option value="snack">snack operation</option><option value="confession">small confession</option></select></label>',
        '<button class="nv-button nv-button--primary" id="missionRun" type="button">Launch dossier</button>'
      ].join(""),
      stageTitle: "Mission board",
      stageCopy: "You get an urgency score, three objectives, and the kind of reward only a dark-side birthday portal would issue.",
      stageHtml: [
        '<div class="nv-mission-board">',
        '  <div class="nv-output"><strong id="missionTitle">Awaiting launch</strong><p id="missionNote" class="nv-empty">Press launch to reveal tonight\'s secret side quest.</p></div>',
        '  <div class="nv-meter"><div class="nv-meter__fill" id="missionMeter"></div></div>',
        '  <div class="nv-step-list" id="missionSteps"></div>',
        "</div>"
      ].join(""),
      footerHtml: [
        renderPanelHead("Bonus readout", "Reward and legend", "Every mission also comes with a final reward note and a little line to remember the run by."),
        '<div class="nv-output"><strong id="missionReward">Reward pending</strong><p id="missionWisdom" class="nv-empty">No legend written yet.</p></div>'
      ].join("")
    });
  }

  function initMidnightMission() {
    var moodPool = {
      soft: [
        "leave one tiny reassurance where it will be found later",
        "make one ordinary moment feel held instead of rushed",
        "turn one quiet check-in into the nicest part of the night",
        "collect one little detail worth remembering tomorrow"
      ],
      chaos: [
        "start one ridiculous inside joke and protect it like lore",
        "commit one harmless act of dramatic overreaction",
        "pull one silly move that somehow becomes adorable",
        "weaponize charm against boredom immediately"
      ],
      brave: [
        "say the sweeter truth before the brain edits it down",
        "pick the bold route instead of the safe little dodge",
        "make the first move on a moment worth keeping",
        "let confidence do the driving for one scene"
      ],
      dreamy: [
        "slow the night down until it looks cinematic",
        "find one view that feels like it belongs in a montage",
        "romanticize one detail nobody else would notice",
        "end the night with a line that echoes afterwards"
      ]
    };
    var wildcardPool = {
      weather: "Bonus twist: the weather suddenly feels like it picked your side.",
      timing: "Bonus twist: the exact right moment arrives ten minutes earlier than expected.",
      snack: "Bonus twist: a snack becomes emotionally important for no valid reason.",
      confession: "Bonus twist: one tiny confession changes the tone of the whole night."
    };
    var rewardPool = [
      "Reward unlocked: one heroic forehead-kiss voucher.",
      "Reward unlocked: premium cling rights for the rest of the night.",
      "Reward unlocked: a memory that will become suspiciously important later.",
      "Reward unlocked: a full legal excuse to act softer than usual."
    ];

    bindRange("missionDrama", "missionDramaValue", function (value) {
      return "Level " + value;
    });

    function runMission() {
      var mood = qs("#missionMood").value;
      var drama = Number(qs("#missionDrama").value || 6);
      var wildcard = qs("#missionWildcard").value;
      var urgency = clamp((drama * 9) + Math.floor(Math.random() * 18), 18, 98);
      var missionName = sample(["Operation Velvet", "Protocol Moonlit", "Side Quest Nova", "Project Soft Riot", "Task Midnight"]) + " " + sample(["Orbit", "Letter", "Echo", "Promise", "Glow"]);
      var steps = pick(moodPool[mood], 3).map(function (item, index) {
        return { title: "Objective " + (index + 1), body: item + "." };
      });

      setText("missionTitle", missionName);
      setText("missionNote", "Urgency " + urgency + "%. Primary mood locked to " + mood + ". " + wildcardPool[wildcard]);
      setWidth("missionMeter", urgency);
      renderBlocks("missionSteps", steps, "nv-dossier-step");
      setText("missionReward", sample(rewardPool));
      setText("missionWisdom", "Legend note: tonight counts more when you stop trying to make it perfect and let it feel alive.");
    }

    qs("#missionRun").addEventListener("click", runMission);
    runMission();
  }

  function renderParallelUniverse(feature) {
    return featureShell(feature, {
      controlsTitle: "Open the portal",
      controlsCopy: "Choose a world type and the relationship energy you want the portal to exaggerate.",
      controlsHtml: [
        '<label class="nv-label">Universe<select class="nv-select" id="parallelUniverse"><option value="retro">retro city</option><option value="arcade">arcade royalty</option><option value="space">space-station domestic</option><option value="rain">rain-soaked rooftop</option><option value="bookstore">goth bookstore</option></select></label>',
        '<div class="nv-label">Relationship energy<div class="nv-chipset" id="parallelEnergy"><button class="nv-chipbtn is-active" data-value="clingy" type="button">clingy</button><button class="nv-chipbtn" data-value="iconic" type="button">iconic</button><button class="nv-chipbtn" data-value="dangerous" type="button">dangerous</button></div></div>',
        '<button class="nv-button nv-button--primary" id="parallelRun" type="button">Open portal</button>'
      ].join(""),
      stageTitle: "Portal preview",
      stageCopy: "This world redraws the couple lore, the shared habit, and the rumor everyone else believes about you two.",
      stageHtml: [
        '<div class="nv-portal-orb"><strong id="parallelPortalLabel">Portal sleeping</strong></div>',
        '<div class="nv-output"><strong>Universe summary</strong><p id="parallelNarrative" class="nv-empty">Pick a world and open the portal.</p></div>',
        '<div class="nv-parallel-grid" id="parallelCards"></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("After-effect", "What follows you back", "A good portal does not just show a world. It leaks one little trait back into the real one."),
        '<div class="nv-output"><strong id="parallelAfter">Nothing leaked through yet</strong><p id="parallelAfterCopy" class="nv-empty">Open the portal to see what follows you home.</p></div>'
      ].join("")
    });
  }

  function initParallelUniverse() {
    var getEnergy = bindChipGroup("parallelEnergy");
    var universeNotes = {
      retro: "A neon city where every corner store knows your names and every night drive looks expensive on film.",
      arcade: "An impossible arcade where the machines all think you are the main event.",
      space: "A space station with one tiny kitchen, one impossible window, and two people making domestic life look illegal.",
      rain: "A rooftop world where every confession arrives damp, cinematic, and impossible to forget.",
      bookstore: "A velvet-dark bookstore where the tension lives between the fiction shelves and the poetry aisle."
    };
    var roles = {
      clingy: ["never quite leaves the other's orbit", "pretends to be cool and fails in under four seconds", "acts independent until eye contact happens"],
      iconic: ["runs the room without trying", "accidentally becomes local legend", "looks overqualified for this amount of chemistry"],
      dangerous: ["makes tenderness look like a threat", "has the kind of calm that ruins attention spans", "walks around like the soundtrack belongs to them"]
    };
    var leaks = {
      clingy: "Leak detected: extra softness around the edges and a worse ability to act normal.",
      iconic: "Leak detected: elevated confidence and a dangerous amount of effortless couple energy.",
      dangerous: "Leak detected: eyes lingering longer and the whole room acting weird about it."
    };

    function openPortal() {
      var universe = qs("#parallelUniverse").value;
      var energy = getEnergy();
      var cards = [
        { title: "Her role", body: "In this universe, she " + sample(roles[energy]) + "." },
        { title: "My role", body: "I spend half the plot trying to stay composed and the other half obviously failing." },
        { title: "Shared habit", body: sample(["always leaving one line unsaid on purpose", "taking the longest route back together", "turning every ordinary place into lore", "pretending the chemistry is not doing all the work"]) + "." },
        { title: "Public rumor", body: sample(["People assume you two are difficult. The truth is you are just attached.", "Everybody thinks the tension is fictional until they see the eye contact.", "The room quietly reorganizes around you whenever you arrive."]) }
      ];

      setText("parallelPortalLabel", universe.toUpperCase() + " portal live");
      setText("parallelNarrative", universeNotes[universe] + " Together, the energy reads " + energy + " in a way that makes everybody else look underwritten.");
      renderBlocks("parallelCards", cards, "nv-scene-card");
      setText("parallelAfter", leaks[energy]);
      setText("parallelAfterCopy", "Returned trait: " + sample(["better banter timing", "more eye-contact damage", "suspiciously cinematic timing", "a stronger pull toward late-night nonsense"]) + ".");
    }

    qs("#parallelRun").addEventListener("click", openPortal);
    openPortal();
  }

  function renderSoftRoast(feature) {
    return featureShell(feature, {
      controlsTitle: "Set the roasting conditions",
      controlsCopy: "The trick is balance: a little menace, a little worship, and immediate emotional cleanup.",
      controlsHtml: [
        '<label class="nv-label">Sweetness level<div class="nv-range-wrap"><input class="nv-range" id="roastSweetness" type="range" min="1" max="10" value="7" /><span class="nv-range-readout" id="roastSweetnessValue"></span></div></label>',
        '<label class="nv-label">Target mood<select class="nv-select" id="roastTarget"><option value="dramatic">dramatic</option><option value="clingy">clingy</option><option value="menace">cute menace</option><option value="sleepy">sleepy and dangerous</option></select></label>',
        '<button class="nv-button nv-button--primary" id="roastRun" type="button">Roast gently</button>'
      ].join(""),
      stageTitle: "Roast chamber",
      stageCopy: "The line lands first. The repair arrives immediately after. Nobody leaves actually wounded.",
      stageHtml: [
        '<div class="nv-meter"><div class="nv-meter__fill" id="roastMeter"></div></div>',
        '<div class="nv-output"><strong>Roast line</strong><p id="roastLine" class="nv-empty">The engine is warming up.</p></div>',
        '<div class="nv-output"><strong>Aftercare</strong><p id="roastRepair" class="nv-empty">No repair statement issued yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Collateral", "Three supporting burns", "Because one roast is never enough when the mood is right."),
        '<div class="nv-grid-3" id="roastExtras"></div>'
      ].join("")
    });
  }

  function initSoftRoast() {
    var roastLines = {
      dramatic: [
        "You treat every minor mood like it deserves interval music and a lighting crew.",
        "Your dramatic silence comes with better production value than most streaming shows.",
        "You can turn one look into a five-minute emotional event."
      ],
      clingy: [
        "You act like a menace but one warm hug would fully uninstall the attitude.",
        "Your independence lasts right up until affection becomes available.",
        "You are one text away from becoming premium cling software."
      ],
      menace: [
        "You bully lovingly like it is a regulated public service.",
        "Your smile says angel and your timing says professional chaos consultant.",
        "You start trouble with the confidence of somebody certain they will still get adored afterwards."
      ],
      sleepy: [
        "You get sleepier and somehow more manipulative at the same exact time.",
        "Half-awake you is still powerful enough to ruin my ability to behave normal.",
        "Your bedtime face should legally come with lower resistance from everybody nearby."
      ]
    };
    var repairs = [
      "This is not criticism. This is worship wearing sharper shoes.",
      "The roast stands, but so does the fact that you are wildly lovable.",
      "Unfortunately for me, this somehow makes you even more adorable.",
      "None of this reduces the obsession. It only makes it sillier."
    ];

    bindRange("roastSweetness", "roastSweetnessValue", function (value) {
      return "Sweetness " + value + "/10";
    });

    function runRoast() {
      var mood = qs("#roastTarget").value;
      var sweetness = Number(qs("#roastSweetness").value || 7);
      var heat = clamp(100 - (sweetness * 7), 16, 92);
      var extras = pick(roastLines[mood], 3).map(function (line, index) {
        return { title: "Support burn " + (index + 1), body: line };
      });

      setWidth("roastMeter", heat);
      setText("roastLine", sample(roastLines[mood]));
      setText("roastRepair", sample(repairs));
      renderBlocks("roastExtras", extras, "nv-scene-card");
    }

    qs("#roastRun").addEventListener("click", runRoast);
    runRoast();
  }

  function renderApartmentBuilder(feature) {
    return featureShell(feature, {
      controlsTitle: "Build the apartment mood",
      controlsCopy: "Pick the atmosphere and the page will sketch a little future home blueprint on the right.",
      controlsHtml: [
        '<label class="nv-label">Main vibe<select class="nv-select" id="aptVibe"><option value="soft">soft lamp cave</option><option value="glam">dark glamorous nest</option><option value="chaotic">beautiful chaos</option><option value="clean">clean and calm</option></select></label>',
        '<label class="nv-label">Window view<select class="nv-select" id="aptView"><option value="city">city lights</option><option value="rain">rain on glass</option><option value="ocean">night ocean</option><option value="hills">quiet hills</option></select></label>',
        '<label class="nv-label">Resident problem<select class="nv-select" id="aptPet"><option value="cat">cat takes over everything</option><option value="plants">too many dramatic plants</option><option value="blankets">blanket infestation</option><option value="snacks">snacks hidden in every drawer</option></select></label>',
        '<button class="nv-button nv-button--primary" id="aptRun" type="button">Build blueprint</button>'
      ].join(""),
      stageTitle: "Apartment blueprint",
      stageCopy: "This is not architecture. It is emotional real estate. Accuracy is not the point.",
      stageHtml: [
        '<div class="nv-blueprint" id="apartmentGrid"></div>',
        '<div class="nv-output"><strong>House motto</strong><p id="apartmentMotto" class="nv-empty">No blueprint generated yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("House rules", "What the apartment insists on", "The best made-up homes always come with weirdly specific policies."),
        '<div class="nv-room-notes" id="apartmentRules"></div>'
      ].join("")
    });
  }

  function initApartmentBuilder() {
    var vibes = {
      soft: ["reading nook", "lamp corner", "blanket crater", "quiet apology sofa"],
      glam: ["mirror zone", "dangerous jacket rail", "glass-shelf drama", "midnight bar cart"],
      chaotic: ["inside-joke wall", "emergency snack drawer", "music spill zone", "questionable art corner"],
      clean: ["calm tea ledge", "sunrise chair", "neat vinyl line", "floating shelves"]
    };
    var views = {
      city: "The windows make every ordinary night feel more expensive than it is.",
      rain: "The windows turn all arguments into scenes and all silences into poetry.",
      ocean: "The windows keep reminding the room to breathe a little slower.",
      hills: "The windows make everything feel private enough to tell the truth."
    };
    var issues = {
      cat: "One seat is never really ours because the cat has constitutional authority.",
      plants: "Every conversation pauses once to check whether a plant is being dramatic again.",
      blankets: "The blanket supply has evolved into weather of its own.",
      snacks: "You are never more than two steps away from a secret snack stash."
    };

    function buildApartment() {
      var vibe = qs("#aptVibe").value;
      var view = qs("#aptView").value;
      var pet = qs("#aptPet").value;
      var rooms = pick(vibes[vibe], 4).map(function (room, index) {
        return { title: "Room " + (index + 1), body: room };
      });
      var rules = [
        { title: "Rule 1", body: "Nobody pretends they do not want the longer hug." },
        { title: "Rule 2", body: views[view] },
        { title: "Rule 3", body: issues[pet] }
      ];

      renderBlocks("apartmentGrid", rooms, "nv-room");
      setText("apartmentMotto", "This place runs on slow evenings, mutual teasing, and the belief that good lighting can solve at least fourteen percent of all problems.");
      renderBlocks("apartmentRules", rules, "nv-output");
    }

    qs("#aptRun").addEventListener("click", buildApartment);
    buildApartment();
  }

  function renderNicknameForge(feature) {
    return featureShell(feature, {
      controlsTitle: "Spin the forge",
      controlsCopy: "Pick the tone and how many parts the name should have, then let the reels do something irresponsible.",
      controlsHtml: [
        '<label class="nv-label">Tone<select class="nv-select" id="nickTone"><option value="soft">soft</option><option value="royal">royal</option><option value="chaos">chaos</option><option value="cosmic">cosmic</option></select></label>',
        '<label class="nv-label">Name parts<select class="nv-select" id="nickCount"><option value="2">2 reels</option><option value="3" selected>3 reels</option></select></label>',
        '<button class="nv-button nv-button--primary" id="nickRun" type="button">Spin forge</button>'
      ].join(""),
      stageTitle: "Nickname machine",
      stageCopy: "This portal behaves like a slot machine made entirely out of devotion and poor restraint.",
      stageHtml: [
        '<div class="nv-slot-machine"><div class="nv-slot" id="slotOne">moon</div><div class="nv-slot" id="slotTwo">velvet</div><div class="nv-slot" id="slotThree">heart</div></div>',
        '<div class="nv-output"><strong>Primary result</strong><p id="nickResult" class="nv-empty">Spin the forge to reveal the first ridiculous result.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Alt drops", "Backup nicknames", "Because one nickname is never enough when the machine gets a good run."),
        '<div class="nv-grid-3" id="nickExtras"></div>'
      ].join("")
    });
  }

  function initNicknameForge() {
    var left = {
      soft: ["little", "honey", "dream", "soft", "velvet"],
      royal: ["queen", "crown", "velour", "majesty", "opal"],
      chaos: ["menace", "goblin", "gremlin", "riot", "trouble"],
      cosmic: ["nova", "lunar", "orbit", "comet", "starlit"]
    };
    var middle = {
      soft: ["glow", "smile", "pocket", "petal", "kiss"],
      royal: ["heir", "room", "velvet", "signal", "flare"],
      chaos: ["thief", "storm", "spark", "glitch", "noise"],
      cosmic: ["echo", "halo", "signal", "trail", "dust"]
    };
    var right = {
      soft: ["baby", "heart", "angel", "darling", "light"],
      royal: ["star", "duchess", "legend", "icon", "royal"],
      chaos: ["goblin", "problem", "riot", "hazard", "witch"],
      cosmic: ["comet", "orbit", "nova", "satellite", "moon"]
    };
    var spinning = false;

    function finalName(tone, count) {
      var pieces = [sample(left[tone]), sample(middle[tone]), sample(right[tone])];
      return count === 2 ? [pieces[0], pieces[2]] : pieces;
    }

    function spinForge() {
      if (spinning) {
        return;
      }

      var tone = qs("#nickTone").value;
      var count = Number(qs("#nickCount").value || 3);
      var reels = [qs("#slotOne"), qs("#slotTwo"), qs("#slotThree")];
      var timer = null;
      spinning = true;

      timer = window.setInterval(function () {
        reels[0].textContent = sample(left[tone]);
        reels[1].textContent = sample(middle[tone]);
        reels[2].textContent = sample(right[tone]);
      }, 90);

      window.setTimeout(function () {
        var pieces = finalName(tone, count);
        window.clearInterval(timer);
        reels[0].textContent = pieces[0];
        reels[1].textContent = count === 2 ? "-" : pieces[1];
        reels[2].textContent = pieces[count === 2 ? 1 : 2];
        setText("nickResult", pieces.filter(function (piece) {
          return piece !== "-";
        }).join(" "));
        renderBlocks("nickExtras", [1, 2, 3].map(function (index) {
          var alt = finalName(tone, count).filter(function (piece) {
            return piece !== "-";
          }).join(" ");
          return { title: "Alt " + index, body: alt };
        }), "nv-scene-card");
        spinning = false;
      }, 760);
    }

    qs("#nickRun").addEventListener("click", spinForge);
    spinForge();
  }

  function renderRescueKit(feature) {
    return featureShell(feature, {
      controlsTitle: "Assemble the rescue kit",
      controlsCopy: "Pick the mood and available battery so the page builds something that feels actually useful.",
      controlsHtml: [
        '<label class="nv-label">Mood state<select class="nv-select" id="rescueMood"><option value="overthinking">overthinking spiral</option><option value="tired">tired but pretending fine</option><option value="clingy">needs affection immediately</option><option value="angry">mad but still lovable</option></select></label>',
        '<label class="nv-label">Energy available<div class="nv-range-wrap"><input class="nv-range" id="rescueBattery" type="range" min="10" max="100" step="5" value="55" /><span class="nv-range-readout" id="rescueBatteryValue"></span></div></label>',
        '<button class="nv-button nv-button--primary" id="rescueRun" type="button">Assemble kit</button>'
      ].join(""),
      stageTitle: "Emergency layout",
      stageCopy: "The kit changes what it prioritizes depending on whether tonight needs calm, cling, distance, or a total reset.",
      stageHtml: [
        '<div class="nv-kit-grid" id="rescueItems"></div>',
        '<div class="nv-output"><strong>Usage plan</strong><p id="rescuePlan" class="nv-empty">No kit assembled yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Aftercare", "What happens after the first fix", "A rescue kit should stabilize the night first, then protect the rest of it."),
        '<div class="nv-output"><strong id="rescueAfterTitle">Aftercare pending</strong><p id="rescueAfterCopy" class="nv-empty">Assemble the kit to see the follow-through.</p></div>'
      ].join("")
    });
  }

  function initRescueKit() {
    var moodItems = {
      overthinking: ["water and one grounding sentence", "mute the fake scenarios", "do not answer every thought like it is a manager", "reduce the world to the next ten minutes"],
      tired: ["feed the body something easy", "drop unnecessary standards immediately", "become blanket-shaped", "stop performing okayness for nobody"],
      clingy: ["physical affection first", "soft voice second", "do not pretend to be chill", "let the need exist without shame"],
      angry: ["vent honestly before editing it down", "walk off the heat without rehearsing revenge", "return only when words can stay clean", "leave room for softness after truth"]
    };

    bindRange("rescueBattery", "rescueBatteryValue", function (value) {
      return value + "% battery";
    });

    function assemble() {
      var mood = qs("#rescueMood").value;
      var battery = Number(qs("#rescueBattery").value || 55);
      var selected = pick(moodItems[mood], 4).map(function (item, index) {
        return { title: "Kit item " + (index + 1), body: item + "." };
      });
      var mode = battery < 35 ? "low-energy rescue" : battery < 70 ? "balanced rescue" : "full-power rescue";

      renderBlocks("rescueItems", selected, "nv-kit-card");
      setText("rescuePlan", "Mode locked: " + mode + ". Start with the gentlest item, do not rush the fix, and only escalate the conversation after the body stops feeling like an emergency.");
      setText("rescueAfterTitle", "Aftercare note");
      setText("rescueAfterCopy", "Once the immediate wobble passes, the next move is simple: stay kind longer than the mood lasts.");
    }

    qs("#rescueRun").addEventListener("click", assemble);
    assemble();
  }

  function renderApologyArchitect(feature) {
    return featureShell(feature, {
      controlsTitle: "Feed the apology builder",
      controlsCopy: "Describe the mess, choose the tone, and decide how much action should follow the words.",
      controlsHtml: [
        '<label class="nv-label">What happened?<textarea class="nv-textarea" id="apologyStory" placeholder="Roughly describe the mess..."></textarea></label>',
        '<label class="nv-label">Tone<select class="nv-select" id="apologyTone"><option value="gentle">gentle</option><option value="direct">direct</option><option value="romantic">romantic but sincere</option></select></label>',
        '<label class="nv-label">Follow-through<select class="nv-select" id="apologyFollow"><option value="small">small practical fix</option><option value="medium">clear pattern change</option><option value="big">visible repair gesture</option></select></label>',
        '<button class="nv-button nv-button--primary" id="apologyRun" type="button">Draft repair</button>'
      ].join(""),
      stageTitle: "Repair architecture",
      stageCopy: "A real apology needs ownership, effect, repair, and a believable next step. The page builds all four.",
      stageHtml: [
        '<div class="nv-apology-grid" id="apologyCards"></div>',
        '<div class="nv-output"><strong>Summary line</strong><p id="apologySummary" class="nv-empty">No repair plan drafted yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Reminder", "What makes it land", "Tone matters, but the part people remember is whether the pattern changes afterwards."),
        '<div class="nv-output"><strong id="apologyTag">No tag yet</strong><p id="apologyTagCopy" class="nv-empty">Draft a repair plan to see the final note.</p></div>'
      ].join("")
    });
  }

  function initApologyArchitect() {
    var opening = {
      gentle: "I am not here to defend myself first.",
      direct: "I handled that badly and I am naming it cleanly.",
      romantic: "You mattered more than my ego in that moment and I did not act like it."
    };
    var followMap = {
      small: "Change one immediate habit and prove the fix quietly.",
      medium: "Name the pattern and interrupt it next time before it grows teeth.",
      big: "Pair the apology with a visible repair step so the words are not doing all the work alone."
    };

    function draft() {
      var story = qs("#apologyStory").value.trim() || "the unnamed nonsense";
      var tone = qs("#apologyTone").value;
      var follow = qs("#apologyFollow").value;
      var cards = [
        { title: "Opening", body: opening[tone] },
        { title: "Ownership", body: "For " + story + ", I own the choice without shrinking it or explaining it away." },
        { title: "Impact", body: "I care about the effect it had on you, not just the intention I wish had counted." },
        { title: "Follow-through", body: followMap[follow] }
      ];

      renderBlocks("apologyCards", cards, "nv-apology-card");
      setText("apologySummary", "Best version: say the clear truth, validate the effect, ask what would help now, then make the next moment look different.");
      setText("apologyTag", "Repair quality: believable");
      setText("apologyTagCopy", "The structure is strong when the words stay short and the changed behavior lasts longer than the guilt.");
    }

    qs("#apologyRun").addEventListener("click", draft);
    draft();
  }

  function renderProtectiveSpellbook(feature) {
    return featureShell(feature, {
      controlsTitle: "Choose the spell pieces",
      controlsCopy: "Pick a purpose and up to three runes so the sigil does not feel generic.",
      controlsHtml: [
        '<label class="nv-label">Spell purpose<select class="nv-select" id="spellPurpose"><option value="calm">calm day</option><option value="travel">safe travel</option><option value="confidence">confidence shield</option><option value="rest">restful night</option></select></label>',
        '<div class="nv-label">Runes<div class="nv-rune-pool" id="spellRunes"><button class="nv-rune-chip is-active" data-rune="veil" type="button">veil</button><button class="nv-rune-chip is-active" data-rune="glow" type="button">glow</button><button class="nv-rune-chip is-active" data-rune="anchor" type="button">anchor</button><button class="nv-rune-chip" data-rune="spark" type="button">spark</button><button class="nv-rune-chip" data-rune="gate" type="button">gate</button><button class="nv-rune-chip" data-rune="halo" type="button">halo</button></div></div>',
        '<button class="nv-button nv-button--primary" id="spellRun" type="button">Cast spell</button>'
      ].join(""),
      stageTitle: "Spell circle",
      stageCopy: "This is fake magic for emotional purposes only, but the page still gives it a proper circle and incantation.",
      stageHtml: [
        '<div class="nv-spell-circle"><div class="nv-spell-ring" id="spellRing"><div class="nv-spell-node">veil</div><div class="nv-spell-node">glow</div><div class="nv-spell-node">anchor</div></div></div>',
        '<div class="nv-output"><strong>Incantation</strong><p id="spellIncantation" class="nv-empty">Pick the runes and cast the spell.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Side effect", "What the spell protects", "The best part is not the magic. It is the very specific kind of reassurance attached to it."),
        '<div class="nv-output"><strong id="spellShield">Shield inactive</strong><p id="spellShieldCopy" class="nv-empty">Cast the spell to see the protective note.</p></div>'
      ].join("")
    });
  }

  function initProtectiveSpellbook() {
    var runeWrap = qs("#spellRunes");
    var purposes = {
      calm: "Let noise lower its voice before it reaches her.",
      travel: "Let every road curve kindly and every delay stay harmless.",
      confidence: "Let doubt arrive late and leave early.",
      rest: "Let the night make room for deep unguarded sleep."
    };

    runeWrap.addEventListener("click", function (event) {
      var chip = event.target.closest(".nv-rune-chip");
      if (!chip) {
        return;
      }

      var active = qsa(".nv-rune-chip.is-active", runeWrap);
      if (!chip.classList.contains("is-active") && active.length >= 3) {
        active[0].classList.remove("is-active");
      }

      chip.classList.toggle("is-active");

      if (!qsa(".nv-rune-chip.is-active", runeWrap).length) {
        chip.classList.add("is-active");
      }
    });

    function cast() {
      var chosen = qsa(".nv-rune-chip.is-active", runeWrap).map(function (chip) {
        return chip.getAttribute("data-rune");
      }).slice(0, 3);
      var purpose = qs("#spellPurpose").value;
      var ring = qs("#spellRing");

      ring.innerHTML = chosen.map(function (rune) {
        return '<div class="nv-spell-node">' + escapeHtml(rune) + "</div>";
      }).join("");
      setText("spellIncantation", chosen.join(", ") + ": " + purposes[purpose]);
      setText("spellShield", "Shield active");
      setText("spellShieldCopy", "Protected tonight from: petty vibes, unnecessary spirals, and anybody underestimating her glow.");
    }

    qs("#spellRun").addEventListener("click", cast);
    cast();
  }

  function renderJealousyAntidote(feature) {
    return featureShell(feature, {
      controlsTitle: "Reset the reassurance field",
      controlsCopy: "This one works like a tiny game: tap every anxious bubble and turn the screen back toward trust.",
      controlsHtml: [
        '<label class="nv-label">Trigger<select class="nv-select" id="antidoteReason"><option value="delay">reply delay</option><option value="overthink">overthinking spiral</option><option value="comparison">comparison attack</option><option value="distance">distance day</option></select></label>',
        '<button class="nv-button nv-button--primary" id="antidoteReset" type="button">Reset antidote</button>'
      ].join(""),
      stageTitle: "Thought field",
      stageCopy: "Each bubble you clear converts one insecure thought into a steadier one. Clear them all to finish the run.",
      stageHtml: [
        '<div class="nv-meter"><div class="nv-meter__fill" id="antidoteMeter"></div></div>',
        '<div class="nv-thought-field" id="thoughtField"></div>',
        '<div class="nv-output"><strong>Status</strong><p id="antidoteStatus" class="nv-empty">No antidote field active yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Final read", "What the page is actually saying", "Under the game layer, the point is simple: invented fear should not outrank proven care."),
        '<div class="nv-output"><strong id="antidoteFinal">Field waiting</strong><p id="antidoteFinalCopy" class="nv-empty">Clear the field to reveal the final reassurance.</p></div>'
      ].join("")
    });
  }

  function initJealousyAntidote() {
    var reasonMap = {
      delay: ["What if the silence means something bad?", "Maybe the vibe changed without warning.", "Maybe I am reading too much into too little.", "Maybe I care more than the other person.", "Maybe today means more than it should.", "Maybe distance is secretly a verdict."],
      overthink: ["My brain is writing scenes nobody filmed.", "I am treating fear like evidence.", "I am assuming the worst because it is loud.", "The fake version of the story is winning.", "I am forgetting what is already real.", "I am handing the microphone to doubt again."],
      comparison: ["What if somebody else is easier to love?", "What if I am being too much?", "What if I lose by overfeeling?", "What if I am not enough today?", "What if I am seeing everybody else too clearly and myself too harshly?", "What if confidence left the building?"],
      distance: ["The miles feel louder tonight.", "A screen is not enough right now.", "I miss the easy version of closeness.", "Distance makes the brain invent nonsense.", "I want proof, not only faith.", "I want nearness to stop feeling theoretical."]
    };
    var cleared = 0;
    var total = 0;

    function updateStatus() {
      var progress = total ? Math.round((cleared / total) * 100) : 0;
      setWidth("antidoteMeter", progress);
      setText("antidoteStatus", progress === 100 ? "Field cleared. Reassurance restored." : "Clear the bubbles. " + (total - cleared) + " anxious thoughts left.");
      if (progress === 100) {
        setText("antidoteFinal", "Final reassurance");
        setText("antidoteFinalCopy", "No invented scenario is stronger than the care already shown in real life.");
      }
    }

    function buildField() {
      var reason = qs("#antidoteReason").value;
      var field = qs("#thoughtField");
      cleared = 0;
      total = reasonMap[reason].length;
      field.innerHTML = reasonMap[reason].map(function (line) {
        return '<button class="nv-thought" type="button" data-cleared="false">' + escapeHtml(line) + "</button>";
      }).join("");

      qsa(".nv-thought", field).forEach(function (bubble) {
        bubble.addEventListener("click", function () {
          if (bubble.getAttribute("data-cleared") === "true") {
            return;
          }

          bubble.setAttribute("data-cleared", "true");
          bubble.classList.add("is-cleared");
          bubble.textContent = sample([
            "Real proof still matters more.",
            "You are loved in the actual timeline.",
            "The brain does not outrank the evidence.",
            "Let the fear shrink. Let the truth stay."
          ]);
          cleared += 1;
          updateStatus();
        });
      });

      setText("antidoteFinal", "Field waiting");
      setText("antidoteFinalCopy", "Clear the whole field to unlock the final line.");
      updateStatus();
    }

    qs("#antidoteReset").addEventListener("click", buildField);
    buildField();
  }

  function renderSleepCallScript(feature) {
    return featureShell(feature, {
      controlsTitle: "Write tonight's call",
      controlsCopy: "Pick the tone and how long the call should feel, then page through the script one beat at a time.",
      controlsHtml: [
        '<div class="nv-label">Call tone<div class="nv-chipset" id="sleepTone"><button class="nv-chipbtn is-active" data-value="soft" type="button">soft</button><button class="nv-chipbtn" data-value="silly" type="button">silly</button><button class="nv-chipbtn" data-value="dramatic" type="button">dramatic</button></div></div>',
        '<label class="nv-label">Bedtime length<div class="nv-range-wrap"><input class="nv-range" id="sleepMinutes" type="range" min="5" max="30" value="14" /><span class="nv-range-readout" id="sleepMinutesValue"></span></div></label>',
        '<button class="nv-button nv-button--primary" id="sleepRun" type="button">Write script</button>'
      ].join(""),
      stageTitle: "Teleprompter",
      stageCopy: "Generate the script, then tap through line by line instead of dumping the whole thing at once.",
      stageHtml: [
        '<div class="nv-teleprompter"><div class="nv-teleprompter__line" id="sleepLine">Generate the script to start the call.</div><div class="nv-output"><strong>Current beat</strong><p id="sleepBeat" class="nv-empty">0 / 0</p></div><button class="nv-button nv-button--secondary" id="sleepNext" type="button">Next line</button></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Closing line", "How the call should end", "A good bedtime call needs a landing, not just a fade-out."),
        '<div class="nv-output"><strong id="sleepClose">No closing line yet</strong><p id="sleepCloseCopy" class="nv-empty">Write the script first.</p></div>'
      ].join("")
    });
  }

  function initSleepCallScript() {
    var getTone = bindChipGroup("sleepTone");
    var scripts = {
      soft: [
        "Start by lowering the whole room with your voice.",
        "Ask for the real feeling, not the polite one.",
        "Remind her she does not have to finish the day strong to deserve rest.",
        "End with something simple and steady: sleep now, I am still here."
      ],
      silly: [
        "Open with one fake accusation that makes her laugh immediately.",
        "Drop one tiny joke before the softness gets suspicious.",
        "Sneak in the real affection while she is distracted by the nonsense.",
        "End with a ridiculous pet name and a very honest goodnight."
      ],
      dramatic: [
        "Begin like the final monologue of a movie nobody asked for.",
        "Confess one unnecessarily poetic truth about the day.",
        "Act offended by how adorable she is after midnight.",
        "Close with a line that sounds big but lands gentle."
      ]
    };
    var currentLines = [];
    var currentIndex = 0;

    bindRange("sleepMinutes", "sleepMinutesValue", function (value) {
      return value + " minute mood";
    });

    function syncLine() {
      if (!currentLines.length) {
        setText("sleepLine", "Generate the script to start the call.");
        setText("sleepBeat", "0 / 0");
        return;
      }

      setText("sleepLine", currentLines[currentIndex]);
      setText("sleepBeat", (currentIndex + 1) + " / " + currentLines.length);
    }

    function writeScript() {
      var tone = getTone() || "soft";
      var minutes = Number(qs("#sleepMinutes").value || 14);
      currentLines = scripts[tone].slice();
      if (minutes > 18) {
        currentLines.splice(2, 0, "Leave one little pause where she can answer honestly instead of performing okay.");
      }
      currentIndex = 0;
      syncLine();
      setText("sleepClose", sample([
        "Final line: sleep easy, the overthinking shift is over.",
        "Final line: the night can stand down now, I have you.",
        "Final line: no more proving anything today. Just rest."
      ]));
      setText("sleepCloseCopy", "Best closing energy: warm, unhurried, and not trying to do too much at the end.");
    }

    qs("#sleepRun").addEventListener("click", writeScript);
    qs("#sleepNext").addEventListener("click", function () {
      if (!currentLines.length) {
        return;
      }
      currentIndex = (currentIndex + 1) % currentLines.length;
      syncLine();
    });

    writeScript();
  }

  function renderNightDrivePlotter(feature) {
    return featureShell(feature, {
      controlsTitle: "Plot the drive",
      controlsCopy: "Choose the weather, conversation tempo, and destination type so the route looks like a real little night-scene.",
      controlsHtml: [
        '<label class="nv-label">Weather<select class="nv-select" id="driveWeather"><option value="rain">rain</option><option value="clear">clear sky</option><option value="fog">fog</option><option value="cold">cold breeze</option></select></label>',
        '<label class="nv-label">Tempo<select class="nv-select" id="driveTempo"><option value="slow">slow burn</option><option value="chaotic">chaotic gossip</option><option value="romantic">romantic maximum</option><option value="silent">comfortable silence</option></select></label>',
        '<label class="nv-label">Destination<select class="nv-select" id="driveDestination"><option value="tea">late tea stop</option><option value="lookout">city lookout</option><option value="bridge">quiet bridge</option><option value="coast">empty coast road</option></select></label>',
        '<button class="nv-button nv-button--primary" id="driveRun" type="button">Plot drive</button>'
      ].join(""),
      stageTitle: "Route board",
      stageCopy: "The board sketches four stops, the emotional temperature, and the final scene where the drive actually lands.",
      stageHtml: [
        '<div class="nv-route-strip"><div class="nv-route-list" id="driveStops"></div><div class="nv-output"><strong>Final scene</strong><p id="driveSummary" class="nv-empty">No route plotted yet.</p></div></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Dashboard", "How the ride feels", "A good drive is not only about where it goes. It is about the pressure and softness in the air."),
        '<div class="nv-grid-3" id="driveMetrics"></div>'
      ].join("")
    });
  }

  function initNightDrivePlotter() {
    var weatherCopy = {
      rain: "Everything on the windshield starts looking cinematic without permission.",
      clear: "The sky stays open enough to make every quiet moment feel deliberate.",
      fog: "The outside world blurs and the inside world gets louder.",
      cold: "The air feels sharp enough to keep the conversation honest."
    };
    var tempoCopy = {
      slow: "Nobody rushes the good parts of the conversation.",
      chaotic: "The gossip and exaggeration levels are fully irresponsible.",
      romantic: "Every pause feels loaded on purpose.",
      silent: "Nothing needs filling. That is what makes it good."
    };
    var destinationCopy = {
      tea: "You end with a warm drink and one line that would not have landed earlier.",
      lookout: "You park with the city under you and let the sky do some of the talking.",
      bridge: "You stop where the night sounds wider than the road.",
      coast: "You let the road run out into a view that feels bigger than the mood you started with."
    };

    function plot() {
      var weather = qs("#driveWeather").value;
      var tempo = qs("#driveTempo").value;
      var destination = qs("#driveDestination").value;
      var stops = [
        { title: "Start", body: sample(["Pick the longer road on purpose.", "Leave before the room can flatten the mood.", "Start with the windows cracked and the volume low."]) },
        { title: "Middle", body: weatherCopy[weather] },
        { title: "Turn", body: tempoCopy[tempo] },
        { title: "Arrival", body: destinationCopy[destination] }
      ];

      renderBlocks("driveStops", stops, "nv-route-stop");
      setText("driveSummary", "Route locked: " + weatherCopy[weather] + " " + tempoCopy[tempo] + " " + destinationCopy[destination]);
      renderBlocks("driveMetrics", [
        { title: "Road glow", body: sample(["high", "dangerously high", "soft but illegal-looking"]) },
        { title: "Talk density", body: sample(["confessional", "messy and honest", "half jokes, half truth"]) },
        { title: "Aftereffect", body: sample(["harder to stop thinking about", "somebody ends up smiling alone later", "the mood follows you home"]) }
      ], "nv-bar-card");
    }

    qs("#driveRun").addEventListener("click", plot);
    plot();
  }

  function renderTinyHeistPlanner(feature) {
    return featureShell(feature, {
      controlsTitle: "Plan the tiny heist",
      controlsCopy: "Choose the prize, your role, and how you escape. This is fake crime only and should remain fake crime.",
      controlsHtml: [
        '<label class="nv-label">Prize<select class="nv-select" id="heistPrize"><option value="moonlight">steal moonlight from a parking lot</option><option value="pastry">rescue the last good pastry</option><option value="boring">kidnap a boring evening</option><option value="photo">steal one perfect accidental photo</option></select></label>',
        '<label class="nv-label">Your role<select class="nv-select" id="heistRole"><option value="brains">the brains</option><option value="charm">the distraction</option><option value="driver">the getaway driver</option><option value="inside">the inside contact</option></select></label>',
        '<label class="nv-label">Escape<select class="nv-select" id="heistEscape"><option value="laughing">leave while laughing</option><option value="dramatic">disappear dramatically</option><option value="snacks">escape through the snack aisle</option><option value="music">vanish under loud music</option></select></label>',
        '<button class="nv-button nv-button--primary" id="heistRun" type="button">Plan heist</button>'
      ].join(""),
      stageTitle: "Heist dossier",
      stageCopy: "A proper dossier needs an operation name, a four-step plan, and one detail that makes it feel way more serious than it is.",
      stageHtml: [
        '<div class="nv-output"><strong id="heistCode">Operation pending</strong><p id="heistTag" class="nv-empty">No tiny crime drafted yet.</p></div>',
        '<div class="nv-grid-2" id="heistSteps"></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Exit note", "How the legend spreads", "Every heist needs a fake reputation afterwards or the effort means nothing."),
        '<div class="nv-output"><strong id="heistLegend">Legend dormant</strong><p id="heistLegendCopy" class="nv-empty">Plan the heist to reveal the rumor.</p></div>'
      ].join("")
    });
  }

  function initTinyHeistPlanner() {
    function planHeist() {
      var prize = qs("#heistPrize").value;
      var role = qs("#heistRole").value;
      var escape = qs("#heistEscape").value;
      var labels = {
        moonlight: "Operation Night Parking",
        pastry: "Operation Last Crumb",
        boring: "Operation Stolen Evening",
        photo: "Operation Perfect Blur"
      };
      var roleCopy = {
        brains: "You spend the first half making the plan look smarter than it needs to be.",
        charm: "You keep the situation smiling while the actual work happens behind the glow.",
        driver: "You make the exit look way calmer than it really is.",
        inside: "You already know exactly where the weak point in the scene is."
      };

      setText("heistCode", labels[prize]);
      setText("heistTag", roleCopy[role]);
      renderBlocks("heistSteps", [
        { title: "Step 1", body: "Scope the target and act like this is a normal amount of effort for something so small." },
        { title: "Step 2", body: roleCopy[role] },
        { title: "Step 3", body: "Secure the prize and immediately overestimate how iconic you look doing it." },
        { title: "Step 4", body: "Exit plan: " + escape + "." }
      ], "nv-dossier-step");
      setText("heistLegend", "Rumor created");
      setText("heistLegendCopy", "By tomorrow, the story becomes: somehow two extremely suspicious sweethearts got away with it again.");
    }

    qs("#heistRun").addEventListener("click", planHeist);
    planHeist();
  }

  function renderMovieTrailer(feature) {
    return featureShell(feature, {
      controlsTitle: "Build the trailer",
      controlsCopy: "Set the genre, scandal, and plot twist. The page does the poster, title card, and scene beats.",
      controlsHtml: [
        '<label class="nv-label">Genre<select class="nv-select" id="trailerGenre"><option value="romance">midnight romance</option><option value="comedy">chaotic comedy</option><option value="thriller">soft thriller</option><option value="sci-fi">future devotion sci-fi</option></select></label>',
        '<label class="nv-label">Scandal level<div class="nv-range-wrap"><input class="nv-range" id="trailerScandal" type="range" min="1" max="10" value="6" /><span class="nv-range-readout" id="trailerScandalValue"></span></div></label>',
        '<label class="nv-label">Twist<select class="nv-select" id="trailerTwist"><option value="rain">rain confession</option><option value="drive">late-night drive</option><option value="fight">almost-fight then softness</option><option value="future">future-plan reveal</option></select></label>',
        '<button class="nv-button nv-button--primary" id="trailerRun" type="button">Roll trailer</button>'
      ].join(""),
      stageTitle: "Poster wall",
      stageCopy: "This portal writes like an editor with absolutely no self-control and a soft spot for impossible chemistry.",
      stageHtml: [
        '<div class="nv-poster"><h3 id="trailerTitle">Untitled trailer</h3><p id="trailerTagline" class="nv-empty">No poster generated yet.</p></div>',
        '<div class="nv-poster-scenes" id="trailerScenes"></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Release note", "What critics say", "The critics are fake, biased, and fully invested."),
        '<div class="nv-output"><strong id="trailerReview">No review yet</strong><p id="trailerReviewCopy" class="nv-empty">Roll the trailer to see the critical overreaction.</p></div>'
      ].join("")
    });
  }

  function initMovieTrailer() {
    bindRange("trailerScandal", "trailerScandalValue", function (value) {
      return "Scandal " + value + "/10";
    });

    function rollTrailer() {
      var genre = qs("#trailerGenre").value;
      var scandal = Number(qs("#trailerScandal").value || 6);
      var twist = qs("#trailerTwist").value;
      var titles = {
        romance: "Stay Near The Exit",
        comedy: "Two Idiots, One Orbit",
        thriller: "Do Not Look Calm",
        "sci-fi": "Signal Me Back"
      };
      var twists = {
        rain: "The turning point arrives soaked, honest, and impossible to walk away from.",
        drive: "Everything changes on a road nobody was supposed to stay on this long.",
        fight: "The sharp scene breaks open and leaves tenderness underneath it.",
        future: "One casual sentence about the future accidentally becomes the whole plot."
      };

      setText("trailerTitle", titles[genre]);
      setText("trailerTagline", "Rated " + scandal + "/10 for dangerous eye contact, reckless softness, and one twist that should probably be illegal.");
      renderBlocks("trailerScenes", [
        { title: "Cold open", body: sample(["A bad joke lands too well.", "A glance does more than the dialogue.", "Nobody says the thing yet, which is exactly the problem."]) },
        { title: "Middle burn", body: twists[twist] },
        { title: "Final frame", body: sample(["The city goes quiet around them.", "The soundtrack cuts and the silence wins.", "The scene ends before the feeling does."]) }
      ], "nv-scene-card");
      setText("trailerReview", "Critics say: wildly overcommitted, suspiciously rewatchable.");
      setText("trailerReviewCopy", "Consensus: the chemistry carries the runtime so hard it should count as special effects.");
    }

    qs("#trailerRun").addEventListener("click", rollTrailer);
    rollTrailer();
  }

  function renderFutureTextThread(feature) {
    return featureShell(feature, {
      controlsTitle: "Load the future chat",
      controlsCopy: "Pick a year and a mood. The thread will type itself out like it leaked through time.",
      controlsHtml: [
        '<label class="nv-label">Year<select class="nv-select" id="threadYear"><option>2028</option><option>2031</option><option>2036</option><option>2042</option></select></label>',
        '<label class="nv-label">Mood<select class="nv-select" id="threadMood"><option value="domestic">domestic</option><option value="clingy">clingy</option><option value="chaotic">chaotic</option><option value="dreamy">dreamy</option></select></label>',
        '<button class="nv-button nv-button--primary" id="threadRun" type="button">Open thread</button>'
      ].join(""),
      stageTitle: "Future messages",
      stageCopy: "The messages appear in sequence so the page feels like a little scene instead of a static list.",
      stageHtml: [
        '<div class="nv-chat-thread" id="threadChat"></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Thread residue", "What the chat implies", "Future-us is not necessarily wiser. Just more comfortable saying what they mean."),
        '<div class="nv-output"><strong id="threadResidue">No residue yet</strong><p id="threadResidueCopy" class="nv-empty">Open the thread to read between the lines.</p></div>'
      ].join("")
    });
  }

  function initFutureTextThread() {
    var threadTimers = [];
    var moods = {
      domestic: [
        "Reached home? Also, did we ever buy the bigger blanket?",
        "Yes, and you still steal it like a professional.",
        "Good. I would be worried if you got less annoying in the future.",
        "Bad news: still obsessed. Worse news: now there are matching mugs."
      ],
      clingy: [
        "You said five minutes. It has been twenty-one.",
        "I know. I was staring at your old photos and acting ridiculous.",
        "So literally nothing has changed.",
        "Incorrect. The attachment is now better funded."
      ],
      chaotic: [
        "Reminder that the kitchen incident was not my fault.",
        "It was entirely your fault and somehow still iconic.",
        "You loved every second of that disaster.",
        "Yes, which is why the problem persists."
      ],
      dreamy: [
        "The city looked like our old drives tonight.",
        "Did it also make your chest feel weird in the same exact way?",
        "Of course. Apparently the future still has no cure for that.",
        "Good. I did not want one."
      ]
    };

    function clearTimers() {
      while (threadTimers.length) {
        window.clearTimeout(threadTimers.pop());
      }
    }

    function openThread() {
      var year = qs("#threadYear").value;
      var mood = qs("#threadMood").value;
      var chat = qs("#threadChat");
      clearTimers();
      chat.innerHTML = "";

      moods[mood].forEach(function (line, index) {
        threadTimers.push(window.setTimeout(function () {
          var bubble = document.createElement("div");
          bubble.className = "nv-chat-bubble " + (index % 2 ? "nv-chat-bubble--them" : "nv-chat-bubble--you");
          bubble.textContent = year + " // " + line;
          chat.appendChild(bubble);
        }, index * 320));
      });

      setText("threadResidue", "Thread implication");
      setText("threadResidueCopy", "Future us still acts unserious on the surface and deeply attached underneath it.");
    }

    qs("#threadRun").addEventListener("click", openThread);
    openThread();
  }

  function renderCuddleProtocol(feature) {
    return featureShell(feature, {
      controlsTitle: "Tune the cuddle protocol",
      controlsCopy: "Choose warmth, cling level, and soundtrack so the protocol can match the night instead of flattening it.",
      controlsHtml: [
        '<label class="nv-label">Warmth<div class="nv-range-wrap"><input class="nv-range" id="cuddleWarmth" type="range" min="1" max="10" value="8" /><span class="nv-range-readout" id="cuddleWarmthValue"></span></div></label>',
        '<div class="nv-label">Cling mode<div class="nv-chipset" id="cuddleCling"><button class="nv-chipbtn is-active" data-value="gentle" type="button">gentle</button><button class="nv-chipbtn" data-value="trapped" type="button">cannot escape</button><button class="nv-chipbtn" data-value="sleepy" type="button">sleepy nest</button></div></div>',
        '<label class="nv-label">Background<select class="nv-select" id="cuddleSound"><option value="quiet">quiet room</option><option value="rain">rain audio</option><option value="music">low playlist</option><option value="city">city hum</option></select></label>',
        '<button class="nv-button nv-button--primary" id="cuddleRun" type="button">Run protocol</button>'
      ].join(""),
      stageTitle: "Protocol bars",
      stageCopy: "This page maps the cuddle mood into three bars and a procedure instead of pretending all closeness feels the same.",
      stageHtml: [
        '<div class="nv-protocol-bars" id="cuddleBars"></div>',
        '<div class="nv-output"><strong>Procedure</strong><p id="cuddlePlan" class="nv-empty">Run the protocol to get tonight\'s setup.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Blanket law", "What the protocol insists on", "Every cuddle plan comes with one non-negotiable rule attached."),
        '<div class="nv-output"><strong id="cuddleRule">No blanket law yet</strong><p id="cuddleRuleCopy" class="nv-empty">Run the protocol first.</p></div>'
      ].join("")
    });
  }

  function initCuddleProtocol() {
    var getCling = bindChipGroup("cuddleCling");

    bindRange("cuddleWarmth", "cuddleWarmthValue", function (value) {
      return "Warmth " + value + "/10";
    });

    function runProtocol() {
      var warmth = Number(qs("#cuddleWarmth").value || 8);
      var cling = getCling() || "gentle";
      var sound = qs("#cuddleSound").value;
      var bars = [
        { title: "Closeness", body: "", width: clamp(warmth * 9, 20, 98) },
        { title: "Silence safety", body: "", width: sound === "quiet" ? 90 : sound === "rain" ? 82 : 68 },
        { title: "Release chance", body: "", width: cling === "trapped" ? 8 : cling === "sleepy" ? 18 : 36 }
      ];

      setHtml("cuddleBars", bars.map(function (bar) {
        return '<div class="nv-bar-card"><strong>' + escapeHtml(bar.title) + '</strong><div class="nv-bar"><span style="width:' + bar.width + '%;"></span></div></div>';
      }).join(""));
      setText("cuddlePlan", "Protocol result: " + sample([
        "start with one arm around the waist and do not overtalk the moment",
        "build the blanket nest first, then settle into the closest position that still feels easy",
        "use low-volume teasing for thirty seconds and then drop into the honest softness"
      ]) + ". Background set to " + sound + ".");
      setText("cuddleRule", "Blanket law");
      setText("cuddleRuleCopy", cling === "trapped" ? "If the cling mode is cannot escape, release is only allowed for snacks and hydration." : "The rule is simple: nobody acts cooler than they feel.");
    }

    qs("#cuddleRun").addEventListener("click", runProtocol);
    runProtocol();
  }

  function renderDreamDateBlueprint(feature) {
    return featureShell(feature, {
      controlsTitle: "Sketch the date",
      controlsCopy: "Choose the budget, vibe, and time window. The page will lay out a four-beat date arc.",
      controlsHtml: [
        '<label class="nv-label">Budget<select class="nv-select" id="dateBudget"><option value="tiny">tiny but sweet</option><option value="mid">mid-level effort</option><option value="extra">extra and cinematic</option></select></label>',
        '<label class="nv-label">Vibe<select class="nv-select" id="dateVibe"><option value="bookish">bookish</option><option value="city">city lights</option><option value="chaos">chaotic cute</option><option value="slow">slow and intimate</option></select></label>',
        '<label class="nv-label">Start time<select class="nv-select" id="dateTime"><option value="afternoon">late afternoon</option><option value="sunset">sunset</option><option value="night">night</option></select></label>',
        '<button class="nv-button nv-button--primary" id="dateRun" type="button">Sketch date</button>'
      ].join(""),
      stageTitle: "Date blueprint",
      stageCopy: "Instead of one generic suggestion, this portal builds a sequence with opening scene, turn, peak, and landing.",
      stageHtml: [
        '<div class="nv-timeline" id="dateTimeline"></div>',
        '<div class="nv-output"><strong>Blueprint note</strong><p id="dateSummary" class="nv-empty">No date blueprint yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Afterglow", "What the date leaves behind", "The best dates shift the mood afterwards, not only while they are happening."),
        '<div class="nv-output"><strong id="dateAfter">No afterglow yet</strong><p id="dateAfterCopy" class="nv-empty">Sketch the date first.</p></div>'
      ].join("")
    });
  }

  function initDreamDateBlueprint() {
    var openings = {
      bookish: "Start somewhere quiet enough to make the first eye contact do half the work.",
      city: "Meet where the lights already make everybody look slightly more cinematic.",
      chaos: "Open with something playful enough to wreck all attempts at acting normal.",
      slow: "Start in a place where nobody feels rushed into performing."
    };
    var peaks = {
      tiny: "Peak moment arrives through timing, not spending.",
      mid: "Peak moment gets one intentional detail that proves effort without trying too hard.",
      extra: "Peak moment absolutely knows it is a scene and does not apologize for it."
    };

    function sketch() {
      var budget = qs("#dateBudget").value;
      var vibe = qs("#dateVibe").value;
      var time = qs("#dateTime").value;
      var beats = [
        { title: "Open", body: openings[vibe] },
        { title: "Move", body: sample(["Take a walk longer than necessary.", "Switch locations before the mood settles too flat.", "Leave room for one surprise stop."]) },
        { title: "Peak", body: peaks[budget] },
        { title: "Land", body: "End at " + time + " with one conversation that would not have happened at the start." }
      ];

      renderBlocks("dateTimeline", beats, "nv-scene-card");
      setText("dateSummary", "Blueprint locked: " + openings[vibe] + " " + peaks[budget]);
      setText("dateAfter", "Afterglow forecast");
      setText("dateAfterCopy", "Expected result: one memory that keeps replaying later for annoying reasons.");
    }

    qs("#dateRun").addEventListener("click", sketch);
    sketch();
  }

  function renderPromiseContract(feature) {
    return featureShell(feature, {
      controlsTitle: "Draft the contract",
      controlsCopy: "Names go in, promise style goes in, and the page stamps the result with a ridiculous seal.",
      controlsHtml: [
        '<div class="nv-grid-2"><label class="nv-label">Name one<input class="nv-input" id="contractNameA" value="Bangari" /></label><label class="nv-label">Name two<input class="nv-input" id="contractNameB" value="Minku" /></label></div>',
        '<div class="nv-label">Promise style<div class="nv-chipset" id="contractType"><button class="nv-chipbtn is-active" data-value="loyal" type="button">loyal</button><button class="nv-chipbtn" data-value="chaotic" type="button">chaotic</button><button class="nv-chipbtn" data-value="soft" type="button">soft</button></div></div>',
        '<label class="nv-label">Signature mood<select class="nv-select" id="contractSealMood"><option value="gold">gold seal</option><option value="blue">blue seal</option><option value="pink">pink seal</option></select></label>',
        '<button class="nv-button nv-button--primary" id="contractRun" type="button">Draft contract</button>'
      ].join(""),
      stageTitle: "Contract sheet",
      stageCopy: "It is legally nonsense but aesthetically serious, which is exactly the right balance for this portal.",
      stageHtml: [
        '<div class="nv-contract-sheet"><div class="nv-output"><strong id="contractTitle">Midnight contract pending</strong><p id="contractBody" class="nv-empty">Draft the contract to fill the sheet.</p></div><div class="nv-grid-2" id="contractClauses"></div><div class="nv-contract-seal" id="contractSeal">seal</div></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Archive", "What gets remembered", "The best promise is not the fancy wording. It is the pattern it locks in afterwards."),
        '<div class="nv-output"><strong id="contractArchive">No archive note yet</strong><p id="contractArchiveCopy" class="nv-empty">Draft the contract first.</p></div>'
      ].join("")
    });
  }

  function initPromiseContract() {
    var getType = bindChipGroup("contractType");
    var storageKey = "bangari_twinverse_contract";

    function draft() {
      var a = (qs("#contractNameA").value || "Bangari").trim() || "Bangari";
      var b = (qs("#contractNameB").value || "Minku").trim() || "Minku";
      var type = getType() || "loyal";
      var mood = qs("#contractSealMood").value;
      var copy = {
        loyal: "agree to stay offensively honest, emotionally reachable, and impossible to shake loose when it matters.",
        chaotic: "agree to keep the jokes sharp, the devotion obvious, and the nonsense well-funded.",
        soft: "agree to handle each other with warmth, patience, and a criminal amount of gentleness."
      };
      var sealText = mood === "gold" ? "gold seal" : mood === "blue" ? "blue seal" : "pink seal";

      setText("contractTitle", "Midnight Contract No. 25");
      setText("contractBody", a + " and " + b + " " + copy[type]);
      renderBlocks("contractClauses", [
        { title: "Clause 1", body: "No pretending not to care when the evidence says otherwise." },
        { title: "Clause 2", body: "Snacks, softness, and repair attempts must remain fully accessible." },
        { title: "Clause 3", body: "Sarcasm is allowed only when affection is still obvious underneath it." },
        { title: "Clause 4", body: "In the event of unnecessary overthinking, closeness shall be restored promptly." }
      ], "nv-scene-card");
      setText("contractSeal", sealText);
      setText("contractArchive", "Archive note filed");
      setText("contractArchiveCopy", "This contract reads unserious, but the loyalty in it does not.");
      writeJson(storageKey, { a: a, b: b, type: type, mood: mood });
    }

    var saved = readJson(storageKey, null);
    if (saved) {
      qs("#contractNameA").value = saved.a;
      qs("#contractNameB").value = saved.b;
      qs("#contractSealMood").value = saved.mood;
      qsa(".nv-chipbtn", qs("#contractType")).forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-value") === saved.type);
      });
    }

    qs("#contractRun").addEventListener("click", draft);
    draft();
  }

  function renderWishVault(feature) {
    return featureShell(feature, {
      controlsTitle: "Store the wishes",
      controlsCopy: "This page remembers the wishes between visits, so it works more like a proper vault than a one-time generator.",
      controlsHtml: [
        '<label class="nv-label">Wish text<textarea class="nv-textarea" id="wishText" placeholder="Write a tiny wish..."></textarea></label>',
        '<label class="nv-label">Wish flavor<select class="nv-select" id="wishType"><option value="soft">soft</option><option value="wild">wild</option><option value="future">future</option><option value="tiny">tiny and specific</option></select></label>',
        '<div class="nv-grid-2"><button class="nv-button nv-button--primary" id="wishAdd" type="button">Store wish</button><button class="nv-button nv-button--secondary" id="wishSeed" type="button">Add surprise wish</button></div>'
      ].join(""),
      stageTitle: "Vault interior",
      stageCopy: "The vault keeps the newest wishes visible and lets the page feel more alive over repeat visits.",
      stageHtml: [
        '<div class="nv-vault-grid" id="wishGrid"></div>',
        '<div class="nv-output"><strong>Vault status</strong><p id="wishSummary" class="nv-empty">Nothing stored yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Why it works", "Persistent little hope machine", "The point is not scale. It is that the page remembers the small wants instead of discarding them."),
        '<div class="nv-output"><strong id="wishCountLabel">0 wishes held</strong><p id="wishCountCopy" class="nv-empty">Store one to start the vault.</p></div>'
      ].join("")
    });
  }

  function initWishVault() {
    var vaultKey = "bangari_twinverse_wishes";
    var surprise = {
      soft: ["one unhurried evening that feels longer than it should", "a hug that resets the whole mood", "one honest conversation that lands gently"],
      wild: ["one spontaneous night drive to nowhere useful", "an absurd photo booth sequence", "a memory messy enough to become lore"],
      future: ["a future drawer full of tiny notes", "a kitchen full of midnight snacks", "one place that starts to feel like ours"],
      tiny: ["a perfect cup of chai at the right time", "one text that lands exactly when needed", "an extra minute before goodbye"]
    };

    function renderVault() {
      var wishes = readJson(vaultKey, []);
      if (!wishes.length) {
        setHtml("wishGrid", '<div class="nv-vault-item"><strong>Empty vault</strong><p class="nv-empty">Store the first wish to light this room up.</p></div>');
      } else {
        setHtml("wishGrid", wishes.slice().reverse().map(function (wish) {
          return '<div class="nv-vault-item"><strong>' + escapeHtml(wish.type) + '</strong><p>' + escapeHtml(wish.text) + '</p></div>';
        }).join(""));
      }

      setText("wishSummary", wishes.length ? "Newest wish stored. The vault remembers " + wishes.length + " little wants right now." : "Nothing stored yet.");
      setText("wishCountLabel", wishes.length + " wishes held");
      setText("wishCountCopy", wishes.length ? "The vault keeps the last twelve so it stays light and replayable." : "Store one to start the vault.");
    }

    function store(text, type) {
      var wishes = readJson(vaultKey, []);
      wishes.push({ text: text, type: type });
      writeJson(vaultKey, wishes.slice(-12));
      renderVault();
    }

    qs("#wishAdd").addEventListener("click", function () {
      var text = qs("#wishText").value.trim();
      var type = qs("#wishType").value;
      if (!text) {
        return;
      }
      store(text, type);
      qs("#wishText").value = "";
    });

    qs("#wishSeed").addEventListener("click", function () {
      var type = qs("#wishType").value;
      store(sample(surprise[type]), type);
    });

    renderVault();
  }

  function renderFutureClosetDrop(feature) {
    return featureShell(feature, {
      controlsTitle: "Style the look",
      controlsCopy: "Pick the silhouette, accessory, and overall energy. The mannequin updates immediately with each new build.",
      controlsHtml: [
        '<label class="nv-label">Silhouette<select class="nv-select" id="lookShape"><option value="sharp">sharp jacket fit</option><option value="soft">soft oversized fit</option><option value="sleek">sleek evening fit</option><option value="chaos">chaotic layers</option></select></label>',
        '<label class="nv-label">Accessory<select class="nv-select" id="lookAccessory"><option value="silver">silver hoops</option><option value="scarf">danger scarf</option><option value="boots">killer boots</option><option value="chain">tiny chain detail</option></select></label>',
        '<label class="nv-label">Energy<select class="nv-select" id="lookEnergy"><option value="midnight">midnight blue</option><option value="rose">dark rose</option><option value="ice">electric ice</option><option value="gold">soft gold</option></select></label>',
        '<button class="nv-button nv-button--primary" id="lookRun" type="button">Style look</button>'
      ].join(""),
      stageTitle: "Closet drop stage",
      stageCopy: "This portal treats style like a power-up and turns it into a mannequin plus a short read on the outfit energy.",
      stageHtml: [
        '<div class="nv-mannequin-stage"><div class="nv-mannequin" id="lookMannequin"><div class="nv-mannequin__head"></div><div class="nv-mannequin__body"></div><div class="nv-mannequin__legs"></div><div class="nv-mannequin__shoes"></div><div class="nv-mannequin__accessory"></div></div><div class="nv-output"><strong>Look note</strong><p id="lookSummary" class="nv-empty">Style the first look.</p></div></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Readout", "Why the look wins", "Outfits in this portal are part fashion, part aura weapon."),
        '<div class="nv-grid-3" id="lookReasons"></div>'
      ].join("")
    });
  }

  function initFutureClosetDrop() {
    var palettes = {
      midnight: { head: "linear-gradient(135deg, #eef5ff, #88c7ff)", body: "linear-gradient(160deg, #10356e, #2f8cff)", legs: "linear-gradient(160deg, #131a2f, #23365a)", shoes: "linear-gradient(160deg, #0c111a, #243047)", accent: "linear-gradient(90deg, #8ce7ff, #d8f0ff)" },
      rose: { head: "linear-gradient(135deg, #ffe7f3, #ffb6d7)", body: "linear-gradient(160deg, #5b153e, #b43e7a)", legs: "linear-gradient(160deg, #341425, #5a2340)", shoes: "linear-gradient(160deg, #1a0f16, #362332)", accent: "linear-gradient(90deg, #ff8fd3, #ffd6ea)" },
      ice: { head: "linear-gradient(135deg, #f2fbff, #baf0ff)", body: "linear-gradient(160deg, #17545f, #58d3ff)", legs: "linear-gradient(160deg, #14343a, #236474)", shoes: "linear-gradient(160deg, #0f1f24, #24424a)", accent: "linear-gradient(90deg, #8ce7ff, #88ffc9)" },
      gold: { head: "linear-gradient(135deg, #fff8e9, #ffd899)", body: "linear-gradient(160deg, #7c4e10, #e3a93f)", legs: "linear-gradient(160deg, #3b2710, #6f4c1e)", shoes: "linear-gradient(160deg, #1f160d, #433119)", accent: "linear-gradient(90deg, #ffe18c, #ffbb69)" }
    };

    function styleLook() {
      var shape = qs("#lookShape").value;
      var accessory = qs("#lookAccessory").value;
      var energy = qs("#lookEnergy").value;
      var mannequin = qs("#lookMannequin");
      var palette = palettes[energy];

      mannequin.style.setProperty("--look-head", palette.head);
      mannequin.style.setProperty("--look-body", palette.body);
      mannequin.style.setProperty("--look-legs", palette.legs);
      mannequin.style.setProperty("--look-shoes", palette.shoes);
      mannequin.style.setProperty("--look-accent", palette.accent);
      setText("lookSummary", "Look built: " + shape + " silhouette, " + accessory + ", " + energy + " energy. Translation: attention span damage.");
      renderBlocks("lookReasons", [
        { title: "Shape", body: shape + " makes the whole look feel intentional instead of safe." },
        { title: "Accessory", body: accessory + " is doing the final little bit of violence here." },
        { title: "Energy", body: energy + " keeps the palette pretty without losing the edge." }
      ], "nv-scene-card");
    }

    qs("#lookRun").addEventListener("click", styleLook);
    styleLook();
  }

  function renderJointBucketShock(feature) {
    return featureShell(feature, {
      controlsTitle: "Draw the someday shock",
      controlsCopy: "Set the chaos level and budget range, then draw one future plan that would make a good story later.",
      controlsHtml: [
        '<label class="nv-label">Chaos scale<select class="nv-select" id="shockChaos"><option value="mild">mild</option><option value="fun">fun reckless</option><option value="wild">wild idea</option></select></label>',
        '<label class="nv-label">Budget<select class="nv-select" id="shockBudget"><option value="tiny">tiny</option><option value="planned">planned</option><option value="big">big someday</option></select></label>',
        '<div class="nv-label">Courage<div class="nv-chipset" id="shockCourage"><button class="nv-chipbtn is-active" data-value="borrowed" type="button">borrowed</button><button class="nv-chipbtn" data-value="real" type="button">real</button><button class="nv-chipbtn" data-value="delusional" type="button">delusional</button></div></div>',
        '<button class="nv-button nv-button--primary" id="shockRun" type="button">Draw shock</button>'
      ].join(""),
      stageTitle: "Bucket shock card",
      stageCopy: "This one is built like a draw deck: one plan, one cost range, one danger meter, and one reason it would be worth it.",
      stageHtml: [
        '<div class="nv-shock-card"><h3 id="shockTitle">No shock drawn</h3><p id="shockBody" class="nv-empty">Draw the card to reveal the next someday plan.</p><div class="nv-meter"><div class="nv-meter__fill" id="shockMeter"></div></div></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Worth it?", "Why this one survives the cut", "A good bucket item is half logistics, half emotional argument."),
        '<div class="nv-output"><strong id="shockReason">No reason yet</strong><p id="shockReasonCopy" class="nv-empty">Draw a card first.</p></div>'
      ].join("")
    });
  }

  function initJointBucketShock() {
    var getCourage = bindChipGroup("shockCourage");
    var ideas = {
      mild: ["Take a random train for one evening and get off where the lights look promising.", "Build a ridiculous memory box out of receipts, notes, and tiny stolen moments.", "Map a city only through places that accidentally became lore."],
      fun: ["Do a full late-night photo mission with rules nobody else would understand.", "Invent a couple-only festival day and commit to the whole bit.", "Take the longest route home for no practical reason except the mood."],
      wild: ["Book one impulsive stay somewhere pretty and make the whole thing look like a movie scene.", "Pull off a full surprise plan with only a vague map and dangerous confidence.", "Pick a city quarter you do not know and let the night rewrite the plan as it goes."]
    };

    function drawShock() {
      var chaos = qs("#shockChaos").value;
      var budget = qs("#shockBudget").value;
      var courage = getCourage() || "borrowed";
      var idea = sample(ideas[chaos]);
      var danger = chaos === "wild" ? 90 : chaos === "fun" ? 68 : 42;
      var budgetText = budget === "tiny" ? "low-cost" : budget === "planned" ? "planned-cost" : "someday-big";

      setText("shockTitle", idea);
      setText("shockBody", "Budget profile: " + budgetText + ". Courage status: " + courage + ".");
      setWidth("shockMeter", danger);
      setText("shockReason", "Why it wins");
      setText("shockReasonCopy", "Because the story afterwards would keep feeding the relationship for months.");
    }

    qs("#shockRun").addEventListener("click", drawShock);
    drawShock();
  }

  function renderSoulSignalMeter(feature) {
    return featureShell(feature, {
      controlsTitle: "Run the scan",
      controlsCopy: "Choose the signal source and honesty level. The radar will fake some science and give you a biased reading.",
      controlsHtml: [
        '<label class="nv-label">Signal source<select class="nv-select" id="signalSource"><option value="eyes">eye contact</option><option value="voice">voice</option><option value="hug">hug pressure</option><option value="text">text energy</option></select></label>',
        '<label class="nv-label">Honesty level<div class="nv-range-wrap"><input class="nv-range" id="signalHonesty" type="range" min="1" max="10" value="7" /><span class="nv-range-readout" id="signalHonestyValue"></span></div></label>',
        '<button class="nv-button nv-button--primary" id="signalRun" type="button">Scan signal</button>'
      ].join(""),
      stageTitle: "Radar display",
      stageCopy: "The scan updates the pings, the meter cards, and the main diagnosis all at once so it feels more like a dashboard than a quote.",
      stageHtml: [
        '<div class="nv-radar"><div class="nv-radar__grid"></div><div class="nv-radar__sweep"></div><div class="nv-radar__core"></div><div class="nv-radar__ping" id="signalPingOne"></div><div class="nv-radar__ping" id="signalPingTwo"></div><div class="nv-radar__ping" id="signalPingThree"></div></div>',
        '<div class="nv-grid-3" id="signalStats"></div>',
        '<div class="nv-output"><strong>Diagnosis</strong><p id="signalDiagnosis" class="nv-empty">No scan run yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Bias note", "Why the scanner cheats", "The machine is incapable of giving a cold reading. It likes her too much."),
        '<div class="nv-output"><strong id="signalBias">Bias not measured</strong><p id="signalBiasCopy" class="nv-empty">Run the scan to reveal the bias.</p></div>'
      ].join("")
    });
  }

  function initSoulSignalMeter() {
    bindRange("signalHonesty", "signalHonestyValue", function (value) {
      return "Honesty " + value + "/10";
    });

    function ping(id) {
      var node = qs("#" + id);
      node.style.left = (18 + Math.random() * 64) + "%";
      node.style.top = (18 + Math.random() * 64) + "%";
    }

    function scan() {
      var source = qs("#signalSource").value;
      var honesty = Number(qs("#signalHonesty").value || 7);
      var signal = clamp((honesty * 8) + Math.floor(Math.random() * 22), 22, 99);

      ping("signalPingOne");
      ping("signalPingTwo");
      ping("signalPingThree");
      renderBlocks("signalStats", [
        { title: "Attachment", body: signal + "% stable" },
        { title: "Composure", body: Math.max(8, 90 - signal) + "% remaining" },
        { title: "Source", body: source + " triggered the strongest reading" }
      ], "nv-bar-card");
      setText("signalDiagnosis", "Scanner result: signal locked at " + signal + "%. Clinical note: one affectionate look from the correct person still overrides normal system behavior.");
      setText("signalBias", "Bias level: extreme");
      setText("signalBiasCopy", "The dashboard admits its data quality is compromised by personal attachment.");
    }

    qs("#signalRun").addEventListener("click", scan);
    scan();
  }

  function renderComfortMap(feature) {
    return featureShell(feature, {
      controlsTitle: "Draw the route",
      controlsCopy: "Choose the kind of comfort needed and how much time the route is allowed to take.",
      controlsHtml: [
        '<label class="nv-label">Need<select class="nv-select" id="mapNeed"><option value="quiet">quiet comfort</option><option value="clingy">clingy comfort</option><option value="pep">pep talk</option><option value="distraction">distraction route</option></select></label>',
        '<label class="nv-label">Time<select class="nv-select" id="mapTime"><option value="short">10 minutes</option><option value="medium">30 minutes</option><option value="long">as long as it takes</option></select></label>',
        '<button class="nv-button nv-button--primary" id="mapRun" type="button">Draw route</button>'
      ].join(""),
      stageTitle: "Comfort nodes",
      stageCopy: "Each node in the map is clickable, so the route plays more like a little sequence than a fixed paragraph.",
      stageHtml: [
        '<div class="nv-map-grid" id="comfortNodes"></div>',
        '<div class="nv-node-detail" id="comfortDetail">Draw the route and then tap a node to inspect it.</div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Route result", "What this map protects", "A good comfort map tells you the order in which softness should happen."),
        '<div class="nv-output"><strong id="comfortResult">No route yet</strong><p id="comfortResultCopy" class="nv-empty">Draw the route to see the summary.</p></div>'
      ].join("")
    });
  }

  function initComfortMap() {
    var routeMap = {
      quiet: ["dim the room", "sit nearby", "offer water", "speak when the chest loosens"],
      clingy: ["open arms immediately", "hold steady", "say the obvious reassurance", "stay past the first sigh"],
      pep: ["make eye contact", "say the clear truth", "remind her who she is", "send her back stronger"],
      distraction: ["drop one funny thing", "change the angle", "bring in a tiny game", "return to softness after the laugh"]
    };

    function drawMap() {
      var need = qs("#mapNeed").value;
      var time = qs("#mapTime").value;
      var nodes = routeMap[need].map(function (step, index) {
        return { title: "Node " + (index + 1), body: step };
      });
      var wrap = qs("#comfortNodes");

      wrap.innerHTML = nodes.map(function (node, index) {
        return '<button class="nv-map-node' + (index === 0 ? " is-active" : "") + '" data-detail="' + escapeHtml(node.body) + '" type="button"><strong>' + escapeHtml(node.title) + '</strong><p>' + escapeHtml(node.body) + '</p></button>';
      }).join("");

      qsa(".nv-map-node", wrap).forEach(function (node) {
        node.addEventListener("click", function () {
          qsa(".nv-map-node", wrap).forEach(function (item) {
            item.classList.remove("is-active");
          });
          node.classList.add("is-active");
          setText("comfortDetail", node.getAttribute("data-detail"));
        });
      });

      setText("comfortDetail", nodes[0].body);
      setText("comfortResult", "Route drawn for " + need + " comfort.");
      setText("comfortResultCopy", "Time profile: " + time + ". The route matters because the right comfort delivered in the wrong order can still miss.");
    }

    qs("#mapRun").addEventListener("click", drawMap);
    drawMap();
  }

  function renderMemoryRemixMachine(feature) {
    return featureShell(feature, {
      controlsTitle: "Feed the memory",
      controlsCopy: "Give the page an ordinary memory and a genre. It will turn it into a three-scene dramatic remix.",
      controlsHtml: [
        '<label class="nv-label">Memory<textarea class="nv-textarea" id="memoryInput" placeholder="Type one ordinary memory..."></textarea></label>',
        '<label class="nv-label">Genre<select class="nv-select" id="memoryGenre"><option value="romance">romance</option><option value="comedy">comedy</option><option value="melancholy">melancholy glow</option><option value="epic">epic tiny moment</option></select></label>',
        '<button class="nv-button nv-button--primary" id="memoryRun" type="button">Remix memory</button>'
      ].join(""),
      stageTitle: "Storyboard wall",
      stageCopy: "The machine keeps the original memory but changes the framing, scale, and soundtrack around it.",
      stageHtml: [
        '<div class="nv-storyboard" id="memoryFrames"></div>',
        '<div class="nv-output"><strong>Voiceover</strong><p id="memoryVoice" class="nv-empty">No memory remixed yet.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Machine logic", "Why it always gets dramatic", "The remix engine has no concept of chill. It only understands emotional scale."),
        '<div class="nv-output"><strong id="memoryLogic">Logic not loaded</strong><p id="memoryLogicCopy" class="nv-empty">Remix something to reveal the machine note.</p></div>'
      ].join("")
    });
  }

  function initMemoryRemixMachine() {
    var genreCopy = {
      romance: "The scene gets warmer, slower, and way too aware of eye contact.",
      comedy: "The scene keeps the affection but exaggerates the timing and the chaos.",
      melancholy: "The scene stays gentle and slightly ache-shaped around the edges.",
      epic: "The scene gets scaled up until the tiny detail feels like destiny filed paperwork."
    };

    function remix() {
      var memory = qs("#memoryInput").value.trim() || "that one ordinary night that turned out not so ordinary";
      var genre = qs("#memoryGenre").value;
      renderBlocks("memoryFrames", [
        { title: "Frame one", body: "It starts with " + memory + ", except now the lighting already knows it matters." },
        { title: "Frame two", body: genreCopy[genre] },
        { title: "Frame three", body: sample(["The soundtrack swells where nobody expected it to.", "Some tiny look ends up carrying the whole scene.", "The ending arrives too fast and leaves more behind than it should."]) }
      ], "nv-story-frame");
      setText("memoryVoice", "Voiceover: " + memory + " was never ordinary. It only looked that way before the heart caught up to it.");
      setText("memoryLogic", "Remix logic engaged");
      setText("memoryLogicCopy", "The machine assumes every memory worth keeping deserves at least a little cinema.");
    }

    qs("#memoryRun").addEventListener("click", remix);
    remix();
  }

  function renderConstellationForHer(feature) {
    return featureShell(feature, {
      controlsTitle: "Build the sky",
      controlsCopy: "Click stars onto the canvas or let the page auto-generate them for a faster little constellation ritual.",
      controlsHtml: [
        '<label class="nv-label">Mood<select class="nv-select" id="constellationMood"><option value="soft">soft</option><option value="bright">bright</option><option value="dangerous">dangerous</option><option value="dreamy">dreamy</option></select></label>',
        '<div class="nv-grid-2"><button class="nv-button nv-button--primary" id="constellationAuto" type="button">Auto-generate</button><button class="nv-button nv-button--secondary" id="constellationClear" type="button">Clear sky</button></div>'
      ].join(""),
      stageTitle: "Constellation canvas",
      stageCopy: "The canvas is interactive. Add your own stars with taps, or let the page sketch one for you instantly.",
      stageHtml: [
        '<div class="nv-canvas-wrap"><canvas class="nv-canvas" id="constellationCanvas" width="640" height="420"></canvas></div>',
        '<div class="nv-output"><strong>Name and reading</strong><p id="constellationSummary" class="nv-empty">Draw or auto-generate the first constellation.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Star note", "How to use the page", "Every click adds a star and redraws the links. Auto-generate makes a new pattern from scratch."),
        '<div class="nv-output"><strong id="constellationCount">0 stars placed</strong><p id="constellationCountCopy" class="nv-empty">The sky is empty right now.</p></div>'
      ].join("")
    });
  }

  function initConstellationForHer() {
    var canvas = qs("#constellationCanvas");
    var ctx = canvas.getContext("2d");
    var stars = [];

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(6, 10, 20, 0.9)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (stars.length > 1) {
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        stars.forEach(function (star, index) {
          if (index === 0) {
            ctx.moveTo(star.x, star.y);
          } else {
            ctx.lineTo(star.x, star.y);
          }
        });
        ctx.stroke();
      }

      stars.forEach(function (star) {
        var glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 16);
        glow.addColorStop(0, "rgba(255,255,255,1)");
        glow.addColorStop(1, "rgba(141,213,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      setText("constellationCount", stars.length + " stars placed");
      setText("constellationCountCopy", stars.length ? "Keep tapping to redraw the pattern live." : "The sky is empty right now.");
    }

    function nameSky() {
      var mood = qs("#constellationMood").value;
      var names = {
        soft: ["Velvet Orbit", "Quiet Halo", "Stillwater Signal"],
        bright: ["Signal Major", "Radiant Thread", "Bangari Prime"],
        dangerous: ["Velvet Menace", "Pretty Hazard", "Sharp Halo"],
        dreamy: ["Moonline Drift", "Sleepy Comet", "Echo Bloom"]
      };
      setText("constellationSummary", "Tonight's pattern is called " + sample(names[mood]) + ". It appears whenever somebody makes softness look stronger than fear.");
    }

    function autoGenerate() {
      stars = Array.from({ length: 6 }, function () {
        return {
          x: 60 + Math.random() * (canvas.width - 120),
          y: 50 + Math.random() * (canvas.height - 100)
        };
      });
      draw();
      nameSky();
    }

    canvas.addEventListener("click", function (event) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      stars.push({
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      });
      draw();
      nameSky();
    });

    qs("#constellationAuto").addEventListener("click", autoGenerate);
    qs("#constellationClear").addEventListener("click", function () {
      stars = [];
      draw();
      setText("constellationSummary", "Sky cleared. Build a new one.");
    });

    draw();
    autoGenerate();
  }

  function renderAuraPortrait(feature) {
    return featureShell(feature, {
      controlsTitle: "Paint the aura",
      controlsCopy: "Choose the traits and pulse speed. The canvas will animate a portrait that feels closer to mood than illustration.",
      controlsHtml: [
        '<div class="nv-grid-2"><label class="nv-label">Trait one<select class="nv-select" id="auraTraitOne"><option value="loyal">loyal</option><option value="chaotic">chaotic</option><option value="soft">soft</option><option value="electric">electric</option></select></label><label class="nv-label">Trait two<select class="nv-select" id="auraTraitTwo"><option value="radiant">radiant</option><option value="protective">protective</option><option value="funny">funny</option><option value="gentle">gentle</option></select></label></div>',
        '<label class="nv-label">Trait three<select class="nv-select" id="auraTraitThree"><option value="moonlit">moonlit</option><option value="golden">golden</option><option value="stormy">stormy</option><option value="dreamy">dreamy</option></select></label>',
        '<label class="nv-label">Pulse speed<div class="nv-range-wrap"><input class="nv-range" id="auraSpeed" type="range" min="1" max="10" value="5" /><span class="nv-range-readout" id="auraSpeedValue"></span></div></label>',
        '<button class="nv-button nv-button--primary" id="auraRun" type="button">Read aura</button>'
      ].join(""),
      stageTitle: "Aura canvas",
      stageCopy: "This page uses a live canvas so the aura keeps moving instead of freezing into one static gradient.",
      stageHtml: [
        '<div class="nv-canvas-wrap"><canvas class="nv-canvas" id="auraCanvas" width="640" height="420"></canvas></div>',
        '<div class="nv-output"><strong class="nv-aura-caption">Aura reading</strong><p id="auraSummary" class="nv-empty">Press read aura to paint the first portrait.</p></div>'
      ].join(""),
      footerHtml: [
        renderPanelHead("Interpretation", "What the colors suggest", "This is not a real aura system, but it is a nice-looking excuse to turn traits into motion."),
        '<div class="nv-output"><strong id="auraMood">No aura note yet</strong><p id="auraMoodCopy" class="nv-empty">Read the aura to see the interpretation.</p></div>'
      ].join("")
    });
  }

  function initAuraPortrait() {
    var canvas = qs("#auraCanvas");
    var ctx = canvas.getContext("2d");
    var animationId = 0;
    var state = {
      colors: ["#ff8fd3", "#8ce7ff", "#88ffc9"],
      speed: 0.015
    };
    var traitColors = {
      loyal: "#8ce7ff",
      chaotic: "#ff8fd3",
      soft: "#ffd6ea",
      electric: "#88ffc9",
      radiant: "#ffe18c",
      protective: "#9ab2ff",
      funny: "#ffb069",
      gentle: "#d8c9ff",
      moonlit: "#c8dcff",
      golden: "#ffe18c",
      stormy: "#5f8dff",
      dreamy: "#b79cff"
    };

    bindRange("auraSpeed", "auraSpeedValue", function (value) {
      return "Pulse " + value + "/10";
    });

    function drawFrame(time) {
      var t = time * state.speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(4, 7, 16, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = 80 + (Math.sin(t) * 12);
      var gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius + 90);
      gradient.addColorStop(0, state.colors[0]);
      gradient.addColorStop(0.45, state.colors[1]);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 90, 0, Math.PI * 2);
      ctx.fill();

      state.colors.forEach(function (color, index) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + (index * 26) + (Math.sin(t + index) * 6), 0, Math.PI * 2);
        ctx.stroke();
      });

      animationId = window.requestAnimationFrame(drawFrame);
    }

    function renderAura() {
      var one = qs("#auraTraitOne").value;
      var two = qs("#auraTraitTwo").value;
      var three = qs("#auraTraitThree").value;
      state.colors = [traitColors[one], traitColors[two], traitColors[three]];
      state.speed = 0.008 + (Number(qs("#auraSpeed").value || 5) * 0.0025);

      window.cancelAnimationFrame(animationId);
      animationId = window.requestAnimationFrame(drawFrame);
      setText("auraSummary", "Aura portrait: " + one + ", " + two + ", and " + three + " combine into a glow that looks prettier than it has any right to.");
      setText("auraMood", "Interpretation");
      setText("auraMoodCopy", "The canvas reads this as a person who can feel soft, intense, and unforgettable in the same exact frame.");
    }

    qs("#auraRun").addEventListener("click", renderAura);
    renderAura();
  }

  // FEATURE_MODULES_END

  function mountFeature(slug) {
    var feature = FEATURES[slug];
    if (!feature) {
      renderHub();
      return;
    }

    setTheme(feature);
    document.title = feature.title + " | Bangari After Dark";
    app.innerHTML = feature.render(feature);
    feature.init(feature);
  }

  if (body.getAttribute("data-nightverse-hub") === "true") {
    renderHub();
  } else {
    mountFeature(body.getAttribute("data-nightverse-feature") || "");
  }
})();
