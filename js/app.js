(function () {
  "use strict";

  /* ================= Setup ================= */

  const cityId = Store.setting("city") && CITIES[Store.setting("city")] ? Store.setting("city") : Object.keys(CITIES)[0];
  const CITY = CITIES[cityId];
  const PLANTS = CITY.plants;
  const SPOTS = CITY.spots || [];
  const LOOKALIKES = CITY.lookalikes || [];
  const BY_ID = {};
  PLANTS.forEach(function (p) { BY_ID[p.id] = p; });

  const QUIZ_LENGTH = 10;
  const RIYADH = [24.7136, 46.6753];

  const view = document.getElementById("view");
  const topTitle = document.getElementById("topTitle");
  const backBtn = document.getElementById("backBtn");
  const langBtn = document.getElementById("langBtn");
  const themeBtn = document.getElementById("themeBtn");
  const photoInput = document.getElementById("photoInput");

  let cleanup = null; // called when leaving a view

  /* ================= Language ================= */

  let lang = Store.setting("lang") === "ar" ? "ar" : "en";

  function t(key, vars) {
    let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }

  function isAr() { return lang === "ar"; }
  function cityName() { return isAr() ? CITY.nameAr : CITY.name; }
  function fact(p) { return isAr() && p.factAr ? p.factAr : p.fact; }
  function placeName(s) { return isAr() ? s.ar : s.en; }

  // Main and secondary name, in the order that suits the interface language.
  function namePair(p) {
    return isAr()
      ? { main: '<span class="ar" lang="ar">' + esc(p.ar) + "</span>", sub: '<span lang="en" dir="ltr">' + esc(p.en) + "</span>" }
      : { main: '<span lang="en">' + esc(p.en) + "</span>", sub: '<span class="ar" lang="ar">' + esc(p.ar) + "</span>" };
  }

  function applyLang() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = isAr() ? "rtl" : "ltr";
    langBtn.textContent = t("langBtn");
    langBtn.setAttribute("aria-label", t("langLabel"));
    themeBtn.setAttribute("aria-label", t("themeLabel"));
    backBtn.setAttribute("aria-label", t("back"));
    document.title = t("appTitle", { city: cityName() });
  }

  langBtn.addEventListener("click", function () {
    lang = isAr() ? "en" : "ar";
    Store.setting("lang", lang);
    applyLang();
    route();
  });

  /* ================= Helpers ================= */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function h(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // Weighted random order: plants with a higher weight tend to come first.
  function weightedOrder(plants) {
    return plants
      .map(function (p) { return { p: p, k: Math.pow(Math.random(), 1 / Store.weight(p.id)) }; })
      .sort(function (a, b) { return b.k - a.k; })
      .map(function (x) { return x.p; });
  }

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function masteredCount() {
    return PLANTS.filter(function (p) { return Store.isMastered(p.id); }).length;
  }

  function mainPhoto(p) { return "images/" + p.id + ".jpg"; }

  // All photos of a plant: the downloaded ones first, then the learner's own.
  function photosOf(p) {
    const list = (PHOTO_CREDITS[p.id] || [{ src: mainPhoto(p) }]).map(function (c) {
      return { src: c.src, part: c.part, credit: c, mine: false };
    });
    Store.myPhotos(p.id).forEach(function (m) { list.push({ src: m.url, key: m.key, loc: m.loc, mine: true }); });
    return list;
  }

  function creditHTML(ph) {
    if (ph.mine) return '<p class="credit">' + t("myPhoto") + "</p>";
    const c = ph.credit;
    if (!c || !c.source) return "";
    const lic = c.licenseUrl
      ? '<a href="' + esc(c.licenseUrl) + '" target="_blank" rel="noopener">' + esc(c.license) + "</a>"
      : esc(c.license);
    return '<p class="credit" dir="auto">' + t("photoBy") + ': <a href="' + esc(c.source) + '" target="_blank" rel="noopener">' +
      esc(c.author) + "</a>, " + lic + ", " + t("viaCommons") + "</p>";
  }

  function imgHTML(src, alt, eager) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" ' + (eager ? "" : 'loading="lazy" ') + 'decoding="async" draggable="false">';
  }

  function partLabel(ph) {
    if (ph.mine) return '<span class="photo-part mine">' + t("myPhoto") + "</span>";
    return ph.part ? '<span class="photo-part">' + esc(t("part." + ph.part)) + "</span>" : "";
  }

  function originChip(p) {
    return p.origin === "native"
      ? '<span class="chip chip-native">' + t("native") + "</span>"
      : '<span class="chip chip-introduced">' + t("introduced") + "</span>";
  }

  function whereChips(p) {
    return p.where.map(function (w) { return '<span class="chip">' + esc(t("where." + w)) + "</span>"; }).join("");
  }

  function streakHTML(id) {
    const s = Math.min(Store.get(id).streak, Store.MASTERY_STREAK);
    let out = '<span class="streak" aria-label="' + s + '/3">';
    for (let i = 0; i < Store.MASTERY_STREAK; i++) out += '<i class="' + (i < s ? "on" : "") + '"></i>';
    return out + "</span>";
  }

  const ARROW_L = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Left/right buttons over a photo plus a "2 / 3" counter. Always left = previous.
  function navHTML(count, idx) {
    if (count < 2) return "";
    return '<button class="ph-nav ph-prev" data-nav="-1" aria-label="' + t("prevPhoto") + '">' + ARROW_L + "</button>" +
      '<button class="ph-nav ph-next" data-nav="1" aria-label="' + t("nextPhoto") + '">' + ARROW_R + "</button>" +
      '<span class="ph-count" dir="ltr">' + (idx + 1) + " / " + count + "</span>";
  }

  function preload(srcs) {
    srcs.forEach(function (s) { const i = new Image(); i.src = s; });
  }

  const SPEAKER = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 8.8a4.6 4.6 0 0 1 0 6.4M18 6.3a8.2 8.2 0 0 1 0 11.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function speakBtn(kind, id) {
    return '<button class="speak-btn" data-speak="' + kind + '" data-id="' + id + '" aria-label="' + t("listen") + '" title="' + t("listen") + '">' + SPEAKER + "</button>";
  }

  // Names block used on flashcards and plant pages: main name, other-language name,
  // scientific name with pronunciation guide, each with a listen button.
  function namesHTML(p) {
    const en = '<h2 class="name-en" lang="en" dir="ltr">' + esc(p.en) + speakBtn("en", p.id) + "</h2>";
    const ar = '<p class="name-ar ar" lang="ar" dir="rtl">' + esc(p.ar) + speakBtn("ar", p.id) + "</p>";
    return '<div class="names">' + (isAr() ? ar + en : en + ar) +
      '<p class="name-sci" lang="la" dir="ltr"><i>' + esc(p.sci) + "</i>" + speakBtn("sci", p.id) + "</p>" +
      (p.say ? '<p class="say-guide"><span>' + t("sayIt") + '</span> <bdi dir="ltr">' + esc(p.say) + "</bdi></p>" : "") +
      "</div>";
  }

  /* ================= Read aloud ================= */

  let voices = [];
  function loadVoices() { if ("speechSynthesis" in window) voices = speechSynthesis.getVoices(); }
  if ("speechSynthesis" in window) {
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }

  function findVoice(prefixes) {
    for (let i = 0; i < prefixes.length; i++) {
      const v = voices.find(function (x) { return x.lang && x.lang.replace("_", "-").toLowerCase().indexOf(prefixes[i]) === 0; });
      if (v) return v;
    }
    return null;
  }

  function speak(text, kind) {
    if (!("speechSynthesis" in window)) return toast(t("noVoice"));
    loadVoices();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (kind === "ar") {
      const v = findVoice(["ar-sa", "ar"]);
      if (!v && voices.length) return toast(t("noVoiceAr"));
      u.lang = v ? v.lang : "ar-SA";
      if (v) u.voice = v;
      u.rate = 0.85;
    } else {
      // Scientific names are read with an English voice, the usual way botanists say them.
      const v = findVoice(["en-gb", "en-us", "en"]);
      u.lang = v ? v.lang : "en-GB";
      if (v) u.voice = v;
      u.rate = kind === "sci" ? 0.75 : 0.9;
    }
    speechSynthesis.speak(u);
  }

  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-speak]");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    const p = BY_ID[b.dataset.id];
    if (!p) return;
    const kind = b.dataset.speak;
    const text = kind === "ar" ? p.ar.replace(/\s*\/\s*/g, "، ") : kind === "sci" ? p.sci : p.en.replace(/\s*\/\s*/g, ", ");
    b.classList.add("speaking");
    setTimeout(function () { b.classList.remove("speaking"); }, 900);
    speak(text, kind);
  }, true);

  /* ================= My photos ================= */

  // Shrink a phone photo so it doesn't fill up browser storage.
  function resizeImage(file, max) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error("Could not read photo")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Could not read photo")); };
      img.src = url;
    });
  }

  // Read GPS coordinates from a JPEG's EXIF data, if the phone saved them.
  function readGps(file) {
    return file.slice(0, 256 * 1024).arrayBuffer().then(function (buf) {
      const v = new DataView(buf);
      if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
      let off = 2;
      while (off + 4 < v.byteLength) {
        const marker = v.getUint16(off);
        const size = v.getUint16(off + 2);
        if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return parseExifGps(v, off + 10);
        if ((marker & 0xFF00) !== 0xFF00) break;
        off += 2 + size;
      }
      return null;
    }).catch(function () { return null; });
  }

  function parseExifGps(v, tiff) {
    const le = v.getUint16(tiff) === 0x4949;
    const u16 = function (o) { return v.getUint16(tiff + o, le); };
    const u32 = function (o) { return v.getUint32(tiff + o, le); };
    function findTag(ifd, tag) {
      const n = u16(ifd);
      for (let i = 0; i < n; i++) {
        const e = ifd + 2 + i * 12;
        if (u16(e) === tag) return e;
      }
      return -1;
    }
    const ifd0 = u32(4);
    const gpsEntry = findTag(ifd0, 0x8825);
    if (gpsEntry < 0) return null;
    const gps = u32(gpsEntry + 8);
    function ref(tag) { const e = findTag(gps, tag); return e < 0 ? "" : String.fromCharCode(v.getUint8(tiff + e + 8)); }
    function coord(tag) {
      const e = findTag(gps, tag);
      if (e < 0) return null;
      const o = u32(e + 8);
      const r = function (k) { const d = u32(o + k * 8 + 4); return d ? u32(o + k * 8) / d : 0; };
      return r(0) + r(1) / 60 + r(2) / 3600;
    }
    let lat = coord(2), lng = coord(4);
    if (lat === null || lng === null || (lat === 0 && lng === 0)) return null;
    if (ref(1) === "S") lat = -lat;
    if (ref(3) === "W") lng = -lng;
    return { lat: lat, lng: lng };
  }

  function currentLocation() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error("No geolocation"));
      navigator.geolocation.getCurrentPosition(
        function (pos) { resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        reject,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  function askForPhoto(plantId, done) {
    photoInput.value = "";
    photoInput.onchange = function () {
      const f = photoInput.files && photoInput.files[0];
      if (!f) return;
      Promise.all([resizeImage(f, 1200), readGps(f)])
        .then(function (r) {
          return Store.addPhoto(plantId, r[0], r[1]).then(function (item) {
            if (r[1]) { toast(t("photoSavedLoc")); return; }
            toast(t("photoSaved"));
            if (navigator.geolocation && confirm(t("askLocation"))) {
              return currentLocation()
                .then(function (loc) { return Store.setPhotoLocation(plantId, item.key, loc); })
                .then(function () { toast(t("locationSaved")); })
                .catch(function () { toast(t("locationFail")); });
            }
          });
        })
        .then(function () { if (done) done(); })
        .catch(function () { toast(t("photoFail")); });
    };
    photoInput.click();
  }

  /* ================= Maps ================= */

  function isDark() {
    const th = Store.setting("theme");
    return th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function makeMap(el, opts) {
    if (!window.L) {
      el.innerHTML = '<p class="map-msg">' + t("mapOffline") + "</p>";
      return null;
    }
    const map = L.map(el, Object.assign({ zoomControl: true, attributionControl: true }, opts || {}));
    // OpenStreetMap's own tiles: free, no key. Dark mode tints them with CSS.
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);
    tiles.on("tileerror", function (e) {
      // Retry a failed tile once (patchy mobile connections).
      const img = e.tile;
      if (img && !img.dataset.retried) {
        img.dataset.retried = "1";
        const src = img.src;
        setTimeout(function () { img.src = src + (src.indexOf("?") < 0 ? "?" : "&") + "retry=1"; }, 1200);
      }
      if (!navigator.onLine && !el.querySelector(".map-msg")) {
        el.appendChild(h('<p class="map-msg map-msg-float">' + t("mapOffline") + "</p>"));
      }
    });
    map.attributionControl.setPrefix(false);
    // The view fades in; re-measure once it has settled so tiles fill the box.
    function settle() {
      if (!map._loaded || !el.isConnected) return;
      map.invalidateSize({ pan: false });
      tiles.redraw();
    }
    setTimeout(settle, 60);
    setTimeout(settle, 450);
    return map;
  }

  function spotIcon(count) {
    return L.divIcon({
      className: "spot-pin",
      html: "<span>" + count + "</span>",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -16]
    });
  }

  function sightingIcon(url) {
    return L.divIcon({
      className: "sight-pin",
      html: '<img src="' + esc(url) + '" alt="">',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -18]
    });
  }

  function spotPopup(s, plants) {
    return '<div class="pop" dir="' + (isAr() ? "rtl" : "ltr") + '"><p class="pop-title">' + esc(placeName(s)) + "</p>" +
      '<div class="pop-plants">' + plants.map(function (p) {
        return '<a class="pop-plant" href="#/plant/' + p.id + '"><img src="' + mainPhoto(p) + '" alt=""><span>' +
          esc(isAr() ? p.ar : p.en) + "</span></a>";
      }).join("") + "</div></div>";
  }

  function sightingPopup(sg) {
    const p = BY_ID[sg.plant];
    return '<div class="pop" dir="' + (isAr() ? "rtl" : "ltr") + '"><a class="pop-plant pop-sight" href="#/plant/' + p.id + '"><img src="' + esc(sg.url) + '" alt=""><span>' +
      esc(isAr() ? p.ar : p.en) + "</span></a></div>";
  }

  // Small world map with the plant's native countries highlighted.
  function rangeSVG(p) {
    if (!window.WORLD || !p.range) return "";
    const W = window.WORLD;
    const set = {};
    p.range.countries.forEach(function (n) {
      (n.charAt(0) === "@" ? REGIONS[n.slice(1)] || [] : [n]).forEach(function (c) { set[c] = true; });
    });
    const rx = (RIYADH[1] + 180) * W.s, ry = (W.top - RIYADH[0]) * W.s;
    // Zoom to the highlighted countries plus Riyadh.
    let x0 = rx, x1 = rx, y0 = ry, y1 = ry;
    Object.keys(set).forEach(function (c) {
      const d = W.countries[c];
      if (!d) return;
      const nums = d.match(/-?\d+(\.\d+)?/g);
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = +nums[i], y = +nums[i + 1];
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    });
    let w = Math.max(x1 - x0, 110) + 40, hgt = Math.max(y1 - y0, 60) + 40;
    if (w / hgt < 1.8) w = hgt * 1.8; else hgt = w / 1.8;
    let vx = (x0 + x1) / 2 - w / 2, vy = (y0 + y1) / 2 - hgt / 2;
    vx = Math.max(0, Math.min(W.w - w, vx)); vy = Math.max(0, Math.min(W.h - hgt, vy));
    if (w > W.w) { vx = 0; w = W.w; hgt = w / 1.8; }
    const paths = Object.keys(W.countries).map(function (c) {
      return '<path d="' + W.countries[c] + '" class="' + (set[c] ? "on" : "") + '"><title>' + esc(c) + "</title></path>";
    }).join("");
    const r = Math.max(w / 90, 2);
    return '<svg class="range-map" viewBox="' + vx.toFixed(1) + " " + vy.toFixed(1) + " " + w.toFixed(1) + " " + hgt.toFixed(1) + '" role="img" aria-label="' + esc(t("nativeTo", { r: isAr() ? p.range.ar : p.range.en })) + '">' +
      paths +
      '<circle cx="' + rx + '" cy="' + ry + '" r="' + r + '" class="riyadh-dot"/>' +
      '<text x="' + (rx + r * 1.8) + '" y="' + (ry + r * 0.9) + '" class="riyadh-label" font-size="' + (r * 3.2).toFixed(1) + '">' + t("riyadh") + "</text>" +
      "</svg>";
  }

  /* ================= Router ================= */

  const routes = {
    "": renderHome,
    cards: renderCards,
    quiz: renderQuiz,
    progress: renderProgress,
    plant: renderPlant,
    map: renderMap,
    look: renderLook,
    wiki: renderWiki
  };

  function go(path) { location.hash = "#/" + path; }

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const name = routes[parts[0]] ? parts[0] : "";
    if (cleanup) { cleanup(); cleanup = null; }
    stopConfetti();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    view.innerHTML = "";
    view.classList.remove("view-enter");
    void view.offsetWidth;
    view.classList.add("view-enter");
    backBtn.hidden = name === "";
    document.getElementById("logo").hidden = name !== "";
    routes[name].apply(null, parts.slice(1).map(decodeURIComponent));
    window.scrollTo(0, 0);
  }

  backBtn.addEventListener("click", function () {
    if (history.length > 1 && /^#\/(plant|map\/|wiki\/)/.test(location.hash)) history.back(); else go("");
  });

  /* ================= Home ================= */

  function renderHome() {
    topTitle.textContent = t("appTitle", { city: cityName() });
    const total = PLANTS.length;
    const done = masteredCount();
    const R = 84, C = 2 * Math.PI * R;
    const el = h(
      "<div>" +
      '<section class="home-hero">' +
      '<div class="ring-wrap" role="img" aria-label="' + done + " / " + total + '">' +
      '<svg class="ring" viewBox="0 0 200 200"><circle class="ring-track" cx="100" cy="100" r="' + R + '" fill="none" stroke-width="16"/>' +
      '<circle class="ring-bar" cx="100" cy="100" r="' + R + '" fill="none" stroke-width="16" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/></svg>' +
      '<div class="ring-center"><div class="ring-num" dir="ltr">' + done + "<small>/" + total + '</small></div><div class="ring-label">' + t("masteredLabel") + "</div></div>" +
      "</div>" +
      '<p class="home-sub">' + esc(t("learnSub", { city: cityName() })) + (isAr() ? "" : ' · <span class="ar">نباتات ' + esc(CITY.nameAr) + "</span>") + "</p>" +
      "</section>" +
      '<nav class="menu">' +
      menuItem("cards", t("flashcards"), t("flashcardsDesc"),
        '<svg viewBox="0 0 24 24" width="28" height="28"><rect x="3" y="6" width="13" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>') +
      menuItem("quiz", t("quiz"), t("quizDesc", { n: QUIZ_LENGTH }),
        '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.2" fill="currentColor"/></svg>') +
      menuItem("map", t("map"), t("mapDesc"),
        '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="2"/></svg>') +
      menuItem("look", t("lookalikes"), t("lookDesc"),
        '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="8" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/></svg>') +
      menuItem("wiki", t("wiki"), t("wikiDesc"),
        '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>') +
      menuItem("progress", t("progress"), t("progressDesc"),
        '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 21c-4.5-2.5-7-6.2-7-10.5C5 7 7.5 4 12 3c4.5 1 7 4 7 7.5 0 4.3-2.5 8-7 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>') +
      "</nav></div>"
    );
    view.appendChild(el);
    el.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { go(b.dataset.go); });
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.querySelector(".ring-bar").style.strokeDashoffset = String(C * (1 - done / total));
      });
    });
  }

  function menuItem(path, title, desc, icon) {
    return '<button class="menu-item" data-go="' + path + '">' +
      '<span class="menu-icon" aria-hidden="true">' + icon + "</span>" +
      '<span class="menu-text"><span class="menu-title">' + title + '</span><span class="menu-desc">' + desc + "</span></span>" +
      '<svg class="menu-chev flip-rtl" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>";
  }

  /* ================= Filter control ================= */

  function filterHTML(current) {
    return '<div class="segmented" role="group">' +
      ["all", "native", "introduced"].map(function (f) {
        return '<button data-filter="' + f + '" aria-pressed="' + (current === f) + '">' + t(f) + "</button>";
      }).join("") + "</div>";
  }

  function filtered(f) {
    return f === "all" ? PLANTS : PLANTS.filter(function (p) { return p.origin === f; });
  }

  /* ================= Flashcards ================= */

  function renderCards() {
    topTitle.textContent = t("flashcards");
    let filter = Store.setting("filter") || "all";
    let deck, index, known, learning;

    function start(list) {
      // Plain random shuffle every time, so the order never repeats a pattern.
      // Avoid starting with the same plant as the last deck.
      deck = list || shuffle(filtered(filter));
      const last = Store.setting("lastCard");
      if (!list && deck.length > 1 && deck[0].id === last) deck.push(deck.shift());
      index = 0; known = 0; learning = [];
      draw();
    }

    function draw() {
      view.innerHTML = "";
      view.appendChild(h(filterHTML(filter)));
      view.querySelectorAll("[data-filter]").forEach(function (b) {
        b.addEventListener("click", function () {
          filter = b.dataset.filter;
          Store.setting("filter", filter);
          start();
        });
      });
      if (index >= deck.length) return drawDone();
      drawCard();
    }

    function drawCard() {
      const p = deck[index];
      Store.setting("lastCard", p.id);
      const photos = photosOf(p);
      let photoIdx = 0;
      const next = deck[index + 1];
      if (next) preload([mainPhoto(next)]);
      const dots = navHTML(photos.length, 0);

      const wrap = h(
        '<div class="fc-wrap">' +
        '<div class="fc-meta"><span dir="ltr">' + (index + 1) + " / " + deck.length + "</span><span>" + t("tapHint") + "</span></div>" +
        '<div class="fc-stage">' +
        '<div class="card-drag">' +
        '<span class="swipe-label swipe-know">' + t("knowIt") + '</span><span class="swipe-label swipe-learn">' + t("stillLearning") + "</span>" +
        '<div class="card" role="button" tabindex="0">' +
        '<div class="face face-front"><div class="photo">' + imgHTML(photos[0].src, "?", true) + dots + "</div>" +
        '<div class="hint">' + t("whatPlant") + "</div></div>" +
        '<div class="face face-back">' +
        '<div class="photo">' + imgHTML(photos[0].src, p.en, true) + '<span class="part-slot">' + partLabel(photos[0]) + "</span>" + navHTML(photos.length, 0) + "</div>" +
        '<div class="back-body">' + namesHTML(p) +
        '<div class="chips">' + originChip(p) + whereChips(p) + "</div>" +
        '<p class="fact"><b>' + t("funFact") + "</b> " + esc(fact(p)) + "</p>" +
        '<div class="photo-actions"><button class="btn btn-soft btn-small" data-act="add">' + t("addPhoto") + "</button>" +
        '<button class="btn btn-soft btn-small" data-act="more">' + t("details") + "</button></div>" +
        '<div class="credit-slot">' + creditHTML(photos[0]) + "</div>" +
        "</div></div>" +
        "</div></div></div>" +
        '<div class="fc-actions">' +
        '<button class="btn btn-bad" data-act="learning">' + t("stillLearning") + "</button>" +
        '<button class="btn btn-good" data-act="know">' + t("knowIt") + "</button>" +
        "</div></div>"
      );
      view.appendChild(wrap);

      const drag = wrap.querySelector(".card-drag");
      const card = wrap.querySelector(".card");
      const stage = wrap.querySelector(".fc-stage");
      const lblKnow = wrap.querySelector(".swipe-know");
      const lblLearn = wrap.querySelector(".swipe-learn");
      let busy = false;

      function flip() { card.classList.toggle("flipped"); }

      function showPhoto(i) {
        photoIdx = (i + photos.length) % photos.length;
        const ph = photos[photoIdx];
        wrap.querySelectorAll(".face img").forEach(function (im) { im.src = ph.src; });
        wrap.querySelectorAll(".ph-count").forEach(function (c) { c.textContent = (photoIdx + 1) + " / " + photos.length; });
        wrap.querySelector(".credit-slot").innerHTML = creditHTML(ph);
        wrap.querySelector(".part-slot").innerHTML = partLabel(ph);
      }

      function answer(isKnown) {
        if (busy) return;
        busy = true;
        Store.recordCard(p.id, isKnown);
        if (isKnown) known++; else learning.push(p);
        drag.style.transform = "translateX(" + (isKnown ? 130 : -130) + "%) rotate(" + (isKnown ? 18 : -18) + "deg)";
        drag.style.opacity = "0";
        setTimeout(function () { index++; draw(); }, 300);
      }

      wrap.querySelectorAll("[data-nav]").forEach(function (b) {
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          showPhoto(photoIdx + Number(b.dataset.nav));
        });
      });
      wrap.querySelector('[data-act="know"]').addEventListener("click", function () { answer(true); });
      wrap.querySelector('[data-act="learning"]').addEventListener("click", function () { answer(false); });
      wrap.querySelector('[data-act="add"]').addEventListener("click", function (e) {
        e.stopPropagation();
        askForPhoto(p.id, function () {
          photos.push(photosOf(p).pop());
          showPhoto(photos.length - 1);
        });
      });
      wrap.querySelector('[data-act="more"]').addEventListener("click", function (e) {
        e.stopPropagation();
        go("plant/" + p.id);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
        if (e.key === "ArrowRight") answer(true);
        if (e.key === "ArrowLeft") answer(false);
      });

      // Pointer handling: tap flips, horizontal drag answers (right = I know it).
      // Tapping the bottom of the front photo cycles photos when there are several.
      let startX = 0, startY = 0, dx = 0, dy = 0, down = false, dragging = false;

      stage.addEventListener("pointerdown", function (e) {
        if (e.target.closest("button, a")) return;
        down = true; dragging = false;
        startX = e.clientX; startY = e.clientY; dx = dy = 0;
      });
      stage.addEventListener("pointermove", function (e) {
        if (!down) return;
        dx = e.clientX - startX; dy = e.clientY - startY;
        if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          dragging = true;
          drag.classList.add("dragging");
          try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
        if (dragging) {
          drag.style.transform = "translateX(" + dx + "px) rotate(" + dx / 20 + "deg)";
          lblKnow.style.opacity = String(Math.max(0, Math.min(1, dx / 90)));
          lblLearn.style.opacity = String(Math.max(0, Math.min(1, -dx / 90)));
        }
      });
      function end(e) {
        if (!down) return;
        down = false;
        drag.classList.remove("dragging");
        lblKnow.style.opacity = lblLearn.style.opacity = "0";
        if (dragging) {
          if (Math.abs(dx) > 90) return answer(dx > 0);
          drag.style.transform = "";
          return;
        }
        if (e.type === "pointerup" && Math.abs(dx) < 10 && Math.abs(dy) < 10 && !e.target.closest("button, a")) {
          flip();
        }
      }
      stage.addEventListener("pointerup", end);
      stage.addEventListener("pointercancel", end);
    }

    function drawDone() {
      const n = deck.length;
      const el = h(
        '<div class="score">' +
        '<div class="score-big" dir="ltr">' + known + "<small>/" + n + "</small></div>" +
        '<p class="score-msg">' + (known === n ? t("knewAll") : t("deckDone")) + "</p>" +
        '<p class="score-sub">' + (learning.length ? t("stillToLearn", { n: learning.length }) : t("tryQuiz")) + "</p>" +
        '<div class="score-actions">' +
        (learning.length ? '<button class="btn btn-primary btn-block" data-act="again">' + t("reviewAgain", { n: learning.length }) + "</button>" : "") +
        '<button class="btn ' + (learning.length ? "btn-soft" : "btn-primary") + ' btn-block" data-act="all">' + t("shuffleAll") + "</button>" +
        '<button class="btn btn-soft btn-block" data-act="quiz">' + t("takeQuiz") + "</button>" +
        "</div></div>"
      );
      view.appendChild(el);
      if (known === n && n >= 5) confetti();
      const again = el.querySelector('[data-act="again"]');
      if (again) again.addEventListener("click", function () { start(shuffle(learning)); });
      el.querySelector('[data-act="all"]').addEventListener("click", function () { start(); });
      el.querySelector('[data-act="quiz"]').addEventListener("click", function () { go("quiz"); });
    }

    start();
  }

  /* ================= Quiz ================= */

  const QTYPES = ["photo-en", "photo-ar", "en-ar", "ar-en"];

  function lookalikesOf(id) {
    return LOOKALIKES.filter(function (l) { return l.a === id || l.b === id; })
      .map(function (l) { return { other: BY_ID[l.a === id ? l.b : l.a], pair: l }; });
  }

  function makeQuestions() {
    const chosen = weightedOrder(PLANTS).slice(0, Math.min(QUIZ_LENGTH, PLANTS.length));
    const types = shuffle(chosen.map(function (_, i) { return QTYPES[i % QTYPES.length]; }));
    return chosen.map(function (p, i) {
      const type = types[i];
      // Distractors: a look-alike if there is one, plus plants from the same group, plus any.
      const picked = [];
      const add = function (o) { if (o && o.id !== p.id && picked.indexOf(o) < 0 && picked.length < 3) picked.push(o); };
      shuffle(lookalikesOf(p.id)).slice(0, 1).forEach(function (x) { add(x.other); });
      const others = shuffle(PLANTS.filter(function (o) { return o.id !== p.id; }));
      others.filter(function (o) { return o.origin === p.origin; }).slice(0, 2).forEach(add);
      others.forEach(add);
      return { plant: p, type: type, photo: pick(photosOf(p)), choices: shuffle([p].concat(picked)) };
    });
  }

  function renderQuiz() {
    topTitle.textContent = t("quiz");
    const qs = makeQuestions();
    let i = 0, score = 0;
    const missed = [];
    const newlyMastered = [];
    let timer = null;
    cleanup = function () { clearTimeout(timer); };

    preload(qs.map(function (q) { return q.photo.src; }));

    const shell = h(
      '<div class="q-shell">' +
      '<div class="q-progress"><div class="q-progress-bar" style="width:0%"></div></div>' +
      '<div class="q-meta"><span class="q-count"></span><span class="q-score"></span></div>' +
      '<div class="q-body"></div></div>'
    );
    view.appendChild(shell);
    const body = shell.querySelector(".q-body");

    function show() {
      const q = qs[i];
      const p = q.plant;
      const arabicChoices = q.type === "photo-ar" || q.type === "en-ar";
      shell.querySelector(".q-progress-bar").style.width = (i / qs.length * 100) + "%";
      shell.querySelector(".q-count").textContent = t("questionOf", { i: i + 1, n: qs.length });
      shell.querySelector(".q-score").textContent = t("score", { n: score });

      let stim;
      if (q.type === "en-ar") {
        stim = '<div class="q-word"><div class="q-word-text" lang="en" dir="ltr">' + esc(p.en) + '<span class="q-word-sci">' + esc(p.sci) + "</span></div></div>";
      } else if (q.type === "ar-en") {
        stim = '<div class="q-word"><div class="q-word-text ar" lang="ar" dir="rtl">' + esc(p.ar) + "</div></div>";
      } else {
        stim = '<div class="photo q-photo">' + imgHTML(q.photo.src, "?", true) + "</div>";
      }

      const panel = h(
        '<div class="q-in">' +
        '<p class="q-prompt">' + t("q." + q.type) + "</p>" + stim +
        '<div class="choices">' +
        q.choices.map(function (c) {
          return '<button class="choice' + (arabicChoices ? " ar" : "") + '"' + (arabicChoices ? ' lang="ar" dir="rtl"' : ' lang="en" dir="ltr"') +
            ' data-id="' + c.id + '">' + esc(arabicChoices ? c.ar : c.en) + "</button>";
        }).join("") +
        '</div><div class="fb-slot"></div></div>'
      );
      body.innerHTML = "";
      body.appendChild(panel);

      panel.querySelectorAll(".choice").forEach(function (btn) {
        btn.addEventListener("click", function () { choose(btn, panel, q); });
      });
    }

    function choose(btn, panel, q) {
      const p = q.plant;
      const ok = btn.dataset.id === p.id;
      panel.querySelectorAll(".choice").forEach(function (b) {
        b.disabled = true;
        if (b.dataset.id === p.id) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
        else b.classList.add("dim");
      });
      if (navigator.vibrate) navigator.vibrate(ok ? 15 : [30, 40, 30]);
      if (Store.recordQuiz(p.id, ok)) newlyMastered.push(p);
      if (ok) score++; else missed.push(p);
      shell.querySelector(".q-score").textContent = t("score", { n: score });

      const showPhoto = !ok || q.type === "en-ar" || q.type === "ar-en";
      const names = namePair(p);
      const fb = h(
        '<div class="feedback"><div class="feedback-row">' +
        (showPhoto ? '<div class="photo">' + imgHTML(mainPhoto(p), p.en, true) + "</div>" : "") +
        '<div class="feedback-text"><p class="feedback-title ' + (ok ? "good" : "bad") + '">' + (ok ? t("correct") : t("notQuite")) + "</p>" +
        '<p class="feedback-names">' + names.main + speakBtn(isAr() ? "ar" : "en", p.id) + " · " + names.sub + speakBtn(isAr() ? "en" : "ar", p.id) + "</p>" +
        '<p class="name-sci" dir="ltr"><i>' + esc(p.sci) + "</i></p></div></div></div>"
      );
      panel.querySelector(".fb-slot").appendChild(fb);

      const last = i === qs.length - 1;
      const nextBtn = h('<button class="btn btn-primary btn-block q-next">' + (last ? t("seeScore") : t("next")) + "</button>");
      panel.querySelector(".fb-slot").appendChild(nextBtn);
      nextBtn.addEventListener("click", advance);
      nextBtn.focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (ok) timer = setTimeout(advance, 1400);
    }

    function advance() {
      clearTimeout(timer);
      const panel = body.firstElementChild;
      if (!panel || panel.classList.contains("q-out")) return;
      panel.classList.remove("q-in");
      panel.classList.add("q-out");
      timer = setTimeout(function () {
        i++;
        if (i < qs.length) show(); else finish();
      }, 230);
    }

    function finish() {
      shell.querySelector(".q-progress-bar").style.width = "100%";
      const n = qs.length;
      const msg = score === n ? t("perfect") : score >= 8 ? t("great") : score >= 5 ? t("nice") : t("keepGoing");
      const seen = {};
      const uniqMissed = missed.filter(function (p) { return seen[p.id] ? false : (seen[p.id] = true); });
      body.innerHTML = "";
      const el = h(
        '<div class="score q-in">' +
        '<div class="score-big" dir="ltr">' + score + "<small>/" + n + "</small></div>" +
        '<p class="score-msg">' + msg + "</p>" +
        '<p class="score-sub">' + t("masteredOf", { m: masteredCount(), n: PLANTS.length }) +
        (newlyMastered.length ? t("newThisRound", { n: newlyMastered.length }) : "") + "</p>" +
        (uniqMissed.length ? '<p class="section-title">' + t("reviewThese") + '</p><div class="review-list">' + uniqMissed.map(plantRow).join("") + "</div>" : "") +
        '<div class="score-actions">' +
        '<button class="btn btn-primary btn-block" data-act="again">' + t("playAgain") + "</button>" +
        '<button class="btn btn-soft btn-block" data-act="home">' + t("home") + "</button>" +
        "</div></div>"
      );
      body.appendChild(el);
      el.querySelector('[data-act="again"]').addEventListener("click", function () { route(); });
      el.querySelector('[data-act="home"]').addEventListener("click", function () { go(""); });
      bindRows(el);
      if (score >= 8) setTimeout(confetti, 250);
    }

    show();
  }

  /* ================= Plant rows (lists) ================= */

  function plantRow(p) {
    const mine = Store.myPhotos(p.id).length;
    const names = namePair(p);
    return '<button class="plant-row" data-id="' + p.id + '">' +
      '<div class="photo">' + imgHTML(mainPhoto(p), p.en) + "</div>" +
      '<div class="plant-row-text"><span class="plant-row-main">' + names.main +
      (mine ? ' <span class="chip chip-tiny">+' + mine + " 📷</span>" : "") +
      '</span><span class="plant-row-sub">' + names.sub + "</span></div>" +
      (Store.isMastered(p.id) ? '<span class="badge-mastered">' + t("statMastered") + "</span>" : streakHTML(p.id)) +
      "</button>";
  }

  function bindRows(root) {
    root.querySelectorAll(".plant-row[data-id]").forEach(function (b) {
      b.addEventListener("click", function () { go("plant/" + b.dataset.id); });
    });
  }

  /* ================= Progress ================= */

  function renderProgress() {
    topTitle.textContent = t("progress");
    let filter = Store.setting("progressFilter") || "all";

    function draw() {
      const list = filtered(filter);
      const mastered = list.filter(function (p) { return Store.isMastered(p.id); });
      const learning = list.filter(function (p) { return !Store.isMastered(p.id) && Store.isSeen(p.id); })
        .sort(function (a, b) { return Store.weight(b.id) - Store.weight(a.id); });
      const fresh = list.filter(function (p) { return !Store.isSeen(p.id); });

      view.innerHTML = "";
      const el = h(
        "<div>" +
        '<div class="stats">' +
        stat(mastered.length, t("statMastered")) + stat(learning.length, t("statLearning")) + stat(fresh.length, t("statNew")) +
        "</div>" +
        filterHTML(filter) +
        section(t("needsPractice"), learning, t("shownMore")) +
        section(t("notStarted"), fresh) +
        section(t("statMastered"), mastered) +
        '<p class="note">' + t("masteryNote", { n: Store.MASTERY_STREAK }) + "</p>" +
        '<button class="danger-link" data-act="reset">' + t("resetProgress") + "</button>" +
        "</div>"
      );
      view.appendChild(el);
      el.querySelectorAll("[data-filter]").forEach(function (b) {
        b.addEventListener("click", function () {
          filter = b.dataset.filter;
          Store.setting("progressFilter", filter);
          draw();
        });
      });
      bindRows(el);
      el.querySelector('[data-act="reset"]').addEventListener("click", function () {
        if (confirm(t("resetConfirm"))) {
          Store.resetProgress();
          toast(t("progressReset"));
          draw();
        }
      });
    }

    function stat(n, label) {
      return '<div class="stat"><div class="stat-num">' + n + '</div><div class="stat-label">' + label + "</div></div>";
    }

    function section(title, list, note) {
      if (!list.length) return "";
      return '<h2 class="section-title">' + title + " (" + list.length + ")</h2>" +
        (note ? '<p class="note note-tight">' + note + "</p>" : "") +
        '<div class="plant-list">' + list.map(plantRow).join("") + "</div>";
    }

    draw();
  }

  /* ================= Plant detail ================= */

  function renderPlant(id) {
    const p = BY_ID[id];
    if (!p) return go("progress");
    topTitle.textContent = isAr() ? p.ar : p.en;
    let miniMap = null;
    cleanup = function () { if (miniMap) miniMap.remove(); };

    function draw() {
      if (miniMap) { miniMap.remove(); miniMap = null; }
      const photos = photosOf(p);
      const st = Store.get(p.id);
      const spots = SPOTS.filter(function (s) { return s.plants.indexOf(p.id) >= 0; });
      const looks = lookalikesOf(p.id);
      view.innerHTML = "";
      const el = h(
        "<div>" +
        '<div class="detail-photos">' +
        photos.map(function (ph, k) {
          return '<div class="detail-photo"><div class="photo">' + imgHTML(ph.src, p.en, k === 0) + partLabel(ph) +
            (k === 0 ? '<span class="photo-tag">' + t(p.origin) + "</span>" : "") +
            "</div>" + creditHTML(ph) +
            (ph.mine ? '<button class="btn btn-soft btn-small del-btn" data-del="' + ph.key + '">' + t("deletePhoto") + "</button>" : "") +
            "</div>";
        }).join("") +
        "</div>" +
        (photos.length > 1 ? '<div class="strip-nav">' + navHTML(photos.length, 0) + "</div>" : "") +
        (photos.length > 1 ? '<div class="thumbs">' + photos.map(function (ph, k) {
          return '<button class="thumb' + (k === 0 ? " on" : "") + '" data-thumb="' + k + '">' + imgHTML(ph.src, "") + "</button>";
        }).join("") + "</div>" : "") +
        '<div class="detail-body">' +
        '<div class="photo-actions"><button class="btn btn-primary btn-small" data-act="add">' + t("addPhoto") + "</button></div>" +
        namesHTML(p) +
        '<div class="chips">' + originChip(p) + whereChips(p) + "</div>" +
        '<p class="fact"><b>' + t("funFact") + "</b> " + esc(fact(p)) + "</p>" +

        careHTML(p) +

        (spots.length || Store.myPhotos(p.id).some(function (m) { return m.loc; }) ?
          '<h3 class="section-title">' + t("whereRiyadh") + "</h3>" +
          '<div class="mini-map" id="miniMap"></div>' +
          '<div class="place-chips">' + spots.map(function (s) { return '<span class="chip">' + esc(placeName(s)) + "</span>"; }).join("") + "</div>" +
          '<p class="note">' + t("pinsNote") + ' <a href="#/map/' + p.id + '">' + t("openMap") + "</a></p>" : "") +

        (p.range ? '<h3 class="section-title">' + t("comesFrom") + "</h3>" +
          '<div class="range-card">' + rangeSVG(p) + '<p class="range-text">' + esc(t("nativeTo", { r: isAr() ? p.range.ar : p.range.en })) + "</p></div>" : "") +

        (looks.length ? '<h3 class="section-title">' + t("confusedWith") + "</h3>" + looks.map(function (x) { return lookCard(x.pair, p.id); }).join("") : "") +

        '<div class="stats stats-detail">' +
        '<div class="stat"><div class="stat-num">' + st.correct + '</div><div class="stat-label">' + t("correctStat") + "</div></div>" +
        '<div class="stat"><div class="stat-num">' + st.wrong + '</div><div class="stat-label">' + t("wrongStat") + "</div></div>" +
        '<div class="stat"><div class="stat-num" dir="ltr">' + Math.min(st.streak, 3) + '/3</div><div class="stat-label">' + (Store.isMastered(p.id) ? t("statMastered") : t("streak")) + "</div></div>" +
        "</div>" + sourcesHTML(p) + "</div></div>"
      );
      view.appendChild(el);

      // Photo strip + thumbnails
      const strip = el.querySelector(".detail-photos");
      const thumbs = el.querySelectorAll("[data-thumb]");
      thumbs.forEach(function (b) {
        b.addEventListener("click", function () {
          const k = +b.dataset.thumb;
          strip.scrollTo({ left: (isAr() ? -1 : 1) * k * strip.clientWidth, behavior: "smooth" });
        });
      });
      let cur = 0;
      function goPhoto(k) {
        cur = (k + photos.length) % photos.length;
        strip.scrollTo({ left: (isAr() ? -1 : 1) * cur * strip.clientWidth, behavior: "smooth" });
      }
      strip.addEventListener("scroll", function () {
        cur = Math.round(Math.abs(strip.scrollLeft) / strip.clientWidth);
        thumbs.forEach(function (b, j) { b.classList.toggle("on", j === cur); });
        const cnt = el.querySelector(".strip-nav .ph-count");
        if (cnt) cnt.textContent = (cur + 1) + " / " + photos.length;
      }, { passive: true });
      el.querySelectorAll(".strip-nav [data-nav]").forEach(function (b) {
        b.addEventListener("click", function () { goPhoto(cur + Number(b.dataset.nav)); });
      });

      el.querySelector('[data-act="add"]').addEventListener("click", function () {
        askForPhoto(p.id, function () {
          draw();
          const s = view.querySelector(".detail-photos");
          s.scrollTo({ left: (isAr() ? -1 : 1) * s.scrollWidth, behavior: "smooth" });
        });
      });
      el.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (!confirm(t("deleteConfirm"))) return;
          Store.removePhoto(p.id, Number(b.dataset.del)).then(function () { toast(t("photoDeleted")); draw(); });
        });
      });
      el.querySelectorAll("[data-plant]").forEach(function (b) {
        b.addEventListener("click", function () { go("plant/" + b.dataset.plant); });
      });

      // Mini map: the plant's places + your sightings. Not draggable, so the page still scrolls.
      const mm = el.querySelector("#miniMap");
      if (mm) {
        miniMap = makeMap(mm, { dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, zoomControl: false, tap: false });
        if (miniMap) {
          const pts = [];
          spots.forEach(function (s) {
            L.marker(s.at, { icon: spotIcon("") , keyboard: false }).addTo(miniMap).bindTooltip(placeName(s));
            pts.push(s.at);
          });
          Store.myPhotos(p.id).forEach(function (m) {
            if (!m.loc) return;
            L.marker([m.loc.lat, m.loc.lng], { icon: sightingIcon(m.url) }).addTo(miniMap);
            pts.push([m.loc.lat, m.loc.lng]);
          });
          if (pts.length > 1) miniMap.fitBounds(pts, { padding: [28, 28], maxZoom: 12, animate: false });
          else miniMap.setView(pts[0] || RIYADH, 11);
          mm.addEventListener("click", function () { go("map/" + p.id); });
        }
      }
    }

    draw();
  }

  /* ================= Care guide ================= */

  const MONTHS = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    ar: ["ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"]
  };
  const LEVEL = { low: 1, med: 2, high: 3 };

  function meter(level) {
    const n = LEVEL[level] || 0;
    return '<span class="meter" aria-hidden="true">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? "on" : "") + '"></i>'; }).join("") + "</span>";
  }

  function careRow(icon, label, value, extra) {
    return '<div class="care-row"><span class="care-ico" aria-hidden="true">' + icon + '</span><span class="care-label">' + label +
      '</span><span class="care-val">' + (extra || "") + value + "</span></div>";
  }

  function careHTML(p) {
    const c = window.CARE && CARE[p.id];
    if (!c) return "";
    const tl = isAr() ? "ar" : "en";
    const bloom = '<div class="bloom" dir="ltr">' + MONTHS[tl].map(function (m, i) {
      return '<span class="' + (c.bloom.indexOf(i + 1) >= 0 ? "on" : "") + '">' + m + "</span>";
    }).join("") + "</div>";
    let types = "";
    const tlist = typeof c.types === "string" ? (CARE[c.types] && CARE[c.types].types) : c.types;
    if (tlist) {
      types = '<h3 class="section-title">' + t("typesTitle") + '</h3><div class="types">' + tlist.map(function (x) {
        const link = x.id && x.id !== p.id && BY_ID[x.id];
        const here = x.id === p.id;
        return '<div class="type-item' + (here ? " here" : "") + '">' + (link ? '<img src="' + mainPhoto(BY_ID[x.id]) + '" alt="">' : "") +
          "<p>" + esc(x[tl]) + (link ? ' <a href="#/plant/' + x.id + '">' + t("openPage") + "</a>" : "") + "</p></div>";
      }).join("") + "</div>";
    }
    return '<h3 class="section-title">' + t("careTitle") + "</h3>" +
      '<div class="care-card">' +
      careRow("☀️", t("c.sun"), t("sun." + c.sun)) +
      careRow("💧", t("c.water"), t("lvl." + c.water), meter(c.water)) +
      careRow("🧂", t("c.salt"), t("lvl." + c.salt), meter(c.salt)) +
      careRow("🌱", t("c.roots"), t("roots." + c.roots)) +
      careRow("🪴", t("c.soil"), t("soil." + c.soil) + " · " + t("ph." + c.ph)) +
      careRow("📏", t("c.height"), '<bdi dir="ltr">' + esc(c.h) + "</bdi> · " + t("growth." + c.growth)) +
      careRow("✂️", t("c.prop"), c.prop.map(function (x) { return t("prop." + x); }).join(isAr() ? "، " : ", ")) +
      '<div class="care-row care-bloom"><span class="care-ico" aria-hidden="true">🌸</span><span class="care-label">' + t("c.bloom") + "</span>" +
      (c.bloom.length ? bloom : '<span class="care-val">' + t("noFlowers") + "</span>") + "</div>" +
      '<p class="care-tip">' + esc(c.tip[tl]) + "</p>" +
      (c.warn ? '<p class="care-warn">⚠️ ' + esc(c.warn[tl]) + "</p>" : "") +
      "</div>" + types;
  }

  function sourcesHTML(p) {
    const sci = p.sci.replace(/\s*\(.*\)$/, "");
    const q = encodeURIComponent(sci);
    const links = [
      ["Wikipedia", "https://en.wikipedia.org/wiki/" + encodeURIComponent(sci.replace(/ /g, "_"))],
      ["ويكيبيديا العربية", "https://ar.wikipedia.org/w/index.php?search=" + encodeURIComponent(p.ar.split(" / ")[0])],
      ["Kew – Plants of the World Online", "https://powo.science.kew.org/results?q=" + q],
      ["GBIF", "https://www.gbif.org/species/search?q=" + q]
    ];
    return '<h3 class="section-title">' + t("readMore") + '</h3><div class="sources">' +
      links.map(function (l) { return '<a class="source-link" href="' + l[1] + '" target="_blank" rel="noopener">' + l[0] + " ↗</a>"; }).join("") +
      '</div><p class="note">' + t("sourcesNote") + ' <a href="#/wiki/about">' + t("sourcesList") + "</a></p>";
  }

  /* ================= Plant wiki (gallery) ================= */

  function renderWiki(sub) {
    topTitle.textContent = t("wiki");
    if (sub === "about") return renderSources();
    let filter = "all", q = "";
    const el = h(
      '<div><input class="search" type="search" placeholder="' + t("searchPh") + '" aria-label="' + t("searchPh") + '">' +
      filterHTML(filter) + '<p class="note wiki-count"></p><div class="wiki-grid"></div>' +
      '<p class="note"><a href="#/wiki/about">' + t("sourcesList") + "</a></p></div>"
    );
    view.appendChild(el);
    const grid = el.querySelector(".wiki-grid");
    function norm(s) { return String(s).toLowerCase().replace(/[\u064B-\u0652]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي"); }
    function draw() {
      const list = filtered(filter).filter(function (p) {
        if (!q) return true;
        return norm(p.en + " " + p.ar + " " + p.sci).indexOf(norm(q)) >= 0;
      }).slice().sort(function (a, b) { return isAr() ? a.ar.localeCompare(b.ar, "ar") : a.en.localeCompare(b.en); });
      el.querySelector(".wiki-count").textContent = t("plantsCount", { n: list.length });
      grid.innerHTML = list.map(function (p) {
        const c = CARE[p.id] || {};
        return '<button class="wiki-card" data-plant="' + p.id + '"><div class="photo">' + imgHTML(mainPhoto(p), p.en) + "</div>" +
          '<span class="wiki-name">' + esc(isAr() ? p.ar : p.en) + '</span><span class="wiki-sub">' + esc(isAr() ? p.en : p.ar) + "</span>" +
          '<span class="wiki-icons">' + (c.sun ? '<span title="' + esc(t("sun." + c.sun)) + '">' + (c.sun === "part" ? "⛅" : c.sun === "fullpart" ? "🌤️" : "☀️") + "</span>" : "") +
          (c.water ? '<span title="' + esc(t("lvl." + c.water)) + '">' + (c.water === "low" ? "💧" : c.water === "med" ? "💧💧" : "💧💧💧") + "</span>" : "") + "</span></button>";
      }).join("");
      grid.querySelectorAll("[data-plant]").forEach(function (b) {
        b.addEventListener("click", function () { go("plant/" + b.dataset.plant); });
      });
    }
    el.querySelector(".search").addEventListener("input", function (e) { q = e.target.value.trim(); draw(); });
    el.querySelectorAll("[data-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.dataset.filter;
        el.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw();
      });
    });
    draw();
  }

  function renderSources() {
    topTitle.textContent = t("sourcesList");
    const refs = [
      ["Royal Botanic Gardens, Kew – Plants of the World Online", "https://powo.science.kew.org/", "names, native ranges"],
      ["Royal Horticultural Society (RHS) – Plants", "https://www.rhs.org.uk/plants", "sun, soil, pruning"],
      ["Missouri Botanical Garden – Plant Finder", "https://www.missouribotanicalgarden.org/plantfinder/plantfindersearch.aspx", "culture, water, maintenance"],
      ["UF/IFAS Extension (University of Florida) – Gardening Solutions", "https://gardeningsolutions.ifas.ufl.edu/", "tropical ornamentals, salt tolerance, fertilizing"],
      ["FAO – Date palm cultivation", "https://www.fao.org/3/y4360e/y4360e00.htm", "date palm care"],
      ["Chaudhary, S. A. (1999–2001) Flora of the Kingdom of Saudi Arabia", "", "native plants"],
      ["Collenette, S. (1999) Wildflowers of Saudi Arabia", "", "native plants, flowering"],
      ["Ministry of Environment, Water & Agriculture (MEWA)", "https://www.mewa.gov.sa/", "native plants, tree-cutting rules"],
      ["Wikipedia / Wikimedia Commons", "https://www.wikipedia.org/", "overview, photos"]
    ];
    view.appendChild(h('<div><p class="intro">' + t("sourcesIntro") + '</p><ul class="ref-list">' + refs.map(function (r) {
      return "<li>" + (r[1] ? '<a href="' + r[1] + '" target="_blank" rel="noopener">' + esc(r[0]) + "</a>" : "<b>" + esc(r[0]) + "</b>") + '<span class="note"> — ' + esc(r[2]) + "</span></li>";
    }).join("") + "</ul></div>"));
  }

  function lookCard(pair, currentId) {
    const a = BY_ID[pair.a], b = BY_ID[pair.b];
    const side = function (p) {
      return '<button class="look-side' + (p.id === currentId ? " current" : "") + '" data-plant="' + p.id + '">' +
        '<div class="photo">' + imgHTML(mainPhoto(p), p.en) + "</div>" +
        '<span class="look-name">' + esc(isAr() ? p.ar : p.en) + '</span><span class="look-sub">' + esc(isAr() ? p.en : p.ar) + "</span></button>";
    };
    return '<div class="look-card"><div class="look-pair">' + side(a) + '<span class="look-vs">vs</span>' + side(b) + "</div>" +
      '<p class="look-tip">' + esc(isAr() ? pair.ar : pair.en) + "</p></div>";
  }

  /* ================= Look-alikes ================= */

  function renderLook() {
    topTitle.textContent = t("lookalikes");
    const el = h('<div><p class="intro">' + t("lookIntro") + "</p>" + LOOKALIKES.map(function (l) { return lookCard(l, null); }).join("") + "</div>");
    view.appendChild(el);
    el.querySelectorAll("[data-plant]").forEach(function (b) {
      b.addEventListener("click", function () { go("plant/" + b.dataset.plant); });
    });
  }

  /* ================= Map ================= */

  function renderMap(plantId) {
    topTitle.textContent = t("map");
    const focus = plantId && BY_ID[plantId] ? BY_ID[plantId] : null;
    let filter = focus ? "all" : Store.setting("mapFilter") || "all";
    let showSightings = Store.setting("mapSightings") !== false;
    let map = null, layer = null;
    const markers = {};
    cleanup = function () { if (map) map.remove(); };

    const el = h(
      '<div class="map-page">' +
      (focus
        ? '<div class="focus-bar"><span>' + esc(t("showing", { name: isAr() ? focus.ar : focus.en })) + '</span><button class="btn btn-soft btn-small" data-act="clear">' + t("clear") + "</button></div>"
        : filterHTML(filter)) +
      '<label class="toggle"><input type="checkbox" id="sightToggle"' + (showSightings ? " checked" : "") + "> " +
      '<span>' + t("mySightings") + ' (<span id="sightCount">' + Store.sightings().length + "</span>)</span></label>" +
      '<div class="big-map" id="bigMap"></div>' +
      '<p class="note">' + t("pinsNote") + "</p>" +
      '<h3 class="section-title">' + t("placesTitle") + '</h3><div class="places" id="places"></div>' +
      "</div>"
    );
    view.appendChild(el);

    if (focus) el.querySelector('[data-act="clear"]').addEventListener("click", function () { go("map"); });
    el.querySelectorAll("[data-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.dataset.filter;
        Store.setting("mapFilter", filter);
        el.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        drawMarkers();
      });
    });
    el.querySelector("#sightToggle").addEventListener("change", function (e) {
      showSightings = e.target.checked;
      Store.setting("mapSightings", showSightings);
      drawMarkers();
    });

    map = makeMap(el.querySelector("#bigMap"), { tap: false });
    if (map) {
      layer = L.layerGroup().addTo(map);
      map.setView(RIYADH, 9);
    }

    function plantsAt(s) {
      return s.plants.map(function (id) { return BY_ID[id]; }).filter(function (p) {
        if (focus) return p.id === focus.id;
        return filter === "all" || p.origin === filter;
      });
    }

    function drawMarkers() {
      const places = el.querySelector("#places");
      places.innerHTML = "";
      if (layer) layer.clearLayers();
      const pts = [];
      SPOTS.forEach(function (s) {
        const plants = plantsAt(s);
        if (!plants.length) return;
        if (layer) {
          markers[s.id] = L.marker(s.at, { icon: spotIcon(plants.length), title: placeName(s) })
            .bindPopup(spotPopup(s, plants), { maxWidth: 260, minWidth: 200 })
            .addTo(layer);
        }
        pts.push(s.at);
        const card = h(
          '<button class="place-card" data-spot="' + s.id + '">' +
          '<span class="place-head"><span class="place-name">' + esc(placeName(s)) + '</span><span class="place-count">' + t("plantsHere", { n: plants.length }) + "</span></span>" +
          '<span class="place-thumbs">' + plants.map(function (p) { return '<img src="' + mainPhoto(p) + '" alt="' + esc(p.en) + '" loading="lazy">'; }).join("") + "</span>" +
          "</button>"
        );
        card.addEventListener("click", function () {
          if (!map) return;
          window.scrollTo({ top: 0, behavior: "smooth" });
          map.flyTo(s.at, 12, { duration: 0.8 });
          setTimeout(function () { markers[s.id].openPopup(); }, 850);
        });
        places.appendChild(card);
      });

      const sights = Store.sightings().filter(function (sg) { return !focus || sg.plant === focus.id; });
      if (showSightings) {
        sights.forEach(function (sg) {
          if (layer) L.marker([sg.loc.lat, sg.loc.lng], { icon: sightingIcon(sg.url) }).bindPopup(sightingPopup(sg)).addTo(layer);
          pts.push([sg.loc.lat, sg.loc.lng]);
        });
      }
      const empty = el.querySelector(".no-sight");
      if (empty) empty.remove();
      if (showSightings && !Store.sightings().length) {
        el.querySelector(".toggle").insertAdjacentHTML("afterend", '<p class="note no-sight">' + t("noSightings") + "</p>");
      }
      if (map && pts.length) map.fitBounds(pts, { padding: [30, 30], maxZoom: 12, animate: false });
    }

    drawMarkers();
  }

  /* ================= Confetti ================= */

  let confettiRAF = 0;

  function stopConfetti() {
    cancelAnimationFrame(confettiRAF);
    const c = document.getElementById("confetti");
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  }

  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.getElementById("confetti");
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#5f7a3a", "#a5bf70", "#c9a86a", "#e8d5a8", "#d98b5f", "#f2c14e"];
    const parts = [];
    for (let k = 0; k < 110; k++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 80,
        y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 9 - 4,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: pick(colors),
        leaf: Math.random() < 0.4
      });
    }
    const t0 = performance.now();
    cancelAnimationFrame(confettiRAF);
    (function frame(now) {
      const age = (now - t0) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, age - 1.8) / 1.2);
      parts.forEach(function (q) {
        q.vy += 0.22; q.vx *= 0.99; q.x += q.vx; q.y += q.vy; q.r += q.vr;
        ctx.save();
        ctx.translate(q.x, q.y); ctx.rotate(q.r);
        ctx.fillStyle = q.color;
        if (q.leaf) {
          ctx.beginPath(); ctx.ellipse(0, 0, q.w * 0.8, q.h * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
        }
        ctx.restore();
      });
      if (age < 3) confettiRAF = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ================= Theme ================= */

  function applyTheme() {
    const th = Store.setting("theme");
    if (th) document.documentElement.setAttribute("data-theme", th);
    else document.documentElement.removeAttribute("data-theme");
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute("content", isDark() ? "#1b1e16" : "#f4ecdc");
      m.removeAttribute("media");
    });
  }

  themeBtn.addEventListener("click", function () {
    Store.setting("theme", isDark() ? "light" : "dark");
    applyTheme();
    // Maps pick their tile style when drawn, so redraw map views.
    if (/^#\/(map|plant)/.test(location.hash)) route();
  });

  /* ================= Start ================= */

  applyTheme();
  applyLang();
  window.addEventListener("hashchange", route);
  Store.loadPhotos().then(route);

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
