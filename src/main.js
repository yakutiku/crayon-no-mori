// 画面の切り替えとホーム画面
import { P, installCssVars } from './core/palette.js';
import { s, svg, h, line, houseIcon, againIcon, installCrayonDefs, CRAYON_LITE } from './core/crayon.js';
import { getSettings, onSettingsChange } from './core/settings.js';
import { levelFor, recordDone } from './core/level.js';
import { unlockAudio, sfx } from './core/sound.js';
import { initSpeech, speak, stopSpeech } from './core/speech.js';
import { word } from './core/words.js';
import { cheer, bounce, wobble, bubble } from './core/feedback.js';
import { draggable, releaseAllDrags } from './core/drag.js';
import { openPanel } from './parent/panel.js';

import colors from './games/colors.js';
import shapes from './games/shapes.js';
import sizes from './games/sizes.js';
import lengths from './games/lengths.js';
import peekaboo from './games/peekaboo.js';
import drawing from './games/drawing.js';
import candles from './games/candles.js';

export const GAMES = [colors, shapes, sizes, lengths, peekaboo, drawing, candles];

const app = document.getElementById('app');
let current = null; // { game, cleanup }
let doneCount = 0;
let updateReady = false;

installCssVars();
installCrayonDefs();
initSpeech();

// ── 子どもの誤操作を防ぐ ──
['gesturestart', 'gesturechange', 'dblclick', 'contextmenu', 'selectstart'].forEach((t) =>
  document.addEventListener(t, (e) => { if (!e.target.closest || !e.target.closest('.panel')) e.preventDefault(); }, { passive: false }));
document.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length > 1) e.preventDefault(); // ピンチで拡大しない
  else if (!e.target.closest('.home-grid, .panel')) e.preventDefault(); // 引っ張って更新しない
}, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd < 350 && !e.target.closest('.panel')) e.preventDefault(); // ダブルタップで拡大しない
  lastTouchEnd = now;
}, { passive: false });
document.addEventListener('pointerdown', () => { unlockAudio(); requestWakeLock(); }, { capture: true });

// ── 画面が暗くならないように（使える端末だけ） ──
let wakeLock = null;
async function requestWakeLock() {
  if (wakeLock || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
  else stopSpeech();
});

// ── 3秒長押しの印（保護者用） ──
export function holdButton(onDone, cls = 'top-right', label = 'ほごしゃの かたへ（3びょう ながおし）') {
  const ring = svg(48, 48, { class: 'ring' });
  const C = 2 * Math.PI * 21;
  const arc = s('circle', { cx: 24, cy: 24, r: 21, fill: 'none', stroke: P.brownSoft, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': C, 'stroke-dashoffset': C, transform: 'rotate(-90 24 24)' });
  ring.append(arc);
  const icon = svg(40, 40);
  // 小さな葉っぱの印（子どもの目を引かない地味な形）
  icon.append(
    s('path', { d: 'M8 32 C8 16 18 8 33 7 C33 22 25 32 8 32 Z', fill: P.graySoft, ...line(2.5, P.brownSoft) }),
    s('path', { d: 'M9 31 L24 16', fill: 'none', ...line(2, P.brownSoft) }),
  );
  const b = h('div', { class: 'hold ' + cls, role: 'button', 'aria-label': label, 'data-hold': '1' }, [icon, ring]);
  let t0 = 0; let raf = 0; let pid = null;
  const HOLD = 3000;
  const tick = () => {
    const p = Math.min(1, (performance.now() - t0) / HOLD);
    arc.setAttribute('stroke-dashoffset', String(C * (1 - p)));
    if (p >= 1) { cancel(); onDone(); return; }
    raf = requestAnimationFrame(tick);
  };
  const cancel = () => { cancelAnimationFrame(raf); pid = null; arc.setAttribute('stroke-dashoffset', String(C)); };
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); pid = e.pointerId; t0 = performance.now(); raf = requestAnimationFrame(tick); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => b.addEventListener(t, (e) => { if (e.pointerId === pid) cancel(); }));
  return b;
}

