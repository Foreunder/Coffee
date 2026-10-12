# Coffee Log

Home espresso log: Gaggia Classic Evo Pro · DF64 · GaggiMate · BOOKOO scale.

- `index.html` – the shot log page (open it in a browser; works offline)
- `data/shots.csv` – every pull, spreadsheet-ready
- `data/shots.json` – same data, structured
- `scripts/build.py` – rebuilds the data files from the live log export

The live log is the master copy; this repo is updated by Claude after each logged session.

## Maintaining
- `source.html` is the live claude.ai page; `python3 scripts/page.py` builds `index.html` from it.
- `python3 scripts/build.py <export_dir>` rebuilds `data/` from the shot export.
- A shot with `"ref": true` is the bean's dial-in reference shown at the top of the page.

## Foreunder Coffee House menu
- `menu/` – guest menu and ordering for the home coffee bar: https://foreunder.github.io/Coffee/menu/
  - `#board` – TV menu board with QR code and live order queue
  - `#bar` – order screen (only when `ordering: true` in data.js)
  - `#table` – table iPad with live queue line
  - `table.html` – static table card (old iPads)
  - `card.html` / `tag.html` – print: 4×6 card, golf-ball tag inserts
  - `links.html` – every Foreunder link in one page
  - `card.html` – printable 4×6 QR table card
- `menu/data.js` – beans and drinks; Claude keeps it current
- Orders relay through ntfy.sh (no account). Topic is in `data.js`.
