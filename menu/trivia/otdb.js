// Open Trivia DB feed for the Pub Quiz TV (https://opentdb.com, questions CC BY-SA 4.0).
// The TV downloads the whole multiple-choice bank for the categories below in the background,
// one request every ~5.5 s (the site's limit), and keeps it in this browser. First fill takes
// about 10 minutes and the game is playable the whole time; after that it refreshes weekly.
// ?otdb=0 turns it off. ?relay= (testing) also turns it off unless ?otdb=1.
window.OTDB = (function(){
  var qs = new URLSearchParams(location.search);
  var OFF = qs.get("otdb") === "0" || (qs.get("relay") && qs.get("otdb") !== "1");
  var API = qs.get("otdbapi") || "https://opentdb.com";
  // Open Trivia DB category id -> our category. Anime, comics, board games, etc. are left out on purpose.
  var MAP = { 9: "General", 10: "Books", 11: "Movies & TV", 14: "Movies & TV", 12: "Music", 15: "Video Games", 21: "Sports",
              23: "History", 22: "Places", 17: "Science & Nature", 27: "Science & Nature", 28: "Cars & Trucks", 20: "Mythology",
              25: "Art", 26: "Celebrities", 32: "Disney & Family" };
  var KEY = "foreunder.quiz.otdb", WEEK = 7 * 864e5, GAP = Number(qs.get("otdbgap")) || 5500;
  var db = load(), listeners = [], running = false;

  function load(){
    try { var d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && d.v === 1 && Array.isArray(d.q)) return d; } catch(e) {}
    return { v: 1, q: [], done: {}, full: 0, tok: "" };
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(e) {} }
  function emit(){ listeners.forEach(function(f){ try { f(db.q.length, running); } catch(e) {} }); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function get(path){ return fetch(API + path, { cache: "no-store" }).then(function(r){ if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }); }
  function dec(s){ try { return decodeURIComponent(s); } catch(e) { return s; } }

  var seen = {};
  db.q.forEach(function(q){ seen[q.q.toLowerCase()] = 1; });
  function add(results, cat){
    var n = 0;
    (results || []).forEach(function(r){
      if (r.type !== "multiple") return;
      var q = dec(r.question).trim(), a = [dec(r.correct_answer)].concat((r.incorrect_answers || []).map(dec));
      // Keep what reads well on a TV and fits a phone button.
      if (a.length !== 4 || q.length > 160 || a.some(function(x){ return !x || x.length > 60; })) return;
      var k = q.toLowerCase(); if (seen[k]) return; seen[k] = 1;
      db.q.push({ c: cat, q: q, a: a, d: r.difficulty, s: "otdb" }); n++;
    });
    return n;
  }

  function token(){ return get("/api_token.php?command=request").then(function(r){ db.tok = r.token || ""; save(); }); }

  // Pull every question in one category: 50 at a time, then smaller steps for the remainder.
  function drain(id){
    var sizes = [50, 10, 1], si = 0;
    function step(){
      var amt = sizes[si];
      return get("/api.php?amount=" + amt + "&category=" + id + "&type=multiple&encode=url3986&token=" + encodeURIComponent(db.tok)).then(function(r){
        var code = r.response_code;
        if (code === 0){ add(r.results, MAP[id]); save(); emit(); return wait(GAP).then(step); }
        if (code === 1 && si < sizes.length - 1){ si++; return wait(GAP).then(step); }
        if (code === 1 || code === 4){ db.done[id] = 1; save(); return wait(GAP); }
        if (code === 3 || code === 2){ return wait(GAP).then(token).then(function(){ return wait(GAP); }).then(step); }
        if (code === 5){ return wait(GAP * 2).then(step); }
        db.done[id] = 1; return wait(GAP);
      });
    }
    return step();
  }

  function fill(){
    if (OFF || running) return;
    if (db.full && Date.now() - db.full < WEEK) return;
    if (db.full) { db.done = {}; db.tok = ""; } // weekly refresh: start a fresh token, duplicates are skipped
    running = true; emit();
    var ids = Object.keys(MAP).filter(function(id){ return !db.done[id]; });
    var chain = db.tok ? Promise.resolve() : token().then(function(){ return wait(GAP); });
    ids.forEach(function(id){ chain = chain.then(function(){ return drain(id); }); });
    chain.then(function(){ db.full = Date.now(); save(); })
      .catch(function(){ /* offline or blocked: keep what we have, try again next time the TV loads */ })
      .then(function(){ running = false; emit(); });
  }

  return {
    questions: function(){ return db.q; },
    count: function(){ return db.q.length; },
    busy: function(){ return running; },
    onChange: function(f){ listeners.push(f); },
    fill: fill,
    off: OFF
  };
})();
