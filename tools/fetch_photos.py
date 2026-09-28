#!/usr/bin/env python3
"""Download plant photos from Wikimedia Commons, resize to 800px wide,
and regenerate js/credits.js + CREDITS.md.

tools/photos.json maps plant id -> list of {"file": <Commons file name>, "part": <what it shows>}.
The first photo is saved as images/<id>.jpg (the main photo), the rest as images/<id>-2.jpg, -3.jpg ...
part: whole, tree, shrub, leaves, stems, flowers, fruit, pods, bark, thorns, habitat

Usage: python3 tools/fetch_photos.py              # download anything missing
       python3 tools/fetch_photos.py sidr fig     # re-download these plants
       python3 tools/fetch_photos.py --rebuild    # only rewrite js/credits.js and CREDITS.md
Requires Pillow (pip install pillow).
"""
import html, io, json, os, re, sys, time, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "RiyadhPlantsApp/1.0 (https://github.com/sha3abdullah/riyadh-plants-app) python-urllib"
API = "https://commons.wikimedia.org/w/api.php"
WIDTH = 800

# Some Commons "Artist" fields hold a paragraph of text; use a short name instead.
AUTHOR_FIX = {
    "Fruit_of_Conocarpus_lancifolius.jpg": "Matthew Smith",
    "700_yr_red_river_gum.jpg": "fir0002 (flagstaffotos)",
    "09-06-2017_Oleander_(Nerium_oleander)_Arade_river,_Águas_Frias_de_Baixo,_Alte.JPG": "Kolforn",
}


def get(url, tries=12):
    delay = 3
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(delay)
                delay = min(delay * 2, 90)
                continue
            raise RuntimeError(f"HTTP {e.code} for {url}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Blocked or unreachable: {urllib.parse.urlparse(url).netloc} ({e.reason})")
    raise RuntimeError(f"Gave up after rate limiting: {url}")


def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def info(files):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": 960,
        "titles": "|".join("File:" + f for f in files),
    })
    j = json.loads(get(API + "?" + q))
    norm = {n["to"]: n["from"] for n in j["query"].get("normalized", [])}
    out = {}
    for p in j["query"]["pages"].values():
        if "imageinfo" not in p:
            raise RuntimeError(f"Missing file on Commons: {p['title']}")
        out[norm.get(p["title"], p["title"])[5:]] = p["imageinfo"][0]
    return out


def src_for(pid, n):
    return f"images/{pid}.jpg" if n == 0 else f"images/{pid}-{n + 1}.jpg"


def main():
    args = sys.argv[1:]
    rebuild = "--rebuild" in args
    only = [a for a in args if not a.startswith("--")]
    photos = json.load(open(os.path.join(ROOT, "tools", "photos.json")))
    credits_path = os.path.join(ROOT, "tools", "credits.json")
    credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}

    # Work out which photos need downloading.
    todo = []
    for pid, items in photos.items():
        have = {c["file"]: c for c in credits.get(pid, [])}
        for n, it in enumerate(items):
            src = src_for(pid, n)
            done = it["file"] in have and have[it["file"]]["src"] == src and os.path.exists(os.path.join(ROOT, src))
            if not rebuild and (pid in only or not done):
                todo.append((pid, n, it))

    for k in range(0, len(todo), 20):
        chunk = todo[k:k + 20]
        meta = info([it["file"] for _, _, it in chunk])
        for pid, n, it in chunk:
            ii = meta[it["file"]]
            em = ii.get("extmetadata", {})
            img = Image.open(io.BytesIO(get(ii.get("thumburl") or ii["url"]))).convert("RGB")
            if img.width > WIDTH:
                img = img.resize((WIDTH, round(img.height * WIDTH / img.width)), Image.LANCZOS)
            src = src_for(pid, n)
            img.save(os.path.join(ROOT, src), "JPEG", quality=80, optimize=True, progressive=True)
            entry = {
                "src": src,
                "part": it["part"],
                "file": it["file"],
                "author": AUTHOR_FIX.get(it["file"]) or strip_tags(em.get("Artist", {}).get("value")) or "Unknown",
                "license": strip_tags(em.get("LicenseShortName", {}).get("value")) or "See source",
                "licenseUrl": em.get("LicenseUrl", {}).get("value", ""),
                "source": ii["descriptionurl"],
            }
            lst = [c for c in credits.get(pid, []) if c["src"] != src]
            lst.append(entry)
            credits[pid] = lst
            print(f"ok  {src:28} {img.width}x{img.height}  {entry['license']}  {it['file']}", flush=True)
            json.dump(credits, open(credits_path, "w"), indent=1, ensure_ascii=False)
            time.sleep(1)

    # Keep credits in the same order as photos.json, dropping anything no longer used.
    out = {}
    for pid, items in photos.items():
        by_src = {c["src"]: c for c in credits.get(pid, [])}
        out[pid] = [dict(by_src[src_for(pid, n)], part=it["part"]) for n, it in enumerate(items) if src_for(pid, n) in by_src]
    json.dump(out, open(credits_path, "w"), indent=1, ensure_ascii=False)

    with open(os.path.join(ROOT, "js", "credits.js"), "w") as fh:
        fh.write("/* Generated by tools/fetch_photos.py. Do not edit by hand. */\n")
        fh.write("window.PHOTO_CREDITS = " + json.dumps(out, indent=1, ensure_ascii=False) + ";\n")
    with open(os.path.join(ROOT, "CREDITS.md"), "w") as fh:
        fh.write("# Photo credits\n\nAll plant photos come from [Wikimedia Commons](https://commons.wikimedia.org) "
                 "under free licenses. They were resized to 800px wide. Nothing else was changed.\n\n"
                 "| Plant | Shows | Photo | Author | License |\n|---|---|---|---|---|\n")
        for pid, lst in out.items():
            for c in lst:
                lic = f"[{c['license']}]({c['licenseUrl']})" if c["licenseUrl"] else c["license"]
                author = c["author"].replace("|", "/").replace("\n", " ")
                fh.write(f"| {pid} | {c['part']} | [{c['file']}]({c['source']}) | {author} | {lic} |\n")
    print("credits written:", sum(len(v) for v in out.values()), "photos")


if __name__ == "__main__":
    main()
