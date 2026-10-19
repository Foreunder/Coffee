#!/usr/bin/env python3
"""Merge a stage dir (from album_stage.py) into the album.

    python3 scripts/album_merge.py STAGE_DIR --set "London 2026" [--from 2026-08-01 --to 2026-09-30]

Place names: famous landmarks first (within a few hundred metres), then trip areas
(London, Edinburgh, St Andrews...), then the nearest town. Photos without GPS borrow the
place of the nearest-in-time photo taken within 90 minutes. Photos without a camera date are skipped.
"""
import argparse, glob, json, math, os, shutil, sys
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from album import nearest_place, ALBUM, PHOTOS, MANIFEST

# (lat, lon, radius_km, label) — checked smallest radius first
SPOTS = [
    (51.5163, -0.0809, 0.12, "Duck & Waffle, London"),
    (51.5128, -0.0835, 0.12, "Leadenhall Market, London"),
    (51.5195, -0.1816, 0.30, "Novotel Paddington, London"),
    (51.5100, -0.1345, 0.18, "Piccadilly Circus, London"),
    (51.5103, -0.1301, 0.12, "Leicester Square, London"),
    (51.5130, -0.1340, 0.30, "West End, London"),
    (51.5048, -0.1284, 0.12, "Horse Guards, Whitehall"),
    (51.5025, -0.1340, 0.35, "St James's Park, London"),
    (56.3432, -2.8027, 0.18, "Old Course 18th, St Andrews"),
    (56.3450, -2.8080, 1.10, "Old Course, St Andrews"),
    (56.0300, -2.8450, 0.90, "Gullane Golf Club"),
    (51.5194, -0.1270, 0.30, "British Museum, London"),
    (51.5021, -0.1291, 0.12, "Churchill War Rooms, London"),
    (51.4993, -0.1273, 0.20, "Westminster Abbey, London"),
    (51.5007, -0.1246, 0.25, "Westminster, London"),
    (51.5033, -0.1196, 0.25, "London Eye"),
    (51.5014, -0.1419, 0.35, "Buckingham Palace, London"),
    (51.5080, -0.1281, 0.20, "Trafalgar Square, London"),
    (51.5138, -0.0984, 0.22, "St Paul's Cathedral, London"),
    (51.5113, -0.0836, 0.12, "Sky Garden, London"),
    (51.5055, -0.0910, 0.20, "Borough Market, London"),
    (51.5045, -0.0865, 0.15, "The Shard, London"),
    (51.5081, -0.0759, 0.30, "Tower of London"),
    (51.5055, -0.0754, 0.20, "Tower Bridge, London"),
    (51.5154, -0.1755, 0.50, "Paddington, London"),
    (51.5308, -0.1238, 0.45, "King's Cross, London"),
    (51.5560, -0.2796, 0.90, "Wembley Stadium, London"),
    (51.4700, -0.4543, 3.50, "Heathrow, London"),
    (55.9486, -3.1999, 0.30, "Edinburgh Castle"),
    (55.9520, -3.1890, 0.25, "Waverley, Edinburgh"),
    (55.9553, -3.1827, 0.30, "Calton Hill, Edinburgh"),
    (55.9527, -3.1722, 0.40, "Holyrood, Edinburgh"),
    (55.9441, -3.1618, 0.90, "Arthur's Seat, Edinburgh"),
    (55.9496, -3.1900, 0.45, "Royal Mile, Edinburgh"),
    (55.9440, -3.0480, 1.20, "Musselburgh Old Links"),
    (56.0405, -2.8320, 3.00, "Gullane, Scotland"),
    (56.3431, -2.8030, 4.00, "St Andrews, Scotland"),
    (55.9530, -3.1880, 9.00, "Edinburgh, Scotland"),
    (51.5072, -0.1276, 22.0, "London, England"),
    (41.3032, -95.8941, 3.0, "Omaha Eppley Airfield"),
    (33.4342, -112.0116, 3.0, "Phoenix Sky Harbor"),
    (33.4484, -112.0740, 60.0, "Phoenix, Arizona"),
    (41.2565, -96.0, 40.0, "Omaha, Nebraska"),
]
SPOTS.sort(key=lambda s: s[2])

def km(a, b, c, d):
    p = math.pi / 180
    x = (d - b) * p * math.cos((a + c) / 2 * p); y = (c - a) * p
    return 6371 * math.hypot(x, y)

def name(ll, when=""):
    for la, lo, r, label in SPOTS:
        if km(ll[0], ll[1], la, lo) <= r:
            if label.startswith("Wembley Stadium") and not ("2026-09-19T14" <= when <= "2026-09-19T22"):
                return "Wembley Park, London"
            return label
    return nearest_place(*ll)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("stage"); ap.add_argument("--set", default="")
    ap.add_argument("--relabel", action="store_true", help="also refresh place names of photos already in the album")
    ap.add_argument("--from", dest="dfrom"); ap.add_argument("--to", dest="dto")
    a = ap.parse_args()
    recs = [json.load(open(f)) for f in glob.glob(os.path.join(a.stage, "*.json"))]
    nodate = [r for r in recs if not r["date"]]
    recs = [r for r in recs if r["date"]]
    if a.dfrom: recs = [r for r in recs if r["date"][:10] >= a.dfrom]
    if a.dto: recs = [r for r in recs if r["date"][:10] <= a.dto]
    for r in recs: r["place"] = name(r["ll"], r["date"]) if r.get("ll") else ""
    # borrow a place from the nearest photo in time (within 90 min)
    placed = sorted([(datetime.fromisoformat(r["date"]), r["place"]) for r in recs if r["place"]])
    for r in recs:
        if r["place"] or not placed: continue
        t = datetime.fromisoformat(r["date"])
        best = min(placed, key=lambda x: abs((x[0] - t).total_seconds()))
        if abs((best[0] - t).total_seconds()) <= 5400: r["place"] = best[1]
    data = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {"photos": []}
    have = {p["id"] for p in data["photos"]}
    os.makedirs(PHOTOS, exist_ok=True)
    added = 0
    for r in recs:
        if r["id"] in have:
            if a.relabel:
                for p in data["photos"]:
                    if p["id"] == r["id"]: p["place"] = r["place"]
            continue
        fn = f"{r['date'].replace('-', '').replace(':', '').replace('T', '-')}-{r['id']}.jpg"
        shutil.copy(os.path.join(a.stage, r["id"] + ".jpg"), os.path.join(PHOTOS, fn))
        rec = {"id": r["id"], "src": "photos/" + fn, "date": r["date"], "place": r["place"], "w": r["w"], "h": r["h"]}
        if a.set: rec["set"] = a.set
        data["photos"].append(rec); have.add(r["id"]); added += 1
    data["photos"].sort(key=lambda p: p["date"])
    data["updated"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    json.dump(data, open(MANIFEST, "w"), indent=1, ensure_ascii=False)
    from collections import Counter
    c = Counter(r["place"] or "(none)" for r in recs)
    print(f"added {added}; {len(nodate)} skipped (no camera date); {len(data['photos'])} in album")
    for k, v in c.most_common(40): print(f"  {v:4d}  {k}")

if __name__ == "__main__":
    main()
