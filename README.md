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
- `menu/` – guest menu: https://foreunder.github.io/Coffee/menu/ (add `?order` for the ordering version)
  - `#board` – TV menu board (drinks, dessert, coffees, QR). `tv/` and `ordertv/` are short redirects for the Fire TVs
  - `?order#bar` – order screen; `?order#table` – table iPad with live queue
  - `about.html` – Why a Thistle? brand story
  - `recipes.html` – bar recipes and current dial-ins (reads `data.js` and the Shot Log mirror)
  - `links.html` – every Foreunder link in one page
  - `table.html` – static table card for older iPads
  - `card.html` – printable 4×6 QR table card; `coaster.html` – 3×3 QR insert for the 4×4 acrylic coaster
- `menu/data.js` – beans, drinks and recipes; Claude keeps it current
- Orders relay through ntfy.sh (no account). Topic is in `data.js`.
