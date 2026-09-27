# Riyadh Plants 🌿

A small, mobile-first web app for learning the plants of Riyadh: the English name, the Arabic name, and how to recognise each one from its photo.

**Open it:** https://sha3abdullah.github.io/riyadh-plants-app/

## What's inside

- **Flashcards.** A photo on the front. Tap to flip and see the English and Arabic names, the scientific name, native or introduced, and a fun fact. Swipe right for *I know it* and left for *Still learning*, or use the buttons. You can filter by All, Native or Introduced.
- **Quiz.** 10 questions per round, mixing photo → English, photo → Arabic and English → Arabic. Right and wrong answers show instantly, the correct answer and photo appear when you miss, and you get a score screen at the end (with confetti for 8/10 or more).
- **My Progress.** A plant counts as mastered after 3 correct quiz answers in a row. Plants you get wrong come up more often.
- **Add photo.** Every plant card has an *Add photo* button so you can save your own photo from your phone. It's stored on your device and shown next to the downloaded one.
- Light and dark mode, installable on your home screen, and works offline after the first visit.
- Nothing to sign up for. Progress and your photos stay in your browser on your phone.

## Install on your phone

- **iPhone (Safari):** open the link, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the link, tap **⋮**, then **Install app** (or **Add to Home screen**).

## Adding plants or cities

1. Add an entry to `js/data.js` (in the city's `plants` list, or a new city under `CITIES`).
2. Put the Commons file name for its photo in `tools/photos.json`, keyed by the plant's `id`.
3. Run `pip install pillow` and then `python3 tools/fetch_photos.py <id>`. This downloads the photo, resizes it to 800px wide, saves it as `images/<id>.jpg`, and updates `js/credits.js` and `CREDITS.md`.
4. Add `images/<id>.jpg` to the `ASSETS` list in `sw.js` and bump `VERSION` so phones pick up the change.

## Photo credits

All photos come from Wikimedia Commons under free licenses. See [CREDITS.md](CREDITS.md). Each photo's credit is also shown under it in the app.

## Files

```
index.html            app shell
css/style.css         styles (sand + olive theme, light/dark)
js/data.js            plant data, grouped by city
js/credits.js         photo credits (generated)
js/store.js           progress (localStorage) + your photos (IndexedDB)
js/app.js             flashcards, quiz, progress, plant pages
sw.js                 offline cache
manifest.webmanifest  home-screen install
images/               plant photos, 800px wide
tools/                photo download script
```
