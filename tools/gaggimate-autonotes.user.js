// ==UserScript==
// @name         GaggiMate Auto Shot Notes
// @namespace    foreunder
// @version      1.0
// @description  After every shot, fills Beans, Grind and Dose In with what you used on the last shot of the same profile. Only fills blank fields; anything you type wins and becomes the new default.
// @match        http://gaggimate.local/*
// @match        http://192.168.*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  'use strict';
  const KEY = 'foreunder.autonotes.v1';      // { [profileLabel]: { id, beanType, grindSetting, doseIn } }
  const FIELDS = ['beanType', 'grindSetting', 'doseIn'];

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const store = m => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* storage off */ } };
  const blank = v => v === undefined || v === null || String(v).trim() === '';

  let ws, profile = '', ridSeq = 0;
  const pending = new Map();

  function connect() {
    ws = new WebSocket(`ws://${location.host}/ws`);
    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch (_) { return; }
      if (m.tp === 'evt:status' && m.p) profile = m.p;
      if (m.rid && pending.has(m.rid)) { pending.get(m.rid)(m); pending.delete(m.rid); }
      if (m.tp === 'evt:history-shot-saved' && m.id) {
        const p = profile;                       // profile that was selected when the shot finished
        setTimeout(() => fill(String(m.id), p), 800);
      }
    };
    ws.onclose = () => setTimeout(connect, 3000); // survives the machine restarting or Wi-Fi blips
  }

  function req(msg) {
    return new Promise((resolve, reject) => {
      const rid = `an${Date.now()}${++ridSeq}`;
      pending.set(rid, resolve);
      ws.send(JSON.stringify({ ...msg, rid }));
      setTimeout(() => { if (pending.delete(rid)) reject(new Error('timeout')); }, 5000);
    });
  }
  const getNotes = async id => {
    const r = await req({ tp: 'req:history:notes:get', id });
    const n = typeof r.notes === 'string' ? JSON.parse(r.notes || '{}') : (r.notes || {});
    return n || {};
  };

  async function fill(id, p) {
    if (!p) return;
    try {
      const map = load();
      let last = map[p] || null;

      // Re-read the previous shot so corrections you typed there become the new defaults.
      if (last && last.id && last.id !== id) {
        const prev = await getNotes(last.id).catch(() => ({}));
        last = { ...last, ...Object.fromEntries(FIELDS.filter(f => !blank(prev[f])).map(f => [f, prev[f]])) };
      }

      const notes = await getNotes(id);
      const filled = [];
      if (last) for (const f of FIELDS) if (blank(notes[f]) && !blank(last[f])) { notes[f] = last[f]; filled.push(f); }

      if (filled.length) {
        if (!blank(notes.doseIn) && !blank(notes.doseOut))
          notes.ratio = (parseFloat(notes.doseOut) / parseFloat(notes.doseIn)).toFixed(2);
        notes.id = id;
        await req({ tp: 'req:history:notes:save', id, notes });
        toast(`#${id} auto-filled: ${notes.beanType || '—'} · grind ${notes.grindSetting || '—'} · ${notes.doseIn || '—'} g`);
      }

      map[p] = { id, ...Object.fromEntries(FIELDS.map(f => [f, notes[f] || (last && last[f]) || ''])) };
      store(map);
    } catch (e) {
      toast(`Auto-notes skipped for #${id} (${e.message})`);
    }
  }

  function toast(text) {
    const t = document.createElement('div');
    t.textContent = text;
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;' +
      'background:#1f2937;color:#fff;padding:10px 16px;border-radius:10px;font:14px system-ui;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.35);max-width:90vw;text-align:center';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 5000);
  }

  connect();
})();
