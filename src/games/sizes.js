// ③ おおきい・ちいさい：くまをベッドへ、ブロックを大きいものから積む（モンテッソーリの「ピンクタワー」）
import { P } from '../core/palette.js';
import { s, svg, h, line, shuffle, CRAYON, CRAYON_LITE } from '../core/crayon.js';

// level 1 はくま、2・3 はブロックの数
const BLOCKS = { 2: 3, 3: 5 };

function bearArt() {
  const g = svg(120, 120);
  g.append(
    s('circle', { cx: 30, cy: 30, r: 17, fill: P.woodDark, ...line(3.5) }),
    s('circle', { cx: 90, cy: 30, r: 17, fill: P.woodDark, ...line(3.5) }),
    s('circle', { cx: 30, cy: 31, r: 8, fill: P.wood, ...line(2.5, P.brownSoft) }),
    s('circle', { cx: 90, cy: 31, r: 8, fill: P.wood, ...line(2.5, P.brownSoft) }),
    s('ellipse', { cx: 60, cy: 94, rx: 34, ry: 24, fill: P.woodDark, ...line(3.5) }),
    s('ellipse', { cx: 60, cy: 97, rx: 20, ry: 15, fill: P.wood, ...line(2.5, P.brownSoft) }),
    s('circle', { cx: 60, cy: 54, r: 37, fill: P.woodDark, ...line(3.5) }),
    s('ellipse', { cx: 60, cy: 66, rx: 15, ry: 11, fill: P.wood, ...line(2.5, P.brownSoft) }),
    s('ellipse', { cx: 60, cy: 61, rx: 5.5, ry: 4, fill: P.brown }),
    s('path', { d: 'M60 65 V69 M53 71 q7 5 14 0', fill: 'none', ...line(2.5) }),
    s('circle', { cx: 46, cy: 48, r: 3.8, fill: P.brown }),
    s('circle', { cx: 74, cy: 48, r: 3.8, fill: P.brown }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

function bedArt() {
  const g = svg(200, 144);
  g.append(
    s('rect', { x: 10, y: 24, width: 180, height: 110, rx: 14, fill: P.woodDark, ...line(4) }),
    s('rect', { x: 22, y: 36, width: 156, height: 50, rx: 10, fill: P.wood, ...line(3, P.brownSoft) }),
    s('rect', { x: 6, y: 84, width: 188, height: 40, rx: 12, fill: P.skyPale, ...line(4) }),
    s('path', { d: 'M20 100 H180 M20 112 H180', fill: 'none', ...line(2.5, P.sky) }),
    s('rect', { x: 14, y: 120, width: 22, height: 20, rx: 6, fill: P.woodDeep, ...line(3.5) }),
    s('rect', { x: 164, y: 120, width: 22, height: 20, rx: 6, fill: P.woodDeep, ...line(3.5) }),
  );
  g.setAttribute('filter', CRAYON);
  return g;
}

// ピンクのブロック（立方体の正面）
function blockArt() {
  const g = svg(100, 100);
  g.append(
    s('rect', { x: 4, y: 4, width: 92, height: 92, rx: 8, fill: P.pink, ...line(4) }),
    s('rect', { x: 18, y: 18, width: 64, height: 64, rx: 5, fill: 'none', ...line(2.5, P.pinkDeep) }),
    s('path', { d: 'M12 26 V14 H24', fill: 'none', ...line(3, P.white) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

function matArt() {
  const g = svg(100, 20, { preserveAspectRatio: 'none' });
  g.append(s('rect', { x: 3, y: 3, width: 94, height: 14, rx: 6, fill: P.woodDark, ...line(3) }));
  g.setAttribute('filter', CRAYON);
  return g;
}

function birdArt() {
  const g = svg(90, 80);
  g.append(
    s('path', { d: 'M20 40 L4 32 L6 48 Z', fill: P.sky, ...line(3) }),
    s('ellipse', { cx: 44, cy: 44, rx: 30, ry: 24, fill: P.sky, ...line(3.5) }),
    s('path', { d: 'M30 44 C36 30 56 32 58 46 C48 54 36 54 30 44 Z', fill: P.skyPale, ...line(3, P.brownSoft) }),
    s('circle', { cx: 62, cy: 32, r: 15, fill: P.sky, ...line(3.5) }),
    s('path', { d: 'M74 30 L86 34 L74 38 Z', fill: P.orange, ...line(3) }),
    s('circle', { cx: 65, cy: 29, r: 3.2, fill: P.brown }),
    s('path', { d: 'M38 66 V74 M50 66 V74', fill: 'none', ...line(3, P.orange) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

let st = null;

export default {
  id: 'sizes',
  title: 'おおきい・ちいさい',
  icon() {
    const g = svg(120, 120);
    g.append(
      s('rect', { x: 8, y: 52, width: 66, height: 60, rx: 8, fill: P.pink, ...line(3.5) }),
      s('rect', { x: 20, y: 64, width: 42, height: 36, rx: 4, fill: 'none', ...line(2.5, P.pinkDeep) }),
      s('rect', { x: 76, y: 82, width: 32, height: 30, rx: 6, fill: P.pink, ...line(3.5) }),
      s('rect', { x: 28, y: 22, width: 30, height: 30, rx: 6, fill: P.pink, ...line(3.5) }),
      s('path', { d: 'M82 34 C82 26 94 26 94 34 C94 40 88 44 88 44 C88 44 82 40 82 34 Z', fill: P.sky, ...line(3) }),
    );
    g.setAttribute('filter', CRAYON);
    return g;
  },

  start(root, ctx) {
    st = { root, ctx };
    root.style.background = P.paper;
    const play = () => (ctx.level === 1 ? bearRound(root, ctx) : towerRound(root, ctx));
    ctx.onResize(play);
    play();
  },

  stop() { st = null; },
};

function fadeIn(root) {
  const scene = h('div', { style: { position: 'absolute', inset: '0', opacity: '0', transition: 'opacity 1.4s ease' } });
  root.appendChild(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => { scene.style.opacity = '1'; }));
  return scene;
}

// 小鳥がふわっと飛んできて、(cx, topY) にとまる
function birdLands(root, ctx, scene, cx, topY, after) {
  const W = root.clientWidth;
  const bw = 72; const bh = 64;
  const bird = birdArt();
  bird.style.cssText = `position:absolute;left:${cx - bw / 2}px;top:${Math.max(4, topY - bh + 8)}px;width:${bw}px;height:${bh}px;pointer-events:none;z-index:8`;
  bird.dataset.bird = '1';
  scene.appendChild(bird);
  if (bird.animate) {
    bird.animate(
      [
        { translate: `${-cx - 90}px -50px`, opacity: 0 },
        { translate: `${-cx * 0.5}px -70px`, opacity: 1, offset: 0.35 },
        { translate: `${W * 0.08}px -30px`, offset: 0.75 },
        { translate: '0 0', opacity: 1 },
      ],
      { duration: 3200, easing: 'ease-in-out', fill: 'both' },
    );
  }
  ctx.later(() => {
    ctx.bounce(bird);
    ctx.sfx('tada');
    const r = root.getBoundingClientRect();
    ctx.cheer({ x: r.left + cx, y: r.top + topY - 30 }, { count: 5, spread: 80 });
  }, 3300);
  ctx.later(() => { ctx.done(); ctx.again(after); }, 4400);
}

// ── レベル1：おおきいくまとちいさいくまを、合うベッドへ ──
function bearRound(root, ctx) {
  root.replaceChildren();
  const W = root.clientWidth; const H = root.clientHeight;
  const scene = fadeIn(root);
  const sc = Math.min(1.3, (W - 24) / 330);
  const bed = { big: 200 * sc, small: 112 * sc };
  const bear = { big: 124 * sc, small: Math.max(68, 68 * sc) };
  const bedH = (w) => w * 0.72;
  const bottom = H - 130;
  const m = (W - bed.big - bed.small) / 3;
  const order = shuffle(['big', 'small']);
  const beds = [];
  let x = m;
  order.forEach((sz) => {
    const w = bed[sz]; const hh = bedH(w);
    const art = bedArt();
    art.style.width = '100%'; art.style.height = '100%';
    const el = h('div', { 'data-bed': sz, style: { position: 'absolute', left: x + 'px', top: (bottom - hh) + 'px', width: w + 'px', height: hh + 'px' } }, [art]);
    scene.appendChild(el);
    beds.push({ el, sz, w, hh, x });
    x += w + m;
  });
  const bedTop = Math.min(...beds.map((b) => bottom - b.hh));
  const bears = shuffle(['big', 'small']);
  let left = 2;
  bears.forEach((sz, i) => {
    const w = bear[sz];
    const cx = W * (i === 0 ? 0.27 : 0.73);
    const cy = Math.max(w / 2 + 12, bedTop / 2);
    const art = bearArt();
    art.style.width = '100%'; art.style.height = '100%';
    const el = h('div', { 'data-bear': sz, style: { position: 'absolute', left: (cx - w / 2) + 'px', top: (cy - w / 2) + 'px', width: w + 'px', height: w + 'px', zIndex: 3 } }, [art]);
    scene.appendChild(el);
    ctx.draggable(el, {
      targets: () => beds.map((b) => b.el),
      accepts: (t) => t.dataset.bed === sz,
      magnet: 60,
      onPick: () => ctx.sfx('pick'),
      onDrop: (t) => {
        el.dataset.placed = '1';
        ctx.sfx('fit');
        ctx.bounce(el);
        ctx.say(sz, t);
        left -= 1;
        if (left === 0) {
          const bb = beds.find((b) => b.sz === 'big');
          ctx.later(() => birdLands(root, ctx, scene, bb.x + bb.w / 2, bottom - bb.hh, () => bearRound(root, ctx)), 1400);
        }
      },
      onMiss: () => { ctx.wobble(el); ctx.sfx('back'); },
    });
  });
}

// ── レベル2・3：ブロックを大きいものから積む ──
function towerRound(root, ctx) {
  root.replaceChildren();
  const n = BLOCKS[ctx.level] || 3;
  const W = root.clientWidth; const H = root.clientHeight;
  const portrait = W < 700;
  const scene = fadeIn(root);

  // ブロックの辺の長さ（小さい順）
  const minS = portrait ? 64 : 72;
  const d = portrait ? (n === 3 ? 26 : 12) : (n === 3 ? 34 : 18);
  const sides = Array.from({ length: n }, (_, i) => minS + i * d);
  const towerH = sides.reduce((a, b) => a + b, 0);
  const maxS = sides[n - 1];

  // 台の位置：たては上に塔・下にブロック、よこは右に塔・左にブロック
  const cx = portrait ? W / 2 : W * 0.76;
  const baseY = portrait ? towerH + 66 : H - 50;
  const mat = matArt();
  mat.style.cssText = `position:absolute;left:${cx - maxS / 2 - 24}px;top:${baseY}px;width:${maxS + 48}px;height:20px`;
  mat.dataset.base = '1';
  scene.appendChild(mat);

  // 積む場所（次に積む段）
  const slot = h('div', { 'data-slot': '1', style: { position: 'absolute', border: `3px dashed ${P.brownSoft}`, borderRadius: '10px', boxSizing: 'border-box', opacity: '0.55', transition: 'left .6s ease, top .6s ease, width .6s ease, height .6s ease' } });
  scene.appendChild(slot);
  let next = n - 1;
  let stackH = 0;
  const placeSlot = () => {
    const sd = sides[next];
    slot.style.width = sd + 'px'; slot.style.height = sd + 'px';
    slot.style.left = (cx - sd / 2) + 'px';
    slot.style.top = (baseY - stackH - sd) + 'px';
    slot.dataset.rank = String(next);
  };
  placeSlot();

  // ブロックをばらばらに置く
  const area = portrait
    ? { x: 12, y: baseY + 20 + 14, w: W - 24, h: H - baseY - 20 - 14 - 14 }
    : { x: 20, y: 20, w: W * 0.5, h: H - 40 };
  const cols = Math.min(n, 3);
  const rows = Math.ceil(n / cols);
  const cw = area.w / cols; const ch = area.h / rows;
  const order = shuffle(sides.map((_, i) => i));
  order.forEach((rank, i) => {
    const r = Math.floor(i / cols); const c = i % cols;
    const inRow = r === rows - 1 ? n - r * cols : cols;
    const off = (cols - inRow) * cw / 2;
    const sd = sides[rank];
    const jx = Math.max(0, cw - sd) / 2 * 0.5; const jy = Math.max(0, ch - sd) / 2 * 0.5;
    const px = area.x + off + c * cw + cw / 2 + (Math.random() * 2 - 1) * jx;
    const py = area.y + r * ch + ch / 2 + (Math.random() * 2 - 1) * jy;
    const art = blockArt();
    art.style.width = '100%'; art.style.height = '100%';
    const el = h('div', { 'data-block': rank, style: { position: 'absolute', left: (px - sd / 2) + 'px', top: (py - sd / 2) + 'px', width: sd + 'px', height: sd + 'px' } }, [art]);
    scene.appendChild(el);
    ctx.draggable(el, {
      targets: () => [slot],
      accepts: () => rank === next,
      magnet: 56,
      onPick: () => ctx.sfx('pick'),
      onDrop: () => {
        el.dataset.placed = '1';
        el.style.zIndex = '2';
        ctx.sfx('fit');
        ctx.bounce(el);
        const first = stackH === 0;
        stackH += sd;
        if (rank === 0) {
          slot.style.display = 'none';
          ctx.say('small', el);
          ctx.later(() => birdLands(root, ctx, scene, cx, baseY - stackH, () => towerRound(root, ctx)), 1300);
        } else {
          if (first) ctx.say('big', el);
          next -= 1;
          placeSlot();
        }
      },
      onMiss: () => { ctx.wobble(el); ctx.sfx('back'); },
    });
  });
}
