// Shared bits for the Foreunder Pub Quiz (TV host and phone player).
// The TV is the host and keeps the whole game. TV and phones talk through a public MQTT broker
// over secure WebSockets: works on any Wi-Fi or cell network, no accounts, and no per-household
// message cap (the old ntfy.sh relay capped a whole home connection and froze games).
//   TV  -> phones : <base>-<room>-tv   (game state, kept by the broker so a phone gets it on join)
//   phones -> TV  : <base>-<room>-in   (joins, answers, quizmaster commands)
//   TV  -> menu   : <base>-live        (which room is running)
// ?relay=ws://127.0.0.1:9001 points everything at a local test broker.
window.PQ = (function(){
  var qs = new URLSearchParams(location.search);
  var BROKERS = qs.get("relay") ? [qs.get("relay")] : ["wss://broker.hivemq.com:8884/mqtt", "wss://broker.emqx.io:8084/mqtt"];
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

  // ---- one shared broker connection per page ----
  var client = null, bi = 0, up = false, handlers = {}, statusFns = [], failTimer = null;
  function isRetained(t){ return /-tv$/.test(t) || /-live$/.test(t); }
  function setUp(v){ up = v; statusFns.forEach(function(f){ try { f(v); } catch(e) {} }); }
  function connect(){
    if (client) return client;
    client = mqtt.connect(BROKERS[bi], { clientId: "fu" + Math.random().toString(36).slice(2, 12), clean: true, keepalive: 30, reconnectPeriod: 2000, connectTimeout: 8000, protocolVersion: 4 });
    client.on("connect", function(){
      clearTimeout(failTimer);
      var ts = Object.keys(handlers);
      if (ts.length) client.subscribe(ts, { qos: 1 });
      setUp(true);
    });
    client.on("offline", function(){ setUp(false); });
    client.on("close", function(){ if (up) setUp(false); });
    client.on("error", function(){});
    client.on("message", function(t, buf, pkt){
      var env; try { env = JSON.parse(String(buf)); } catch(e) { return; }
      if (!env || typeof env.d !== "object" || !env.d) return;
      (handlers[t] || []).slice().forEach(function(h){ h(env.d, { time: env.ts || 0, retain: !!pkt.retain }); });
    });
    // If the first broker can't be reached, move to the next one.
    if (BROKERS.length > 1) failTimer = setTimeout(function(){
      if (up) return;
      var old = client; client = null; bi = (bi + 1) % BROKERS.length;
      try { old.end(true); } catch(e) {}
      connect();
    }, 10000);
    return client;
  }
  function addHandler(t, h){
    var first = !handlers[t]; (handlers[t] = handlers[t] || []).push(h);
    var c = connect(); if (first && c.connected) c.subscribe(t, { qos: 1 });
  }
  function removeHandler(t, h){
    if (!handlers[t]) return;
    handlers[t] = handlers[t].filter(function(x){ return x !== h; });
    if (!handlers[t].length){ delete handlers[t]; if (client && client.connected) client.unsubscribe(t); }
  }

  // Send one small JSON message. Game state and the live marker are kept by the broker
  // (retained), so a phone that joins or refreshes gets the current screen at once.
  function publish(t, obj){
    var c = connect();
    return new Promise(function(res, rej){
      if (!c.connected) return rej(new Error("offline"));
      c.publish(t, JSON.stringify({ d: obj, ts: Date.now() / 1000 }), { qos: 1, retain: isRetained(t) }, function(err){ err ? rej(err) : res(); });
    });
  }

  // Live feed of topics. Calls onData(payload, {time}) per message and onStatus(true/false)
  // as the connection comes and goes. since = unix seconds drops older messages; "latest" keeps
  // the broker's last kept message. Reconnects on its own.
  function subscribe(topics, since, onData, onStatus){
    var min = since === "latest" ? 0 : Number(since) || 0;
    var h = function(d, m){ if (m.time >= min) onData(d, m); };
    if (onStatus){ statusFns.push(onStatus); }
    topics.forEach(function(t){ addHandler(t, h); });
    if (onStatus && up) setTimeout(function(){ onStatus(true); }, 0);
    return {
      close: function(){ topics.forEach(function(t){ removeHandler(t, h); }); statusFns = statusFns.filter(function(f){ return f !== onStatus; }); },
      reopen: function(){ if (client && !client.connected) client.reconnect(); }
    };
  }

  // The newest kept message on a topic, or null (waits up to 4 s for the broker).
  function latest(t){
    return new Promise(function(res){
      var done = false, h = function(d, m){ if (done) return; done = true; removeHandler(t, h); res({ data: d, time: m.time }); };
      addHandler(t, h);
      setTimeout(function(){ if (done) return; done = true; removeHandler(t, h); res(null); }, 4000);
    });
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
