#!/usr/bin/env python3
"""Sync the Foreunder Album Google Drive folder into album/ (runs in GitHub Actions).

Env ALBUM_FOLDER_ID = the Drive folder id (kept as a repo secret, never committed).
The folder is shared "anyone with the link: viewer"; subfolders are included.

- New photos are downloaded and run through scripts/album.py (resize, strip ALL metadata, town-level place).
- A photo deleted from the Drive folder is removed from the album on the next sync.
- Drive file ids are stored only as hashes, so the repo never reveals where the originals live.
- Optional: name a subfolder "Place - anything" (e.g. "Edinburgh, Scotland - Sept trip") and photos
  inside it without GPS get that place.
"""
import hashlib, html, json, os, re, subprocess, sys, tempfile, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALBUM = os.path.join(ROOT, "album")
MANIFEST = os.path.join(ALBUM, "album.json")
SEEN = os.path.join(ALBUM, "drive-sync.json")
EXTS = (".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp")
UA = {"User-Agent": "Mozilla/5.0 (Foreunder album sync)"}

def get(url, binary=False):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                b = r.read(); return b if binary else b.decode("utf-8", "replace")
        except Exception as e:
            if i == 2: raise
            time.sleep(3)

def list_folder(fid, place=None, depth=0):
    page = get(f"https://drive.google.com/embeddedfolderview?id={fid}#list")
    out = []
    # entries look like: <a href="https://drive.google.com/file/d/ID/view?..." ...><div class="flip-entry-title">NAME</div>
    for m in re.finditer(r'href="https://drive\.google\.com/(file/d|drive/folders)/([\w-]+)[^"]*"[^>]*>.*?flip-entry-title">([^<]*)<', page, re.S):
        kind, iid, name = m.group(1), m.group(2), html.unescape(m.group(3)).strip()
        if kind.startswith("file"):
            if name.lower().endswith(EXTS): out.append((iid, name, place))
        elif depth < 3:
            sub_place = name.split(" - ")[0].strip() if " - " in name else place
            out += list_folder(iid, sub_place, depth + 1)
    return out

def hid(x): return hashlib.sha256(("foreunder:" + x).encode()).hexdigest()[:16]

def main():
    fid = os.environ.get("ALBUM_FOLDER_ID", "").strip()
    if not fid: sys.exit("ALBUM_FOLDER_ID is not set")
    seen = json.load(open(SEEN)) if os.path.exists(SEEN) else {}
    files = list_folder(fid)
    print(f"{len(files)} photos in the Drive folder, {len(seen)} already synced")
    live = set()
    with tempfile.TemporaryDirectory() as tmp:
        for iid, name, place in files:
            h = hid(iid); live.add(h)
            if h in seen: continue
            data = get(f"https://drive.usercontent.google.com/download?id={iid}&export=download&confirm=t", binary=True)
            if data[:15].lower().startswith(b"<!doctype html") or data[:5] == b"<html":
                print("could not download", name); continue
            path = os.path.join(tmp, h + os.path.splitext(name)[1].lower())
            open(path, "wb").write(data)
            pid = hashlib.sha1(data).hexdigest()[:10]
            cmd = [sys.executable, os.path.join(ROOT, "scripts", "album.py"), path]
            if place: cmd += ["--place-fallback", place]
            subprocess.run(cmd, check=True)
            seen[h] = pid
    # Remove photos that were deleted from the Drive folder (only when the listing clearly worked)
    gone = [h for h in seen if h not in live]
    if gone and files:
        album = json.load(open(MANIFEST))
        drop = {seen[h] for h in gone}
        keep = []
        for p in album["photos"]:
            if p["id"] in drop:
                try: os.remove(os.path.join(ALBUM, p["src"]))
                except FileNotFoundError: pass
                print("removed", p["src"])
            else: keep.append(p)
        album["photos"] = keep
        json.dump(album, open(MANIFEST, "w"), indent=1, ensure_ascii=False)
        for h in gone: del seen[h]
    json.dump(seen, open(SEEN, "w"), indent=1, sort_keys=True)

if __name__ == "__main__":
    main()
