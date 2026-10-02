"""Rebuild data/shots.json, data/shots.csv and data/shots.js from per-shot JSON exports.

Usage: python3 scripts/build.py <export_dir>   (a folder of s01.json, s02.json ...)
"""
import csv, json, sys, pathlib

src = pathlib.Path(sys.argv[1])
root = pathlib.Path(__file__).resolve().parent.parent
shots = sorted((json.loads(p.read_text()) for p in src.glob("s*.json")), key=lambda s: s["n"])
fields = ["n", "date", "session", "bean", "grind", "dose", "yield", "estimated", "time", "taste", "drink", "notes", "dialed"]

(root / "data/shots.json").write_text(json.dumps(shots, indent=2, ensure_ascii=False) + "\n")
(root / "data/shots.js").write_text("window.SHOTS = " + json.dumps(shots, ensure_ascii=False) + ";\n")
with open(root / "data/shots.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    for s in shots:
        w.writerow({k: s.get(k, "") if s.get(k) is not None else "" for k in fields})
print(f"{len(shots)} shots written")
