/*
 * Everything that is saved in the browser:
 *  - learning progress + settings in localStorage
 *  - the learner's own photos in IndexedDB (they are too big for localStorage)
 */
window.Store = (function () {
  const KEY = "riyadh-plants:v1";
  const MASTERY_STREAK = 3;

  let state = load();

  function load() {
    let s;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    s = s && typeof s === "object" ? s : {};
    s.progress = s.progress || {};
    s.settings = s.settings || {};
    return s;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function blank() {
    return { streak: 0, correct: 0, wrong: 0, known: 0, learning: 0, last: 0 };
  }

  function get(id) {
    return Object.assign(blank(), state.progress[id]);
  }

  function put(id, p) {
    p.last = Date.now();
    state.progress[id] = p;
    save();
  }

  /* ---------- Progress ---------- */

  // Returns true if this answer made the plant newly mastered.
  function recordQuiz(id, ok) {
    const p = get(id);
    const was = p.streak >= MASTERY_STREAK;
    if (ok) { p.correct++; p.streak++; } else { p.wrong++; p.streak = 0; }
    put(id, p);
    return !was && p.streak >= MASTERY_STREAK;
  }

  function recordCard(id, known) {
    const p = get(id);
    if (known) p.known++; else p.learning++;
    put(id, p);
  }

  function isMastered(id) { return get(id).streak >= MASTERY_STREAK; }

  function isSeen(id) {
    const p = get(id);
    return p.correct + p.wrong + p.known + p.learning > 0;
  }

  // Higher weight = shown more often. Plants you miss float to the top,
  // new plants come next, mastered plants still appear now and then.
  function weight(id) {
    const p = get(id);
    if (!isSeen(id)) return 2.5;
    const hits = p.correct + p.known * 0.5;
    const misses = p.wrong + p.learning * 0.5;
    const missRate = (misses + 1) / (hits + misses + 2);
    let w = 0.4 + missRate * 5;
    if (p.streak === 0 && p.wrong > 0) w += 1.5; // got it wrong last time
    if (p.streak >= MASTERY_STREAK) w *= 0.25;
    return w;
  }

  function resetProgress() {
    state.progress = {};
    save();
  }

  /* ---------- Settings ---------- */

  function setting(k, v) {
    if (v === undefined) return state.settings[k];
    state.settings[k] = v;
    save();
  }

  /* ---------- My photos (IndexedDB) ---------- */

  const DB_NAME = "riyadh-plants";
  let dbPromise = null;
  const photoCache = {}; // plantId -> [{ key, url }]

  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) return reject(new Error("No IndexedDB"));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        const os = req.result.createObjectStore("photos", { keyPath: "key", autoIncrement: true });
        os.createIndex("plant", "plant");
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        const t = d.transaction("photos", mode);
        const r = fn(t.objectStore("photos"));
        t.oncomplete = function () { resolve(r && r.result); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error); };
      });
    });
  }

  function loadPhotos() {
    return tx("readonly", function (os) { return os.getAll(); }).then(function (rows) {
      (rows || []).forEach(function (row) {
        (photoCache[row.plant] = photoCache[row.plant] || []).push({ key: row.key, url: URL.createObjectURL(row.blob) });
      });
    }).catch(function () { /* photos unavailable, e.g. private mode */ });
  }

  function myPhotos(id) { return photoCache[id] || []; }

  function addPhoto(id, blob) {
    return tx("readwrite", function (os) { return os.add({ plant: id, blob: blob, added: Date.now() }); })
      .then(function (key) {
        const item = { key: key, url: URL.createObjectURL(blob) };
        (photoCache[id] = photoCache[id] || []).push(item);
        return item;
      });
  }

  function removePhoto(id, key) {
    return tx("readwrite", function (os) { return os.delete(key); }).then(function () {
      const list = photoCache[id] || [];
      const i = list.findIndex(function (p) { return p.key === key; });
      if (i >= 0) { URL.revokeObjectURL(list[i].url); list.splice(i, 1); }
    });
  }

  // Ask the browser not to clear our data when space runs low.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(function () {});
  }

  return {
    MASTERY_STREAK: MASTERY_STREAK,
    get: get,
    recordQuiz: recordQuiz,
    recordCard: recordCard,
    isMastered: isMastered,
    isSeen: isSeen,
    weight: weight,
    resetProgress: resetProgress,
    setting: setting,
    loadPhotos: loadPhotos,
    myPhotos: myPhotos,
    addPhoto: addPhoto,
    removePhoto: removePhoto
  };
})();
