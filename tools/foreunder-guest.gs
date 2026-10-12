/**
 * Foreunder guest backend (Google Apps Script, bound to the "Foreunder Guest Data" sheet).
 *
 * The menu site sends two kinds of posts here:
 *   {type:"rating", coffee, rating (2-6, or 0 to clear), name, device}
 *   {type:"photo",  drink, data (base64 JPEG), name, device}
 * and reads family ratings back with a plain GET.
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
  return json({ok: true, ratings: ratings});
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
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ratings');
}
