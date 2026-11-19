// ② かたちあわせ：木の板の穴に、同じかたちのピースをはめる（モンテッソーリの「幾何図形のはめ込み」）
import { P, LEARN_COLORS } from '../core/palette.js';
import { s, svg, h, line, flower, shuffle, CRAYON, CRAYON_LITE } from '../core/crayon.js';

const LEVELS = { 1: ['circle', 'square'], 2: ['circle', 'square', 'triangle'], 3: ['circle', 'square', 'triangle', 'star', 'heart'] };

// 100×100 の中のかたち
function starPath() {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 19 : 42;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(1)} ${(54 + Math.sin(a) * r).toFixed(1)}`);
  }
  return 'M' + pts.join(' L') + ' Z';
}
const PATHS = {
  circle: 'M50 10 A40 40 0 1 1 49.9 10 Z',
  square: 'M18 14 H82 Q88 14 88 20 V80 Q88 86 82 86 H18 Q12 86 12 80 V20 Q12 14 18 14 Z',
  triangle: 'M50 12 L90 84 L10 84 Z',
  star: starPath(),
  heart: 'M50 88 C8 58 4 30 26 18 C38 12 47 19 50 28 C53 19 62 12 74 18 C96 30 92 58 50 88 Z',
};

// ピース（1回の中ではぜんぶ同じ色。色は回ごとに4色から選ぶ。まるいつまみ付き）
let pieceColor = P.blue;
function pieceArt(shape) {
  const g = svg(100, 100);
  g.append(
    s('path', { d: PATHS[shape], fill: pieceColor, ...line(4.5), 'stroke-width': 5 }),
    s('circle', { cx: 50, cy: shape === 'triangle' ? 62 : 50, r: 10, fill: P.wood, ...line(3.5) }),
    s('path', { d: `M46 ${shape === 'triangle' ? 58 : 46} q3 -3 6 -1`, fill: 'none', ...line(2, P.white) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

// 穴（板に空いたくぼみ）
function holeArt(shape) {
  const g = svg(100, 100);
  g.append(
    s('path', { d: PATHS[shape], fill: P.woodDeep, ...line(4, P.woodDeep), 'stroke-width': 5 }),
    s('path', { d: PATHS[shape], fill: 'none', ...line(2.5, P.brown), transform: 'translate(1.5 2.5)', opacity: 0.55 }),
  );
  return g;
}

// 板（木の板。とじた木箱の絵も）
function boxArt() {
  const g = svg(200, 130);
  g.append(
    s('path', { d: 'M12 40 H188 L180 118 Q179 124 172 124 H28 Q21 124 20 118 Z', fill: P.woodDark, ...line(4) }),
    s('path', { d: 'M24 70 H176 M26 96 H174', fill: 'none', ...line(2.5, P.woodDeep) }),
    s('rect', { x: 8, y: 28, width: 184, height: 20, rx: 9, fill: P.wood, ...line(4) }),
  );
  g.setAttribute('filter', CRAYON);
  return g;
}
function boxLidArt() {
  const g = svg(200, 60);
  g.append(
    s('path', { d: 'M8 52 C12 14 188 14 192 52 Z', fill: P.wood, ...line(4) }),
    s('rect', { x: 84, y: 6, width: 32, height: 14, rx: 7, fill: pieceColor, ...line(3.5) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

let st = null;

export default {
  id: 'shapes',
  title: 'かたちあわせ',
  icon() {
    const g = svg(120, 120);
    g.append(
      s('rect', { x: 8, y: 22, width: 104, height: 84, rx: 12, fill: P.wood, ...line(4) }),
      s('circle', { cx: 36, cy: 52, r: 16, fill: P.woodDeep, ...line(3) }),
      s('rect', { x: 62, y: 38, width: 32, height: 30, rx: 5, fill: P.woodDeep, ...line(3) }),
      s('path', { d: 'M36 100 L52 76 L68 100 Z', fill: P.blue, ...line(3.5) }),
      s('circle', { cx: 94, cy: 90, r: 13, fill: P.blue, ...line(3.5) }),
      s('circle', { cx: 94, cy: 90, r: 4, fill: P.wood, ...line(2.5) }),
    );
    g.setAttribute('filter', CRAYON);
    return g;
  },

  start(root, ctx) {
    st = { root, ctx };
    root.style.background = P.paper;
    const play = () => round(root, ctx);
    ctx.onResize(play);
    play();
  },

  stop() { st = null; },
};

// n 個を cols 列に並べたときの、各マスの中心。area は {x,y,w,h}
function grid(n, cols, area) {
  const rows = Math.ceil(n / cols);
  const cw = area.w / cols; const ch = area.h / rows;
  const cell = Math.min(cw, ch);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols); const c = i % cols;
    const inRow = r === rows - 1 ? n - r * cols : cols;
    const off = (cols - inRow) * cw / 2;
    pts.push({ x: area.x + off + c * cw + cw / 2, y: area.y + r * ch + ch / 2 });
  }
  return { pts, cell, rows };
}

function round(root, ctx) {
  const choices = LEARN_COLORS.filter((c) => c.color !== pieceColor);
  pieceColor = choices[Math.floor(Math.random() * choices.length)].color;
  root.replaceChildren();
  const shapes = LEVELS[ctx.level] || LEVELS[1];
  const n = shapes.length;
  const W = root.clientWidth; const H = root.clientHeight;
  const portrait = W < 600;
  const cols = portrait ? Math.min(n, 3) : n;
  const rows = Math.ceil(n / cols);

  // 上が板、下がピース置き場。ぜんぶ同じ大きさのマスで揃える
  const padX = 20;
  const cellW = (W - padX * 2) / cols;
  const cellH = (H - 60) / (rows * 2) - 12;
  const cell = Math.max(88, Math.min(cellW, cellH, 150));
  const size = Math.max(64, Math.min(cell * 0.78, 112));
  const boardH = rows * cell + 28;
  const boardW = Math.min(W - 24, cols * cell + 40);
  const boardX = (W - boardW) / 2;
  const boardY = 14;
  const trayY = boardY + boardH + 18;
  const trayH = Math.max(rows * cell, H - trayY - 110);

  const scene = h('div', { style: { position: 'absolute', inset: '0', opacity: '0', transition: 'opacity 1.4s ease' } });
  root.appendChild(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => { scene.style.opacity = '1'; }));

  // 板
  const board = h('div', { style: { position: 'absolute', left: boardX + 'px', top: boardY + 'px', width: boardW + 'px', height: boardH + 'px', borderRadius: '18px', background: P.wood, border: `4px solid ${P.brown}`, boxShadow: `0 6px 0 ${P.woodDark}`, boxSizing: 'border-box' } });
  scene.appendChild(board);

  const hg = grid(n, cols, { x: boardX, y: boardY + 8, w: boardW, h: boardH - 16 });
  const holeOrder = shuffle(shapes);
  const holes = holeOrder.map((shape, i) => {
    const ang = ctx.level >= 3 && shape !== 'circle' ? (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 22) : 0;
    const art = holeArt(shape);
    art.style.width = '100%'; art.style.height = '100%';
    art.style.rotate = ang + 'deg';
    const el = h('div', { 'data-hole': shape, 'data-angle': Math.round(ang), style: { position: 'absolute', left: (hg.pts[i].x - size / 2) + 'px', top: (hg.pts[i].y - size / 2) + 'px', width: size + 'px', height: size + 'px' } }, [art]);
    scene.appendChild(el);
    return { el, shape, ang };
  });

  // ピース置き場（ばらばらの順）
  const pg = grid(n, cols, { x: padX, y: trayY, w: W - padX * 2, h: trayH });
  const pieceOrder = shuffle(shapes);
  let left = n;
  pieceOrder.forEach((shape, i) => {
    const art = pieceArt(shape);
    art.style.width = '100%'; art.style.height = '100%';
    art.style.transition = 'rotate .4s ease';
    const el = h('div', { 'data-piece': shape, style: { position: 'absolute', left: (pg.pts[i].x - size / 2) + 'px', top: (pg.pts[i].y - size / 2) + 'px', width: size + 'px', height: size + 'px' } }, [art]);
    scene.appendChild(el);
    ctx.draggable(el, {
      targets: () => holes.map((x) => x.el),
      accepts: (t) => t.dataset.hole === shape,
      magnet: Math.min(60, size * 0.6),
      onPick: () => ctx.sfx('pick'),
      onDrop: (t) => {
        const hole = holes.find((x) => x.el === t);
        el.dataset.placed = '1';
        art.style.rotate = hole.ang + 'deg';
        ctx.sfx('fit');
        ctx.bounce(el);
        ctx.say(shape, t);
        // 穴から小さな花が咲く
        const fl = flower(P.pink, 30);
        fl.style.cssText = `position:absolute;left:${parseFloat(t.style.left) + size - 18}px;top:${parseFloat(t.style.top) - 12}px;transform:scale(0);transition:transform .8s cubic-bezier(.3,1.4,.5,1);pointer-events:none;`;
        scene.appendChild(fl);
        requestAnimationFrame(() => requestAnimationFrame(() => { fl.style.transform = 'scale(1)'; }));
        ctx.cheer(t, { count: 3, spread: 50 });
        left -= 1;
        if (left === 0) ctx.later(() => tidyUp(root, ctx, scene, { x: boardX, y: boardY, w: boardW, h: boardH }), 1400);
      },
      onMiss: () => ctx.sfx('back'),
    });
  });
}

// おかたづけ：板ごと、ゆっくり木箱にしまわれる
function tidyUp(root, ctx, scene, b) {
  const W = root.clientWidth; const H = root.clientHeight;
  const bw = Math.min(260, W - 60); const bh = bw * 0.65;
  const bx = (W - bw) / 2; const by = H - bh - 130;
  const box = boxArt();
  box.style.cssText = `position:absolute;left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;opacity:0;transition:opacity .8s;z-index:5`;
  root.appendChild(box);
  requestAnimationFrame(() => { box.style.opacity = '1'; });
  ctx.later(() => {
    const k = (bw * 0.78) / b.w;
    const dx = (bx + bw / 2) - (b.x + b.w / 2);
    const dy = (by + bh * 0.32) - (b.y + b.h / 2);
    scene.style.transformOrigin = `${b.x + b.w / 2}px ${b.y + b.h / 2}px`;
    scene.style.transition = 'transform 2s cubic-bezier(.45,.1,.35,1), opacity 1.2s ease 1.1s';
    scene.style.transform = `translate(${dx}px, ${dy}px) scale(${k})`;
    scene.style.opacity = '0';
  }, 900);
  ctx.later(() => {
    const lid = boxLidArt();
    lid.style.cssText = `position:absolute;left:${bx - 4}px;width:${bw + 8}px;height:${bw * 0.3}px;top:${by - bh * 0.7}px;opacity:0;transition:top .9s ease, opacity .5s;z-index:6`;
    root.appendChild(lid);
    requestAnimationFrame(() => requestAnimationFrame(() => { lid.style.top = (by - bw * 0.3 * 0.55) + 'px'; lid.style.opacity = '1'; }));
  }, 3100);
  ctx.later(() => {
    ctx.sfx('tada');
    ctx.cheer({ x: root.getBoundingClientRect().left + W / 2, y: root.getBoundingClientRect().top + by }, { count: 5, spread: 100 });
    ctx.done();
    ctx.again(() => round(root, ctx));
  }, 4300);
}
