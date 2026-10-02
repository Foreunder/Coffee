"""Build index.html (static GitHub page) from source.html (the live claude.ai shot log page).

Usage: python3 scripts/page.py
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
s = (root / "source.html").read_text()
s = s.replace('<title>Gaggia Shot Log</title>', '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Gaggia Shot Log</title>', 1)
s = s.replace('</style>\n', '</style>\n</head>\n<body>\n', 1)
s = s.replace('Every pull, logged automatically by Claude.', 'Every pull, logged automatically by Claude. GitHub mirror of the live log.')
start = s.index('$("#refresh").addEventListener'); end = s.index('</script>', start)
s = s[:start] + '''function loadShots(){
  const btn = $("#refresh"); btn.classList.add("spin");
  const old = document.getElementById("shots-data"); if(old) old.remove();
  const tag = document.createElement("script");
  tag.id = "shots-data";
  tag.src = "data/shots.js?v=" + Date.now();
  tag.onload = () => { render([...(window.SHOTS || [])].sort((a,b)=>a.n-b.n)); btn.classList.remove("spin"); };
  tag.onerror = () => { $("#updated").textContent = "Couldn't load shots. Check your connection."; btn.classList.remove("spin"); };
  document.body.appendChild(tag);
}
$("#refresh").addEventListener("click", loadShots);
loadShots();
''' + s[end:]
s = s.rstrip() + '\n</body>\n</html>\n'
(root / "index.html").write_text(s)
print("index.html built")
