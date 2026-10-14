// Shared bits for the Foreunder Pub Quiz (TV host and phone player).
// The TV is the host. Phones connect straight to it over WebRTC using PeerJS; the free PeerJS
// server is only used to introduce them. No accounts, no backend, nothing stored online.
window.PQ = (function(){
  var qs = new URLSearchParams(location.search);
  // ?peer=localhost:9000 points at a local PeerServer for testing.
  function peerOpts(){
    var p = qs.get("peer");
    if (!p) return { debug: 0 };
    var hp = p.split(":");
    return { host: hp[0], port: Number(hp[1] || 9000), path: "/", secure: false, debug: 0 };
  }
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
  return {
    PREFIX: "foreunder-quiz-",
    LETTERS: ["A", "B", "C", "D"],
    peerOpts: peerOpts,
    qs: qs,
    store: store,
    el: el,
    pid: function(){
      var p = store("foreunder.quiz.pid");
      if (!p){ p = Math.random().toString(36).slice(2, 10); store("foreunder.quiz.pid", p); }
      return p;
    }
  };
})();