// ── タイトル（クレヨンで書いた文字の雰囲気） ──
function titleArt() {
  const g = svg(440, 64, { class: 'home-title', role: 'img', 'aria-label': 'クレヨンのもり' });
  const cols = [P.red, P.orange, P.yellow, P.green, P.blue, P.pinkDeep, P.green, P.brown];
  const chars = 'クレヨンのもり'.split('');
  chars.forEach((c, i) => {
    const t = s('text', { x: 40 + i * 60, y: 48, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 700, fill: cols[i % cols.length], stroke: P.brown, 'stroke-width': 1.2, 'paint-order': 'stroke', transform: `rotate(${(i % 2 ? 3 : -3)} ${40 + i * 60} 36)` });
    t.textContent = c;
    g.append(t);
  });
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

// ── ホーム画面 ──
function showHome() {
  const st = getSettings();
  const grid = h('div', { class: 'home-grid' });
  GAMES.filter((g) => !st.hidden.includes(g.id)).forEach((g) => {
    const ic = h('div', { class: 'ic' });
    try { ic.appendChild(g.icon()); } catch (e) { console.error(e); }
    const btn = h('button', { class: 'game-btn', 'data-game': g.id, 'aria-label': g.title }, [ic, h('div', { class: 'lbl', text: g.title })]);
    btn.addEventListener('click', () => { sfx('open'); location.hash = '#/' + g.id; });
    grid.appendChild(btn);
  });
  const scr = h('div', { class: 'screen home' }, [
    h('div', { class: 'home-head' }, [titleArt()]),
    grid,
    holdButton(() => openPanel(app, () => route())),
  ]);
  app.replaceChildren(scr);
}

// ── 遊びの画面 ──
function showGame(game, forcedLevel) {
  const level = forcedLevel || levelFor(game.id);
  const homeBtn = h('button', { class: 'home-btn', 'aria-label': 'おうち', 'data-home': '1' }, [houseIcon()]);
  const topbar = h('div', { class: 'topbar' }, [homeBtn]);
  const root = h('div', { class: 'stage', 'data-stage': game.id, 'data-level': level });
  const fx = h('div', { class: 'fx-layer' });
  const scr = h('div', { class: 'screen game' }, [topbar, h('div', { class: 'stage-wrap', style: { position: 'relative', flex: '1', minHeight: '0', display: 'flex', flexDirection: 'column' } }, [root, fx])]);
  app.replaceChildren(scr);

  const timers = new Set();
  const offs = [];
  const drags = [];
  let againEl = null;
  const st = getSettings();

  const ctx = {
    id: game.id,
    level,
    english: st.english,
    stage: root,
    fx,
    P,
    // 名前を伝える：吹き出し＋（設定がオンなら）声
    say(key, anchor, opts = {}) {
      const w = word(key);
      bubble(fx, anchor || root, key, opts);
      speak(opts.text || w.ja, w.en);
    },
    sfx,
    cheer(anchor, opts) { cheer(fx, anchor, opts); },
    bounce,
    wobble,
    // 最後まで遊べた
    done() {
      recordDone(game.id, level);
      doneCount += 1;
      document.body.dataset.doneCount = String(doneCount);
      document.body.dataset.lastDone = game.id;
    },
    // 「もういっかい」の絵ボタンを出す
    again(fn) {
      if (againEl) againEl.remove();
      againEl = h('button', { class: 'again-btn', 'aria-label': 'もういっかい', 'data-again': '1' }, [againIcon()]);
      againEl.addEventListener('click', () => { sfx('tap'); againEl.remove(); againEl = null; fn(); });
      root.parentElement.appendChild(againEl);
    },
    later(fn, ms) {
      const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
      return id;
    },
    listen(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      offs.push(() => target.removeEventListener(type, fn, opts));
    },
    onResize(fn) {
      let t = 0;
      const handler = () => { clearTimeout(t); t = setTimeout(fn, 150); };
      ctx.listen(window, 'resize', handler);
      ctx.listen(window, 'orientationchange', handler);
    },
    draggable(el, opts) { const d = draggable(el, opts); drags.push(d); return d; },
  };

  homeBtn.addEventListener('click', () => { sfx('back'); location.hash = '#/'; });

  current = {
    game,
    cleanup() {
      try { game.stop && game.stop(); } catch (e) { console.error(e); }
      timers.forEach(clearTimeout);
      offs.forEach((f) => f());
      drags.forEach((d) => d.destroy());
      releaseAllDrags();
      stopSpeech();
    },
  };
  try { game.start(root, ctx); } catch (e) { console.error(e); }
}

// ── 画面の切り替え（#/ と #/colors のようなアドレス） ──
function route() {
  if (current) { current.cleanup(); current = null; }
  const m = location.hash.match(/^#\/([a-z]+)(?:\?level=(\d))?/);
  const game = m && GAMES.find((g) => g.id === m[1]);
  if (game) showGame(game, m[2] ? Number(m[2]) : 0);
  else {
    if (updateReady) { location.reload(); return; }
    showHome();
  }
  checkBedtime();
}
window.addEventListener('hashchange', route);

// ── おしまいの合図 ──
let bedTimer = 0;
let bedShown = false;
let bedStart = Date.now();
function checkBedtime() {
  if (bedShown) showBedtime();
}
function scheduleBedtime() {
  clearTimeout(bedTimer);
  const min = Number(getSettings().bedtime) || 0;
  if (!min) return;
  const left = Math.max(0, bedStart + min * 60000 - Date.now());
  bedTimer = setTimeout(() => { bedShown = true; showBedtime(); }, left);
}
function showBedtime() {
  if (document.querySelector('.bedtime')) return;
  const moon = svg(320, 240, { class: 'moon' });
  moon.append(
    s('path', { d: 'M190 30 A90 90 0 1 0 270 160 A70 70 0 1 1 190 30 Z', fill: P.yellowPale, ...line(3, P.yellow) }),
    s('path', { d: 'M150 120 q8 6 16 0', fill: 'none', ...line(3, P.woodDeep) }),
    s('path', { d: 'M180 136 q8 6 16 0', fill: 'none', ...line(3, P.woodDeep) }),
    ...[[50, 40], [90, 190], [280, 50], [250, 210], [40, 140]].map(([x, y], i) =>
      s('path', { d: `M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3} Z`, fill: P.yellowPale, opacity: 0.6 + (i % 3) * 0.15 })),
  );
  moon.setAttribute('filter', CRAYON_LITE);
  const ov = h('div', { class: 'bedtime', 'data-bedtime': '1' }, [moon, h('div', { class: 'bt-text', text: 'おやすみ' })]);
  ov.appendChild(holdButton(() => { bedShown = false; bedStart = Date.now(); ov.remove(); scheduleBedtime(); }, 'bottom-right', 'とじる（3びょう ながおし）'));
  if (current) current.cleanup(), current = null, location.hash = '#/';
  app.appendChild(ov);
  stopSpeech();
}
onSettingsChange(() => { bedStart = Date.now(); scheduleBedtime(); });

// ── オフライン用の仕組みを登録 ──
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  // 新しい版が届いたら、遊びの途中ではなく、ホームに戻ったときにそっと入れ替える
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', () => { updateReady = true; if (!current) location.reload(); });
  }
}

route();
scheduleBedtime();
