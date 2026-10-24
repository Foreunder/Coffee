/**
 * Foreunder guest backend (Google Apps Script, bound to the "Foreunder Guest Data" sheet).
 *
 * The menu site sends two kinds of posts here:
 *   {type:"rating", coffee, rating (2-6, or 0 to clear), name, device}
 *   {type:"photo",  drink, data (base64 JPEG), name, device}
 * The pub quiz TV sends one post per finished round:
 *   {type:"round", course, courseName, holes, players:[[name, toPar, points], ...] (finishing order), device}
 * A plain GET returns family ratings and the course record for every course and length.
 *
 * Ratings go to the "Ratings" tab. Photos are saved to the Drive folder "Foreunder Pours"
 * and logged on the "Photos" tab. Nothing a guest sends is shown publicly until Jamey picks it.
 */
const FOLDER_NAME = 'Foreunder Pours';
const NAMES = {2: 'eagle', 3: 'birdie', 4: 'par', 5: 'bogey', 6: 'double bogey'};

function doGet() {
  const rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ratings').getDataRange().getValues().slice(1);
  // Keep only each phone's latest rating for each coffee.
  const latest = {};
  rows.forEach(function (r) { latest[r[1] + '|' + r[5]] = r; });
  const ratings = {};
  Object.keys(latest).forEach(function (k) {
    const r = latest[k], coffee = r[1], n = Number(r[2]);
    if (!NAMES[n]) return;
    ratings[coffee] = ratings[coffee] || {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, count: 0};
    ratings[coffee][n]++;
    ratings[coffee].count++;
  });
  return json({ok: true, ratings: ratings, records: records()});
}

// Best round per course and length: lowest to par, then most points. Rows: Time, Course ID, Course, Holes, Player, To par, Points, Place, Players, Device.
function records() {
  const sh = quizSheet(), best = {};
  sh.getDataRange().getValues().slice(1).forEach(function (r) {
    if (String(r[7]) !== '1') return;
    const k = r[1] + '|' + r[3], par = Number(r[5]), pts = Number(r[6]), b = best[k];
    if (!b || par < b.par || (par === b.par && pts > b.pts)) {
      best[k] = {course: String(r[1]), holes: Number(r[3]), par: par, pts: pts, name: String(r[4]),
        date: Utilities.formatDate(new Date(r[0]), 'America/Chicago', 'MMM d, yyyy')};
    }
  });
  return Object.keys(best).map(function (k) { return best[k]; });
}

function quizSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Quiz Rounds');
  if (!sh) {
    sh = ss.insertSheet('Quiz Rounds');
    sh.getRange(1, 1, 1, 10).setValues([['Time', 'Course ID', 'Course', 'Holes', 'Player', 'To par', 'Points', 'Place', 'Players', 'Device']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const name = String(d.name || '').slice(0, 40);
    const device = String(d.device || '').slice(0, 40);

    if (d.type === 'rating') {
      const n = Number(d.rating);
      if (!/^[a-z0-9-]{1,40}$/.test(String(d.coffee)) || !(NAMES[n] || n === 0)) return json({ok: false});
      ss.getSheetByName('Ratings').appendRow([new Date(), d.coffee, n || '', NAMES[n] || 'cleared', name, device]);
      return json({ok: true});
    }

    if (d.type === 'photo') {
      if (!d.data || d.data.length > 4000000) return json({ok: false, error: 'too big'});
      const drink = String(d.drink || 'Drink').slice(0, 40);
      const stamp = Utilities.formatDate(new Date(), 'America/Chicago', 'yyyy-MM-dd HHmm');
      const blob = Utilities.newBlob(Utilities.base64Decode(d.data), 'image/jpeg', drink + ' ' + stamp + '.jpg');
      const file = folder().createFile(blob);
      ss.getSheetByName('Photos').appendRow([new Date(), drink, name, file.getUrl(), file.getId(), 'new', device]);
      return json({ok: true});
    }

    if (d.type === 'round') {
      if (!/^[a-z0-9-]{1,40}$/.test(String(d.course)) || [9, 18, 72].indexOf(Number(d.holes)) === -1 || !Array.isArray(d.players)) return json({ok: false});
      const sh = quizSheet(), now = new Date(), n = Math.min(d.players.length, 40);
      const rows = d.players.slice(0, 40).map(function (p, i) {
        return [now, d.course, String(d.courseName || d.course).slice(0, 60), Number(d.holes), String(p[0]).slice(0, 40), Number(p[1]) || 0, Number(p[2]) || 0, i + 1, n, device];
      });
      if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 10).setValues(rows);
      return json({ok: true, records: records()});
    }

    return json({ok: false});
  } finally {
    lock.releaseLock();
  }
}

function folder() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to approve Drive and Sheets access before deploying. */
function setup() {
  folder();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = {
    Ratings: ['Time', 'Coffee ID', 'Rating', 'Rating name', 'Guest name', 'Device'],
    Photos: ['Time', 'Drink', 'Guest name', 'Photo link', 'File ID', 'Status', 'Device']
  };
  Object.keys(tabs).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (!sh.getRange(1, 1).getValue()) {
      sh.getRange(1, 1, 1, tabs[name].length).setValues([tabs[name]]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
}
