/* Offline support: the app and main photos are cached on first visit;
   extra photos and map tiles are cached as you view them. */
const VERSION = "v5";
const TILE_CACHE = "riyadh-plants-tiles";
const MAX_TILES = 400;
const CACHE = "riyadh-plants-" + VERSION;
const ASSETS = [
  "./",
  "index.html",
  "css/style.css",
  "js/data.js",
  "js/credits.js",
  "js/i18n.js",
  "js/world.js",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css",
  "js/store.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "images/date-palm.jpg",
  "images/sidr.jpg",
  "images/samur.jpg",
  "images/talh.jpg",
  "images/arak.jpg",
  "images/ghada.jpg",
  "images/rimth.jpg",
  "images/arfaj.jpg",
  "images/athel.jpg",
  "images/harmal.jpg",
  "images/conocarpus.jpg",
  "images/neem.jpg",
  "images/washingtonia.jpg",
  "images/ficus.jpg",
  "images/mesquite.jpg",
  "images/parkinsonia.jpg",
  "images/bougainvillea.jpg",
  "images/oleander.jpg",
  "images/jasmine.jpg",
  "images/hibiscus.jpg",
  "images/lantana.jpg",
  "images/texas-sage.jpg",
  "images/desert-rose.jpg",
  "images/aloe-vera.jpg",
  "images/moringa.jpg",
  "images/olive.jpg",
  "images/pomegranate.jpg",
  "images/fig.jpg",
  "images/lemon.jpg",
  "images/mint.jpg",
  "images/awsaj.jpg",
  "images/markh.jpg",
  "images/arta.jpg",
  "images/ushar.jpg",
  "images/hanzal.jpg",
  "images/nussi.jpg",
  "images/thumam.jpg",
  "images/qaysoom.jpg",
  "images/salam.jpg",
  "images/sarh.jpg",
  "images/dhanoon.jpg",
  "images/humaidh.jpg",
  "images/sadan.jpg",
  "images/albizia.jpg",
  "images/tecoma.jpg",
  "images/dodonaea.jpg",
  "images/casuarina.jpg",
  "images/eucalyptus.jpg",
  "images/duranta.jpg",
  "images/periwinkle.jpg",
  "images/basil.jpg",
  "images/henna.jpg",
  "images/grape.jpg",
  "images/mulberry.jpg",
  "images/guava.jpg",
  "images/thayyil.jpg",
  "images/alfalfa.jpg",
  "images/shih.jpg",
  "images/kaff.jpg",
  "images/clerodendrum.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("riyadh-plants-") && k !== CACHE && k !== TILE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const isTile = url.hostname === "tile.openstreetmap.org";

  // Map tiles: cache the ones you've looked at so the map partly works offline.
  if (isTile) {
    e.respondWith(
      caches.open(TILE_CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === "opaque") {
          c.put(req, res.clone());
          c.keys().then((keys) => { if (keys.length > MAX_TILES) keys.slice(0, keys.length - MAX_TILES).forEach((k) => c.delete(k)); });
        }
        return res;
      })))
    );
    return;
  }
  if (!sameOrigin && !isFont) return;

  // App code: network first so updates show up, cache as fallback when offline.
  if (sameOrigin && (req.mode === "navigate" || /\.(html|js|css|webmanifest)$/.test(url.pathname))) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  // Photos, icons, fonts: cache first.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
