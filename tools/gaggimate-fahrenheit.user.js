// ==UserScript==
// @name         GaggiMate Fahrenheit
// @namespace    foreunder
// @version      1.0
// @description  Shows GaggiMate temperatures in °F. Display-only: the machine still stores °C, so temperature inputs stay in °C with a live °F hint next to them.
// @match        http://gaggimate.local/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  'use strict';
  const toF = c => c * 9 / 5 + 32;
  const fmt = (v, src) => {
    const d = (String(src).split('.')[1] || '').length;
    return v.toFixed(Math.min(d, 1));
  };
  // "93°C", "93 °C", "97.8°" (bare degree) -> °F. Skips anything already °F.
  const RE = /(-?\d+(?:\.\d+)?)(\s*)°(?:\s?C)?(?!\s*F)/g;
  const convertStr = s => s.replace(RE, (m, n, a) => fmt(toF(parseFloat(n)), n) + a + '°F');

  // 1) Chart labels drawn on canvas (axes/tooltips that include the unit).
  const origFill = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) {
    return origFill.call(this, typeof t === 'string' && t.includes('°') ? convertStr(t) : t, ...r);
  };

  const hasInputNear = el => {
    for (let i = 0, p = el; i < 2 && p; i++, p = p.parentElement)
      if (p.querySelector && p.querySelector('input')) return true;
    return false;
  };
  const isOffset = el => /offset/i.test((el.id || '') + (el.name || '') +
    ((el.closest('div,label') || {}).textContent || '').slice(0, 80));

  // 2) Live °F hint beside temperature inputs (values stay °C on the machine).
  function hint(input) {
    if (input.dataset.gmF) return;
    input.dataset.gmF = '1';
    const delta = isOffset(input);
    const tag = document.createElement('span');
    tag.className = 'gm-f-hint';
    tag.style.cssText = 'margin-left:6px;font-size:0.85em;opacity:0.75;white-space:nowrap';
    const upd = () => {
      const v = parseFloat(input.value);
      tag.textContent = isNaN(v) ? '' : delta
        ? `(Δ ${(v * 1.8).toFixed(1)}°F)` : `(= ${toF(v).toFixed(0)}°F)`;
    };
    input.addEventListener('input', upd);
    input.addEventListener('change', upd);
    upd();
    (input.parentElement || input).appendChild(tag);
    setInterval(upd, 1000); // catches programmatic value changes (+/- buttons)
  }

  // 3) Text on the page.
  function scan(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => {
        const p = n.parentElement;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(p.tagName) || p.closest('.gm-f-hint'))
          return NodeFilter.FILTER_REJECT;
        return n.data.includes('°') || /\d/.test(n.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let lastNum = null, n;
    while ((n = w.nextNode())) {
      const t = n.data;
      if (/^\s*°\s*C\s*$/.test(t)) {                       // unit-only node
        if (hasInputNear(n.parentElement)) {
          n.parentElement.parentElement && n.parentElement.parentElement
            .querySelectorAll('input').forEach(i => { if (i.type !== 'checkbox') hint(i); });
        } else if (lastNum && /-?\d+(?:\.\d+)?\s*$/.test(lastNum.data)) {
          lastNum.data = lastNum.data.replace(/(-?\d+(?:\.\d+)?)(\s*)$/, (m, v, s) => fmt(toF(parseFloat(v)), v) + s);
          n.data = t.replace('C', 'F');
        }
        lastNum = null;
      } else if (/°\s*C|\d\s*°(?!\s*F)/.test(t) && !/°C\)/.test(t)) {
        n.data = convertStr(t); lastNum = null;
      } else if (/-?\d+(?:\.\d+)?\s*$/.test(t)) {
        lastNum = n;
      } else lastNum = null;
    }
  }
  let queued = false;
  const run = () => { queued = false; scan(document.body); };
  const start = () => {
    run();
    new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } })
      .observe(document.body, { subtree: true, childList: true, characterData: true });
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
