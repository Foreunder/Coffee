"""Rebuild data/shots.json, data/shots.csv and data/shots.js from per-shot JSON exports.

Usage: python3 scripts/build.py <export_dir>/shots   (beans read from the sibling beans/ folder)
"""
import csv, json, sys, pathlib

src = pathlib.Path(sys.argv[1])
beans_dir = src.parent / "beans"
beans = [json.loads(p.read_text()) for p in sorted(beans_dir.glob("*.json"))] if beans_dir.exists() else []
root = pathlib.Path(__file__).resolve().parent.parent
shots = sorted((json.loads(p.read_text()) for p in src.glob("s*.json")), key=lambda s: s["n"])
fields = ["n", "date", "session", "bean", "grind", "dose", "yield", "estimated", "practice", "time", "taste", "drink", "notes", "dialed", "ref"]

(root / "data/shots.json").write_text(json.dumps(shots, indent=2, ensure_ascii=False) + "\n")
(root / "data/shots.js").write_text("window.SHOTS = " + json.dumps(shots, ensure_ascii=False) + ";\nwindow.BEANS = " + json.dumps(beans, ensure_ascii=False) + ";\n")
(root / "data/beans.json").write_text(json.dumps(beans, indent=2, ensure_ascii=False) + "\n")
with open(root / "data/shots.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    for s in shots:
        w.writerow({k: s.get(k, "") if s.get(k) is not None else "" for k in fields})
print(f"{len(shots)} shots written")
