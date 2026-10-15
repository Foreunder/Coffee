// Shared bits for the Foreunder Pub Quiz (TV host and phone player).
// The TV is the host and keeps the whole game. TV and phones talk through ntfy.sh, the same
// relay the menu uses: plain HTTPS, so it works on any Wi-Fi or cell network with no direct
// device-to-device connection. No accounts, nothing kept beyond ntfy's 12-hour cache.
//   TV  -> phones : <base>-<room>-tv   (game state)
//   phones -> TV  : <base>-<room>-in   (joins, answers, quizmaster commands)
//   TV  -> menu   : <base>-live        (which room is running, so the menu button needs no code)
// ?relay=http://127.0.0.1:9100 points everything at a local test relay.
window.PQ = (function(){
  var qs = new URLSearchParams(location.search);
  var RELAY = (qs.get("relay") || "https://ntfy.sh").replace(/\/$/, "");
  var BASE = ((window.FOREUNDER || {}).ntfyTopic || "foreunder-bar-q7m4x2k9vz") + "-quiz";

  function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e) { return null; } }
  function el(tag, attrs){
    var e = document.createElement(tag); attrs = attrs || {};
    for (var k in attrs){
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "text") e.textContent = v;
      else if (k.slice(0,2) === "on" && typeof v === "function") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++){
      var c = arguments[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach(function(x){ if (x != null && x !== false) e.append(x.nodeType ? x : document.createTextNode(x)); });
      else e.append(c.nodeType ? c : document.createTextNode(c));
    }
    return e;
  }
  function topic(room, dir){ return BASE + "-" + String(room).toLowerCase() + "-" + dir; }

  // Post one small JSON message. No Content-Type header keeps it a simple CORS request.
  function publish(t, obj){
    return fetch(RELAY + "/", { method: "POST", body: JSON.stringify({ topic: t, message: JSON.stringify(obj) }) })
      .then(function(r){ if (!r.ok) throw new Error("HTTP " + r.status); return r; });
  }

  // Live stream of a topic. Calls onData(payload, rawMessage) once per message (replays are dropped)
  // and onStatus(true/false) as the connection comes and goes. Reconnects on its own.
  function subscribe(topics, since, onData, onStatus){
    var es = null, closed = false, wait = 1000, seen = {}, lastId = null;
    function open(){
      if (closed) return;
      var s = lastId || since;
      es = new EventSource(RELAY + "/" + topics.join(",") + "/sse" + (s ? "?since=" + encodeURIComponent(s) : ""));
      es.onopen = function(){ wait = 1000; if (onStatus) onStatus(true); };
      es.onmessage = function(ev){
        var m; try { m = JSON.parse(ev.data); } catch(e) { return; }
        if (!m || m.event !== "message" || seen[m.id]) return;
        seen[m.id] = 1; lastId = m.id;
        var d; try { d = JSON.parse(m.message); } catch(e) { return; }
        if (d && typeof d === "object") onData(d, m);
      };
      es.onerror = function(){
        if (onStatus) onStatus(false);
        if (es.readyState === 2){ es.close(); setTimeout(open, wait); wait = Math.min(wait * 2, 15000); }
      };
    }
    open();
    return {
      close: function(){ closed = true; if (es) es.close(); },
      reopen: function(){ if (closed) return; if (es) es.close(); open(); }
    };
  }

  // The newest message on a topic within the last 12 hours, or null.
  function latest(t){
    return fetch(RELAY + "/" + t + "/json?poll=1&since=12h").then(function(r){ return r.ok ? r.text() : ""; }).then(function(txt){
      var lines = String(txt || "").trim().split("\n").filter(Boolean), last = null;
      lines.forEach(function(l){ try { var m = JSON.parse(l); if (m.event === "message") last = m; } catch(e) {} });
      if (!last) return null;
      try { return { data: JSON.parse(last.message), time: last.time }; } catch(e) { return null; }
    }).catch(function(){ return null; });
  }

  return {
    LETTERS: ["A", "B", "C", "D"],
    LIVE: BASE + "-live",
    STALE_SECS: 300,          // the TV re-announces every 2 minutes; older than this means it's off
    qs: qs,
    store: store,
    el: el,
    topic: topic,
    publish: publish,
    subscribe: subscribe,
    latest: latest,
    pid: function(){
      var p = store("foreunder.quiz.pid");
      if (!p){ p = Math.random().toString(36).slice(2, 10); store("foreunder.quiz.pid", p); }
      return p;
    }
  };
})();
