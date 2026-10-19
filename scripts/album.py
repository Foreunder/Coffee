#!/usr/bin/env python3
"""Add photos to the Foreunder photo album (album/album.json + album/photos/).

    python3 scripts/album.py PHOTO_OR_FOLDER [...] [--place "Edinburgh, Scotland"] [--date 2026-09-14] [--caption "..."]

For each photo:
  - date comes from the camera (EXIF DateTimeOriginal); --date fills it in when the photo has none
  - place comes from the GPS tag, reduced to the nearest town ("Omaha, Nebraska"); --place overrides
  - the published copy is resized for a TV, rotated upright, and has ALL metadata stripped
    (no GPS coordinates or camera data ever reach the public site)
  - a photo already in the album (same original bytes) is skipped, and hand edits to album.json are kept
"""
import argparse, csv, gzip, hashlib, io, json, math, os, sys
from datetime import datetime
from PIL import Image, ImageOps
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except ImportError:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALBUM = os.path.join(ROOT, "album")
PHOTOS = os.path.join(ALBUM, "photos")
MANIFEST = os.path.join(ALBUM, "album.json")
CITIES = os.path.join(ROOT, "scripts", "data", "cities1000.csv.gz")
EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"}
LONG_EDGE = 2048

_cities = None
def nearest_place(lat, lon):
    global _cities
    if _cities is None:
        with gzip.open(CITIES, "rt", encoding="utf-8") as f:
            _cities = [(float(r["lat"]), float(r["lon"]), r["name"], r["admin1"], r["cc"]) for r in csv.DictReader(f)]
    best, bd = None, 1e18
    cl = math.cos(math.radians(lat))
    for la, lo, name, a1, cc in _cities:
        d = (la - lat) ** 2 + ((lo - lon) * cl) ** 2
        if d < bd: bd, best = d, (name, a1, cc)
    name, a1, cc = best
    return f"{name}, {a1}" if a1 else name

def gps(exif):
    g = exif.get_ifd(0x8825)
    if not g or 2 not in g or 4 not in g: return None
    def deg(v): return float(v[0]) + float(v[1]) / 60 + float(v[2]) / 3600
    lat, lon = deg(g[2]), deg(g[4])
    if g.get(1) == "S": lat = -lat
    if g.get(3) == "W": lon = -lon
    return lat, lon

def taken(exif):
    sub = exif.get_ifd(0x8769)
    for v in (sub.get(36867), sub.get(36868), exif.get(306)):
        if v:
            try: return datetime.strptime(str(v).strip()[:19], "%Y:%m:%d %H:%M:%S")
            except ValueError: pass
    return None

def files(paths):
    for p in paths:
        if os.path.isdir(p):
            for n in sorted(os.listdir(p)):
                if os.path.splitext(n)[1].lower() in EXTS: yield os.path.join(p, n)
        else:
            yield p

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--place"); ap.add_argument("--date"); ap.add_argument("--caption")
    ap.add_argument("--place-fallback", help="place to use when the photo has no GPS")
    a = ap.parse_args()
    os.makedirs(PHOTOS, exist_ok=True)
    data = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {"photos": []}
    have = {p["id"] for p in data["photos"]}
    added = []
    for path in files(a.paths):
        raw = open(path, "rb").read()
        pid = hashlib.sha1(raw).hexdigest()[:10]
        if pid in have:
            print("skip (already in album):", path); continue
        im = Image.open(io.BytesIO(raw)); exif = im.getexif()
        when = taken(exif)
        if a.date: when = datetime.strptime(a.date, "%Y-%m-%d") if not when else when
        if when is None: when = datetime.fromtimestamp(os.path.getmtime(path))
        place = a.place
        if not place:
            g = gps(exif)
            place = nearest_place(*g) if g else (a.place_fallback or "")
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
        name = f"{when:%Y%m%d-%H%M%S}-{pid}.jpg"
        im.save(os.path.join(PHOTOS, name), "JPEG", quality=82, optimize=True, progressive=True)  # no exif= -> metadata stripped
        rec = {"id": pid, "src": "photos/" + name, "date": when.strftime("%Y-%m-%dT%H:%M:%S"), "place": place, "w": im.width, "h": im.height}
        if a.caption: rec["caption"] = a.caption
        data["photos"].append(rec); have.add(pid); added.append(rec)
        print(f"added {name}  {when:%b %d %Y}  {place or '(no location)'}")
    data["photos"].sort(key=lambda p: p["date"])
    data["updated"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    with open(MANIFEST, "w") as f: json.dump(data, f, indent=1, ensure_ascii=False)
    print(f"{len(added)} added, {len(data['photos'])} in album")

if __name__ == "__main__":
    main()
