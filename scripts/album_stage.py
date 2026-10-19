#!/usr/bin/env python3
"""Stage one downloaded Drive photo for the album, then delete the raw download.

    python3 scripts/album_stage.py TOOL_RESULT_FILE STAGE_DIR

TOOL_RESULT_FILE is the JSON file the Google Drive download tool saved ({content: base64, id, title, ...}).
Writes STAGE_DIR/<pid>.jpg (2048px, upright, ALL metadata stripped) and STAGE_DIR/<pid>.json
({id, src, date, place, w, h, drive_title}). Prints one line. Deletes the tool-result file afterwards.
"""
import base64, hashlib, io, json, os, sys
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from album import taken, gps, nearest_place, LONG_EDGE  # same rules as album.py
from PIL import Image, ImageOps

src, stage = sys.argv[1], sys.argv[2]
os.makedirs(stage, exist_ok=True)
d = json.load(open(src))
raw = base64.b64decode(d["content"])
pid = hashlib.sha1(raw).hexdigest()[:10]
if os.path.exists(os.path.join(stage, pid + ".json")):
    print("dup", d.get("title")); os.remove(src); sys.exit(0)
im = Image.open(io.BytesIO(raw)); exif = im.getexif()
when = taken(exif)
g = gps(exif)
place = nearest_place(*g) if g else ""
im = ImageOps.exif_transpose(im).convert("RGB")
im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
im.save(os.path.join(stage, pid + ".jpg"), "JPEG", quality=80, optimize=True, progressive=True)
rec = {"id": pid, "date": when.strftime("%Y-%m-%dT%H:%M:%S") if when else "", "place": place,
       "w": im.width, "h": im.height, "drive_title": d.get("title", ""),
       "ll": [round(g[0], 4), round(g[1], 4)] if g else None}  # staging only, never published
json.dump(rec, open(os.path.join(stage, pid + ".json"), "w"))
os.remove(src)
print("ok", d.get("title"), rec["date"] or "NO-DATE", place or "NO-GPS")
