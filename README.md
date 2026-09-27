# Riyadh Plants 🌿

A small, mobile-first web app for learning the plants of Riyadh: the English name, the Arabic name, and how to recognise each one from its photo.

**Open it:** https://sha3abdullah.github.io/riyadh-plants-app/

## What's inside

- **Flashcards.** A photo on the front. Tap to flip and see the English and Arabic names, the scientific name, native or introduced, and a fun fact. Swipe right for *I know it* and left for *Still learning*, or use the buttons. You can filter by All, Native or Introduced.
- **Quiz.** 10 questions per round, mixing photo → English, photo → Arabic and English → Arabic. Right and wrong answers show instantly, the correct answer and photo appear when you miss, and you get a score screen at the end (with confetti for 8/10 or more).
- **English / العربية.** Tap **ع** at the top to switch the whole app to Arabic (right-to-left). Tap **EN** to switch back.
- **Listen.** 🔊 buttons read the English, Arabic and scientific names aloud using your phone's built-in voices. Each scientific name also has a written pronunciation guide (e.g. *ZIZ-i-fus SPY-nuh KRIS-tee*).
- **More photos.** Most plants have several labelled photos (whole plant, leaves, flowers, fruit…). Swipe or tap the thumbnails on a plant's page.
- **Look-alikes.** Side-by-side comparisons of plants that are easy to mix up (Samur vs Talh, Ghada vs Rimth, Date palm vs Washingtonia…) with a tip for telling them apart. Quizzes also use look-alikes as wrong answers.
- **Map.** A map of Riyadh showing places where each plant is commonly seen (Wadi Hanifa, Rawdat Khuraim, Al-Thumamah, Al-Salam Park…). Each plant's page has its own small map.
- **Where it comes from.** A small world map on each plant's page highlighting its native range, with Riyadh marked.
- **My sightings.** When you add your own photo, the app uses the location saved in the photo (or asks to use your current location) and pins it on your sightings map.
- **My Progress.** A plant counts as mastered after 3 correct quiz answers in a row. Plants you get wrong come up more often.
- **Add photo.** Every plant card has an *Add photo* button so you can save your own photo from your phone. It's stored on your device and shown next to the downloaded one.
- Light and dark mode, installable on your home screen, and works offline after the first visit.
- Nothing to sign up for. Progress and your photos stay in your browser on your phone.

## Install on your phone

- **iPhone (Safari):** open the link, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the link, tap **⋮**, then **Install app** (or **Add to Home screen**).

## Adding plants or cities

1. Add an entry to `js/data.js` (in the city's `plants` list, or a new city under `CITIES`), including `factAr`, `say` and `range`. Add it to at least one place in `spots`.
2. List its Commons photos in `tools/photos.json`, keyed by the plant's `id` (the first one is the main photo).
3. Run `pip install pillow` and then `python3 tools/fetch_photos.py`. This downloads missing photos, resizes them to 800px wide, and updates `js/credits.js` and `CREDITS.md`.
4. Add `images/<id>.jpg` to the `ASSETS` list in `sw.js` and bump `VERSION` so phones pick up the change.

## Maps

Map tiles come from [OpenStreetMap](https://www.openstreetmap.org/copyright) and need an internet connection (tiles you've already viewed are cached). Map pins mark areas where a plant is commonly seen, not exact plants. The world map uses public-domain Natural Earth data.

## Photo credits

All photos come from Wikimedia Commons under free licenses. See [CREDITS.md](CREDITS.md). Each photo's credit is also shown under it in the app.

## Files

```
index.html            app shell
css/style.css         styles (sand + olive theme, light/dark)
js/data.js            plant data, places and look-alikes, grouped by city
js/i18n.js            interface text in English and Arabic
js/world.js           offline world map for native ranges (generated)
vendor/leaflet/       map library (Leaflet 1.9.4)
js/credits.js         photo credits (generated)
js/store.js           progress (localStorage) + your photos (IndexedDB)
js/app.js             flashcards, quiz, progress, plant pages
sw.js                 offline cache
manifest.webmanifest  home-screen install
images/               plant photos, 800px wide
tools/                photo download + logo scripts
```
