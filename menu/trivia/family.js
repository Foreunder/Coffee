// Family & Regulars questions from a Google Sheet the family edits (tab "Questions").
// Columns: Question | Right answer | Wrong 1 | Wrong 2 | Wrong 3 | Category | Difficulty | Fun fact | Added by
// The sheet must be shared as "Anyone with the link: Viewer" so the TV can read it.
// The TV reloads it every time the quiz page opens and keeps the last good copy for when it's offline.
// ?sheet=<id> overrides the sheet; ?sheet=0 turns it off.
window.FAMILY = (function(){
  var qs = new URLSearchParams(location.search);
  var ID = qs.get("sheet") || ((window.FOREUNDER || {}).quizSheet) || "11QRYr0POnCZ5gSw3qPFBNrTbdDwyFjnG3RNmy4wnvMY";
  var OFF = ID === "0" || (qs.get("relay") && !qs.get("sheet"));
  var KEY = "foreunder.quiz.family", list = [], listeners = [], status = "";
  try { list = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch(e) { list = []; }

  // Small CSV parser (quoted fields, commas and newlines inside quotes, "" escapes).
  function csv(text){
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++){
      var ch = text[i];
      if (q){ if (ch === '"'){ if (text[i + 1] === '"'){ f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true;
      else if (ch === ","){ row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r"){ if (ch === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += ch;
    }
    if (f !== "" || row.length){ row.push(f); rows.push(row); }
    return rows;
  }
  function clean(s){ return String(s || "").replace(/\s+/g, " ").trim(); }

  function load(){
    if (OFF) return;
    var url = "https://docs.google.com/spreadsheets/d/" + ID + "/gviz/tq?tqx=out:csv&sheet=Questions&t=" + Date.now();
    fetch(url, { cache: "no-store" }).then(function(r){ if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(function(t){
      if (/^\s*</.test(t)) throw new Error("not shared"); // a sign-in page instead of CSV
      var rows = csv(t), out = [];
      rows.slice(1).forEach(function(r){
        var q = clean(r[0]), a = [r[1], r[2], r[3], r[4]].map(clean), d = clean(r[6]).toLowerCase();
        if (!q || a.some(function(x){ return !x; })) return;            // needs a question and all four answers
        if (a.filter(function(x, i){ return a.indexOf(x) === i; }).length !== 4) return; // answers must differ
        out.push({ c: clean(r[5]) || "Family", q: q, a: a, d: ["easy", "medium", "hard"].indexOf(d) !== -1 ? d : "medium", f: clean(r[7]), s: "sheet" });
      });
      list = out; status = "ok";
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e) {}
      listeners.forEach(function(f){ try { f(list.length); } catch(e) {} });
    }).catch(function(e){ status = String(e.message || e); });
  }

  return { questions: function(){ return list; }, count: function(){ return list.length; }, status: function(){ return status; }, onChange: function(f){ listeners.push(f); }, load: load };
})();
