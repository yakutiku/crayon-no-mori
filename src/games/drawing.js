// ⑥ おえかき：しろいかみに自由にかく／ぬりえを塗る
import { P, CRAYONS } from '../core/palette.js';
import { s, svg, h, line, CRAYON, CRAYON_LITE } from '../core/crayon.js';
import { coloringSheet, SHEET_COUNT } from '../art/coloring.js';

const BTN = 64;

function crayonArt(color) {
  const g = svg(64, 80);
  g.append(
    s('path', { d: 'M14 26 L32 4 L50 26 Z', fill: color, ...line(3) }),
    s('rect', { x: 10, y: 26, width: 44, height: 50, rx: 4, fill: color, ...line(3.5) }),
    s('rect', { x: 10, y: 42, width: 44, height: 18, fill: P.cream, ...line(2.5) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}
function paperIcon() {
  const g = svg(64, 64);
  g.append(
    s('rect', { x: 10, y: 8, width: 44, height: 50, rx: 5, fill: P.white, ...line(3.5) }),
    s('path', { d: 'M18 40 C24 24 32 50 40 30 S46 24 48 20', fill: 'none', ...line(5, P.orange) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}
function coloringIcon() {
  const g = svg(64, 64);
  g.append(
    s('circle', { cx: 32, cy: 40, r: 18, fill: P.pink, ...line(3.5) }),
    s('path', { d: 'M18 28 L16 12 L30 22 Z M46 28 L48 12 L34 22 Z', fill: P.white, ...line(3.5) }),
    s('circle', { cx: 25, cy: 38, r: 2.5, fill: P.brown }),
    s('circle', { cx: 39, cy: 38, r: 2.5, fill: P.brown }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}
function arrowIcon(dir) {
  const g = svg(64, 64);
  g.append(
    s('circle', { cx: 32, cy: 32, r: 28, fill: P.grass, ...line(3.5) }),
    s('path', { d: dir < 0 ? 'M38 18 L24 32 L38 46' : 'M26 18 L40 32 L26 46', fill: 'none', ...line(6, P.white) }),
  );
  return g;
}
function newPaperIcon() {
  const g = svg(64, 64);
  g.append(
    s('rect', { x: 12, y: 8, width: 40, height: 48, rx: 5, fill: P.white, ...line(3.5) }),
    s('path', { d: 'M32 22 V42 M22 32 H42', fill: 'none', ...line(5, P.sky) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

// 紙のざらざら：クレヨンの色ごとに、小さな点の模様を作る
function makePattern(c2d, color) {
  const n = 64;
  const pc = document.createElement('canvas');
  pc.width = n; pc.height = n;
  const x = pc.getContext('2d');
  x.fillStyle = color;
  x.globalAlpha = 0.72;
  x.fillRect(0, 0, n, n);
  x.globalAlpha = 1;
  for (let i = 0; i < 220; i++) x.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 2, 1 + Math.random() * 2);
  x.globalCompositeOperation = 'destination-out';
  x.globalAlpha = 0.85;
  for (let i = 0; i < 260; i++) x.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5);
  return c2d.createPattern(pc, 'repeat');
}

function pictureButton(icon, label, attrs) {
  const b = h('button', { type: 'button', ...attrs, style: { minWidth: BTN + 'px', minHeight: BTN + 'px', border: 'none', background: 'transparent', padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: P.brown, font: 'inherit', touchAction: 'none' } }, [icon]);
  icon.style.width = BTN + 'px'; icon.style.height = BTN + 'px';
  if (label) b.appendChild(h('span', { text: label, style: { fontSize: '13px', lineHeight: '1', whiteSpace: 'nowrap', letterSpacing: '-0.02em' } }));
  return b;
}

let st = null;

export default {
  id: 'drawing',
  title: 'おえかき',
  icon() {
    const g = svg(120, 120);
    g.append(
      s('rect', { x: 14, y: 20, width: 74, height: 86, rx: 8, fill: P.white, ...line(3.5) }),
      s('path', { d: 'M26 80 C36 44 50 96 62 56 S74 44 78 36', fill: 'none', ...line(7, P.pink) }),
      s('path', { d: 'M92 84 L104 36 L114 40 L102 88 Z', fill: P.orange, ...line(3.5) }),
      s('path', { d: 'M92 84 L102 88 L90 98 Z', fill: P.woodDark, ...line(3) }),
    );
    g.setAttribute('filter', CRAYON);
    return g;
  },

  start(root, ctx) {
    st = { root, ctx };
    root.style.background = P.paper;
    const S = { mode: 'paper', color: CRAYONS[0], sheet: 0, completed: new Set(), cv: null, c2d: null, patterns: {}, pid: null, last: null };

    const modeBtns = {
      paper: pictureButton(paperIcon(), 'しろいかみ', { 'data-mode': 'paper', 'aria-label': 'しろいかみ' }),
      coloring: pictureButton(coloringIcon(), 'ぬりえ', { 'data-mode': 'coloring', 'aria-label': 'ぬりえ' }),
    };
    const prev = pictureButton(arrowIcon(-1), '', { 'data-prev': '1', 'aria-label': 'まえ' });
    const next = pictureButton(arrowIcon(1), '', { 'data-next': '1', 'aria-label': 'つぎ' });
    const fresh = pictureButton(newPaperIcon(), 'あたらしいかみ', { 'data-new': '1', 'aria-label': 'あたらしいかみ' });
    const bar = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '6px 10px', flex: '0 0 auto' } }, [
      h('div', { style: { display: 'flex', gap: '6px' } }, [modeBtns.paper, modeBtns.coloring]),
      h('div', { style: { display: 'flex', gap: '10px' } }, [prev, next]),
      fresh,
    ]);
    const area = h('div', { 'data-area': '1', style: { position: 'relative', flex: '1', minHeight: '0', margin: '0 10px 10px', background: P.white, borderRadius: '14px', border: `3px solid ${P.woodDark}`, overflow: 'hidden', touchAction: 'none' } });
    const work = h('div', { style: { display: 'flex', flexDirection: 'column', flex: '1', minWidth: '0', minHeight: '0' } }, [bar, area]);
    const palette = h('div', { 'data-palette': '1', style: { display: 'grid', flex: '0 0 auto', gap: '6px 10px', justifyContent: 'center', alignContent: 'center', padding: '14px 10px 8px' } });
    const wrap = h('div', { style: { display: 'flex', width: '100%', height: '100%' } }, [work, palette]);
    root.replaceChildren(wrap);

    const land = () => root.clientWidth > root.clientHeight;
    const lift = (on) => (on ? (land() ? '12px 0' : '0 -12px') : '0 0');
    const crayonEls = CRAYONS.map((c) => {
      const b = pictureButton(crayonArt(c.color), '', { 'data-crayon': c.key, 'aria-label': c.key });
      b.style.minHeight = '80px';
      b.firstChild.style.width = '64px'; b.firstChild.style.height = '80px';
      b.style.transition = 'translate .25s ease';
      palette.appendChild(b);
      ctx.listen(b, 'click', () => {
        S.color = c;
        crayonEls.forEach((e) => { e.style.translate = lift(e === b); e.dataset.selected = e === b ? '1' : ''; });
        ctx.sfx('pick');
        ctx.say(c.key, b);
      });
      return b;
    });
    const refreshCrayons = () => crayonEls.forEach((e) => { e.style.translate = lift(e.dataset.selected === '1'); });
    crayonEls[0].dataset.selected = '1';

    // ── しろいかみ（Canvas） ──
    const dprOf = () => Math.min(2, window.devicePixelRatio || 1);
    function fitCanvas() {
      if (!S.cv) return;
      const d = dprOf();
      const w = Math.max(1, Math.round(area.clientWidth * d)); const hh = Math.max(1, Math.round(area.clientHeight * d));
      if (S.cv.width === w && S.cv.height === hh) return;
      const old = document.createElement('canvas');
      old.width = S.cv.width; old.height = S.cv.height;
      old.getContext('2d').drawImage(S.cv, 0, 0);
      S.cv.width = w; S.cv.height = hh;
      S.c2d = S.cv.getContext('2d');
      S.c2d.drawImage(old, 0, 0);
      S.patterns = {};
    }
    function stroke(a, b) {
      const c = S.c2d; const d = dprOf();
      if (!S.patterns[S.color.key]) S.patterns[S.color.key] = makePattern(c, S.color.color);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.strokeStyle = S.patterns[S.color.key];
      c.lineWidth = 18 * d; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(a.x * d, a.y * d); c.lineTo(b.x * d, b.y * d); c.stroke();
    }
    const pt = (e) => { const r = S.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function buildPaper() {
      area.replaceChildren();
      const cv = h('canvas', { 'data-canvas': '1', style: { position: 'absolute', inset: '0', width: '100%', height: '100%', touchAction: 'none' } });
      area.appendChild(cv);
      S.cv = cv; S.c2d = cv.getContext('2d'); S.patterns = {};
      cv.width = 1; cv.height = 1;
      fitCanvas();
      cv.addEventListener('pointerdown', (e) => {
        if (S.pid !== null) return; // 指は1本だけ
        S.pid = e.pointerId; S.last = pt(e);
        try { cv.setPointerCapture(e.pointerId); } catch (_) { /* なくてもよい */ }
        stroke(S.last, S.last);
        e.preventDefault();
      });
      cv.addEventListener('pointermove', (e) => {
        if (e.pointerId !== S.pid) return;
        const p = pt(e); stroke(S.last, p); S.last = p;
      });
      const end = (e) => { if (e.pointerId === S.pid) { S.pid = null; S.last = null; } };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
    }

    // ── ぬりえ ──
    function buildSheet() {
      area.replaceChildren();
      S.cv = null;
      const g = coloringSheet(S.sheet);
      g.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      area.appendChild(g);
      const regs = [...g.querySelectorAll('[data-region]')];
      // タップした場所の区画を、形の計算で探す（iPhone の Safari ではフィルター付きの絵に
      // click が届かないことがあるため、要素のクリックには頼らない）
      const pick = (x, y) => {
        const m = g.getScreenCTM && g.getScreenCTM();
        if (m && regs[0].isPointInFill) {
          const pt = new DOMPoint(x, y).matrixTransform(m.inverse());
          for (let i = regs.length - 1; i >= 0; i--) {
            try { if (regs[i].isPointInFill(pt)) return regs[i]; } catch (e) { break; }
          }
        }
        const el = document.elementFromPoint(x, y);
        return el && el.closest ? el.closest('[data-region]') : null;
      };
      const paint = (r) => {
        r.setAttribute('fill', S.color.color);
        r.dataset.filled = '1';
        ctx.sfx('tap');
        if (regs.every((x) => x.dataset.filled === '1') && !S.completed.has(S.sheet)) {
          S.completed.add(S.sheet);
          ctx.later(() => { ctx.sfx('tada'); ctx.cheer(g, { count: 8, spread: 120 }); ctx.done(); }, 500);
        }
      };
      let down = null;
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); down = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
      g.addEventListener('pointerup', (e) => {
        if (!down || e.pointerId !== down.id) return;
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        down = null;
        if (moved > 30) return;
        const r = pick(e.clientX, e.clientY);
        if (r) paint(r);
      });
      g.addEventListener('pointercancel', () => { down = null; });
    }

    function show() {
      Object.entries(modeBtns).forEach(([k, b]) => { b.style.opacity = k === S.mode ? '1' : '0.55'; b.dataset.on = k === S.mode ? '1' : ''; });
      const col = S.mode === 'coloring';
      prev.style.visibility = next.style.visibility = col ? 'visible' : 'hidden';
      if (col) buildSheet(); else buildPaper();
    }
    function layout() {
      const l = land();
      wrap.style.flexDirection = l ? 'row-reverse' : 'column';
      palette.style.gridTemplateColumns = l ? 'repeat(2, 72px)' : 'repeat(4, 72px)';
      palette.style.padding = l ? '12px 8px 12px 20px' : '16px 10px 8px';
      refreshCrayons();
      fitCanvas();
    }

    Object.entries(modeBtns).forEach(([k, b]) => ctx.listen(b, 'click', () => { ctx.sfx('tap'); S.mode = k; show(); }));
    ctx.listen(prev, 'click', () => { ctx.sfx('tap'); S.sheet = (S.sheet + SHEET_COUNT - 1) % SHEET_COUNT; buildSheet(); });
    ctx.listen(next, 'click', () => { ctx.sfx('tap'); S.sheet = (S.sheet + 1) % SHEET_COUNT; buildSheet(); });
    ctx.listen(fresh, 'click', () => { ctx.sfx('tap'); if (S.mode === 'coloring') { S.completed.delete(S.sheet); buildSheet(); } else buildPaper(); });
    ctx.onResize(layout);

    crayonEls[0].style.translate = lift(true);
    layout();
    show();
  },

  stop() { st = null; },
};
