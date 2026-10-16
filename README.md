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
  - `recipes.html` – bar recipes, current dial-ins, the Dial-In Coach (next grind move from each coffee's own shot history) and beans left per bag (bag weight minus logged doses; set `weighed: {g, afterShot}` on a bean in `data.js` to correct it). Reads `data.js` and the Shot Log mirror.
  - `trivia/` – the Pub Quiz. `index.html` runs on the TV (short address `/Coffee/quiz`) and hosts the game; phones join through `play.html` (the menu's Pub quiz button finds the running game by itself; QR and room code also work; `?qm=1` once makes a phone the quizmaster; that phone gets a play/host toggle at the top, remembered per phone). TV and phones talk through ntfy.sh, the same relay as orders: topics `<ntfyTopic>-quiz-<room>-tv` (state), `-in` (joins/answers) and `-quiz-live` (which room is on). No direct device connections, so any Wi-Fi or cell network works. Bar-style scoring: 30 s per question (`?secs=` on the TV to change), a correct answer is worth 1,000 at the start falling to 100 at the buzzer (last question doubles), and two wrong answers drop out at the 1/3 and 2/3 marks; anyone sitting on a dropped answer has to re-pick. The clock always runs the full time (quizmaster can reveal early); switching answers re-stamps the time. Game modes (host picks in the lobby): Pub Night (every category), Foreunder (Coffee, Golf, Scotland) or Pick categories. Questions live in `questions.js` (first answer is the correct one; shuffled each game). Test locally with any ntfy-compatible relay and `?relay=http://127.0.0.1:9100`.
  - `links.html` – every Foreunder link in one page
  - `table.html` – static table card for older iPads
  - `card.html` – printable 4×6 QR table card; `coaster.html` – 3×3 QR insert for the 4×4 acrylic coaster
- `menu/data.js` – beans, drinks and recipes; Claude keeps it current
- Orders relay through ntfy.sh (no account). Topic is in `data.js`.
