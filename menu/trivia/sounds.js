// Foreunder Pub Quiz sound: golf call-outs (spoken by the device's voice) plus sound effects made on the fly
// with Web Audio, so there are no audio files to download. Every call-out also shows on the TV as a banner,
// so the room still gets it if a device has no voice. SFX.on(false) mutes everything (saved per device).
window.SFX = (function(){
  var ctx = null, on = true, banner = null, voice = null;
  try { on = localStorage.getItem("foreunder.quiz.sound") !== "0"; } catch(e) {}

  function ac(){
    if (!ctx){ var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
    if (ctx.state === "suspended") ctx.resume().catch(function(){});
    return ctx;
  }
  // Browsers only allow sound after a tap or key press; any press on the page unlocks it.
  ["pointerdown", "keydown", "touchstart"].forEach(function(ev){ document.addEventListener(ev, function(){ ac(); pickVoice(); }, { passive: true }); });
  function ready(){ return !!ctx && ctx.state === "running"; }

  // ---- building blocks ----
  function noise(c, secs){
    var b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * secs)), c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(); s.buffer = b; return s;
  }
  function env(c, g, t, a, peak, dec){ g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function tone(type, f0, f1, dur, vol, when){
    var c = ac(); if (!c || !on) return; var t = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(c, g, t, 0.01, vol, dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(freq, q, dur, vol, when){
    var c = ac(); if (!c || !on) return; var t = c.currentTime + (when || 0);
    var n = noise(c, dur + 0.05), f = c.createBiquadFilter(), g = c.createGain();
    f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q; env(c, g, t, 0.003, vol, dur);
    n.connect(f).connect(g).connect(c.destination); n.start(t); n.stop(t + dur + 0.05);
  }

  // ---- effects ----
  var fx = {
    // Persimmon on balata: a sharp crack.
    strike: function(){ burst(2400, 1.2, 0.07, 0.9); tone("triangle", 900, 300, 0.06, 0.25); },
    // Ball rattling into the cup.
    cup: function(){ tone("sine", 520, 260, 0.18, 0.5); tone("sine", 780, 390, 0.12, 0.25, 0.05); [0.16, 0.24, 0.3].forEach(function(w){ burst(3200, 6, 0.03, 0.35, w); }); },
    // Polite gallery applause.
    clap: function(secs){ secs = secs || 2.2; for (var i = 0; i < secs * 26; i++) burst(1400 + Math.random() * 1600, 1.5, 0.04 + Math.random() * 0.03, 0.12 + Math.random() * 0.2, Math.random() * secs); },
    // Sunday-at-Augusta roar.
    roar: function(){
      var c = ac(); if (!c || !on) return; var t = c.currentTime, n = noise(c, 3.6), f = c.createBiquadFilter(), g = c.createGain();
      f.type = "lowpass"; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1600, t + 1); f.frequency.linearRampToValueAtTime(700, t + 3.4);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
      n.connect(f).connect(g).connect(c.destination); n.start(t); n.stop(t + 3.6); fx.clap(3);
    },
    // A ball flying off into the gorse.
    whoosh: function(){
      var c = ac(); if (!c || !on) return; var t = c.currentTime, n = noise(c, 0.7), f = c.createBiquadFilter(), g = c.createGain();
      f.type = "bandpass"; f.Q.value = 3; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.6);
      env(c, g, t, 0.15, 0.4, 0.5); n.connect(f).connect(g).connect(c.destination); n.start(t); n.stop(t + 0.7);
    },
    // Splash: into the burn.
    splash: function(){ burst(900, 0.7, 0.5, 0.5); burst(2600, 1, 0.3, 0.3, 0.05); },
    // Sad trombone for a big number.
    groan: function(){ [392, 370, 349, 330].forEach(function(f, i){ tone("sawtooth", f, i === 3 ? f * 0.8 : 0, i === 3 ? 0.9 : 0.32, 0.12, i * 0.34); }); },
    tick: function(){ tone("square", 1500, 0, 0.03, 0.12); },
    tock: function(){ tone("square", 1000, 0, 0.05, 0.16); },
    // Starter's bell on the first tee.
    bell: function(){ [880, 1320, 1760].forEach(function(f, i){ tone("sine", f, 0, 1.4 - i * 0.3, 0.22 / (i + 1)); }); },
    // A wee bagpipe flourish for a champion.
    pipes: function(){
      var drone = [110, 220]; drone.forEach(function(f){ tone("sawtooth", f, 0, 3.2, 0.06); });
      [440, 494, 554, 587, 659, 587, 554, 494, 440].forEach(function(f, i){ tone("sawtooth", f, 0, 0.32, 0.08, i * 0.3); });
    }
  };

  // ---- spoken call-outs ----
  function pickVoice(){
    if (voice || !window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices() || [];
    voice = vs.filter(function(v){ return /en-GB/i.test(v.lang) && /male|daniel|arthur|george|oliver/i.test(v.name); })[0]
      || vs.filter(function(v){ return /en-GB/i.test(v.lang); })[0] || vs.filter(function(v){ return /^en/i.test(v.lang); })[0] || null;
  }
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = pickVoice;
  function say(text, opts){
    opts = opts || {};
    if (banner) banner(text, opts.big);
    if (!on || !window.speechSynthesis) return;
    try {
      if (opts.cut) speechSynthesis.cancel();
      pickVoice();
      var u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = opts.rate || 1.02; u.pitch = opts.pitch || 1; u.volume = 1;
      speechSynthesis.speak(u);
    } catch(e) {}
  }
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }

  // Golf slang for every moment of the game.
  var LINES = {
    first: ["Get in the hole!", "Get in the hole!", "Get in the hole!", "Get in the hole!", "Get in the hole!", "Get in the hole!", "Be the right club!", "Sit! Sit!", "Bite! Bite!", "Go in the hole!", "Mashed potatoes!", "Baba booey!", "Cash money!", "Gooo in the hole!"],
    teeOff: ["Play away, please.", "On the tee.", "Fore, please. Play away.", "Grip it and rip it.", "Hit 'em straight.", "Tee it high and let it fly."],
    firstTee: ["Ladies and gentlemen, welcome to the first tee.", "On the tee, the opening group. Play away, please."],
    knocked: ["Fore!", "Fore, left!", "Fore, right!", "That's in the gorse.", "Into the burn.", "That's in jail.", "Hit a provisional.", "Out of bounds!"],
    birdie: ["Birdie!", "That's a birdie.", "Dropped one.", "Red number.", "Flag hunting.", "Dialed in.", "Stiffed it.", "Pured it."],
    allBirdie: ["Birdies all around!", "That's a gimme.", "Everybody's pin high.", "Easy as a tap-in."],
    nobody: ["Nobody found the green.", "Wedge it out sideways.", "Ugly. Somebody hit a Mulligan.", "That's a lost ball.", "Grab a rake.", "Bogey train, all aboard."],
    bigNumber: ["Big number.", "That's a snowman.", "Card wrecker.", "Ouch. Double."],
    leader: ["New leader in the clubhouse!", "We have a new leader!", "Change at the top!"],
    lastHole: ["Eighteenth hole. Double points. No pressure.", "Final hole, double points. Grind it out."],
    turn: ["Making the turn. Grab a drink and a hot dog.", "Halfway house. Refill your coffee."],
    record: ["New course record!", "That's a new course record! History made."],
    champ: ["And that is the championship!", "Your champion, ladies and gentlemen!", "Hoist the claret jug!", "Slip on the green jacket!"],
    fiveLeft: ["Clock's running.", "Five seconds. Pull the trigger.", "Commit to it!"]
  };

  return {
    fx: fx,
    say: say,
    line: function(kind, opts){ var l = LINES[kind]; if (l) say(pick(l), opts); return l ? true : false; },
    on: function(v){ if (v === undefined) return on; on = !!v; try { localStorage.setItem("foreunder.quiz.sound", on ? "1" : "0"); } catch(e) {} if (!on && window.speechSynthesis) speechSynthesis.cancel(); if (on) ac(); },
    ready: ready,
    unlock: ac,
    onBanner: function(f){ banner = f; }
  };
})();
