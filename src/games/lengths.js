// ④ ながい・みじかい：長さのちがうクレヨンを、クレヨン箱の同じ長さのくぼみへ（モンテッソーリの「赤い棒」）
import { P } from '../core/palette.js';
import { s, svg, h, line, shuffle, CRAYON, CRAYON_LITE } from '../core/crayon.js';

const COUNT = { 1: 2, 2: 3, 3: 5 };

// クレヨンの形（左はまっすぐ、右がとがる）
function silhouette(L, T) {
  const bx = L - T * 0.55;
  return `M5 5 H${bx} L${L - 4} ${T / 2} L${bx} ${T - 5} H5 Z`;
}

function crayonArt(L, T) {
  const g = svg(L, T);
  const bw = L * 0.42; const bx = L * 0.16;
  g.append(
    s('path', { d: silhouette(L, T), fill: P.red, ...line(3.5), 'stroke-width': 4 }),
    s('rect', { x: bx, y: 6, width: bw, height: T - 12, fill: P.cream, ...line(2.5, P.brownSoft) }),
    s('path', { d: `M${bx + 8} ${T * 0.38} H${bx + bw - 8} M${bx + 8} ${T * 0.62} H${bx + bw - 8}`, fill: 'none', ...line(3, P.red) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

function hollowArt(L, T) {
  const g = svg(L, T);
  g.append(
    s('path', { d: silhouette(L, T), fill: P.woodDeep, ...line(4, P.woodDeep), 'stroke-width': 6 }),
    s('path', { d: silhouette(L, T), fill: 'none', ...line(2.5, P.brown), transform: 'translate(1.5 2.5)', opacity: 0.5 }),
  );
  return g;
}

function lidArt(w, hh) {
  const g = svg(w, hh);
  g.append(
    s('rect', { x: 4, y: 4, width: w - 8, height: hh - 8, rx: 18, fill: P.woodDark, ...line(4) }),
    s('path', { d: `M24 ${hh * 0.3} H${w - 24} M24 ${hh * 0.55} H${w - 24} M24 ${hh * 0.8} H${w - 24}`, fill: 'none', ...line(2.5, P.woodDeep) }),
    s('rect', { x: w / 2 - 36, y: hh / 2 - 14, width: 72, height: 28, rx: 14, fill: P.wood, ...line(3.5) }),
    s('circle', { cx: w / 2, cy: hh / 2, r: 6, fill: P.red, ...line(2.5) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

function ladybugArt() {
  const g = svg(40, 48);
  g.append(
    s('path', { d: 'M16 8 L12 1 M24 8 L28 1', fill: 'none', ...line(2.5) }),
    s('circle', { cx: 20, cy: 10, r: 7, fill: P.brown, ...line(2.5) }),
    s('ellipse', { cx: 20, cy: 28, rx: 16, ry: 18, fill: P.orange, ...line(3) }),
    s('path', { d: 'M20 12 V46', fill: 'none', ...line(2.5) }),
    s('circle', { cx: 13, cy: 26, r: 3.5, fill: P.brown }),
    s('circle', { cx: 27, cy: 26, r: 3.5, fill: P.brown }),
    s('circle', { cx: 14, cy: 38, r: 3, fill: P.brown }),
    s('circle', { cx: 26, cy: 38, r: 3, fill: P.brown }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

let st = null;

export default {
  id: 'lengths',
  title: 'ながい・みじかい',
  icon() {
    const g = svg(120, 120);
    g.append(
      s('rect', { x: 8, y: 14, width: 104, height: 96, rx: 12, fill: P.wood, ...line(4) }),
      s('path', { d: 'M18 28 H98 L104 34 L98 40 H18 Z', fill: P.red, ...line(3.5) }),
      s('path', { d: 'M18 52 H78 L84 58 L78 64 H18 Z', fill: P.red, ...line(3.5) }),
      s('path', { d: 'M18 76 H52 L58 82 L52 88 H18 Z', fill: P.red, ...line(3.5) }),
      s('rect', { x: 28, y: 28, width: 26, height: 12, fill: P.cream, ...line(2, P.brownSoft) }),
      s('rect', { x: 28, y: 52, width: 20, height: 12, fill: P.cream, ...line(2, P.brownSoft) }),
      s('rect', { x: 26, y: 76, width: 14, height: 12, fill: P.cream, ...line(2, P.brownSoft) }),
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

function round(root, ctx) {
  root.replaceChildren();
  const n = COUNT[ctx.level] || 2;
  const W = root.clientWidth; const H = root.clientHeight;
  const portrait = W < 700;
  const T = portrait ? 64 : 70;
  const minL = portrait ? 100 : 140;
  const maxL = portrait ? Math.min(300, W - 24 - 36) : 500;
  // 短い順
  const lens = Array.from({ length: n }, (_, k) => Math.round(minL + (maxL - minL) * k / (n - 1)));

  const scene = h('div', { style: { position: 'absolute', inset: '0', opacity: '0', transition: 'opacity 1.4s ease' } });
  root.appendChild(scene);
  requestAnimationFrame(() => requestAnimationFrame(() => { scene.style.opacity = '1'; }));

  // クレヨン箱（上）。くぼみは長い順に上から、左をそろえる
  const rowH = T + 10;
  const boxW = maxL + 36; const boxH = n * rowH + 28;
  const boxX = (W - boxW) / 2; const boxY = 14;
  const box = h('div', { 'data-box': '1', style: { position: 'absolute', left: boxX + 'px', top: boxY + 'px', width: boxW + 'px', height: boxH + 'px', boxSizing: 'border-box', background: P.wood, border: `4px solid ${P.brown}`, borderRadius: '18px', boxShadow: `0 6px 0 ${P.woodDark}` } });
  scene.appendChild(box);
  const x0 = boxX + 18;
  const rowY = (k) => boxY + 14 + (n - 1 - k) * rowH + 5 + T / 2; // k = 長さの順位（0が一番短い）
  const slots = lens.map((L, k) => {
    const art = hollowArt(L, T);
    art.style.width = '100%'; art.style.height = '100%';
    const el = h('div', { 'data-slot': k, style: { position: 'absolute', left: x0 + 'px', top: (rowY(k) - T / 2) + 'px', width: L + 'px', height: T + 'px' } }, [art]);
    scene.appendChild(el);
    return el;
  });

  // クレヨン（下にばらばら）。長い順に、入るだけ同じ段に詰める
  const availW = W - 24; const gap = 14;
  const rowsList = [];
  [...lens.keys()].reverse().forEach((k) => {
    const L = lens[k];
    const row = rowsList.find((r) => r.w + gap + L <= availW);
    if (row) { row.items.push(k); row.w += gap + L; } else rowsList.push({ items: [k], w: L });
  });
  const rowOrder = shuffle(rowsList);
  const top0 = boxY + boxH + 30;
  const rh = T + 14;
  const rowStep = Math.min(rh + 10, (H - top0 - 20) / rowOrder.length);
  let left = n;
  const placed = [];
  rowOrder.forEach((row, ri) => {
    const items = shuffle(row.items);
    const slack = availW - row.w;
    let x = 12 + slack / 2 + (Math.random() - 0.5) * Math.min(slack, 20);
    const y = top0 + ri * rowStep;
    items.forEach((k) => {
      const L = lens[k];
      const art = crayonArt(L, T);
      art.style.width = '100%'; art.style.height = '100%';
      const el = h('div', { 'data-crayon': k, style: { position: 'absolute', left: x + 'px', top: y + 'px', width: L + 'px', height: T + 'px' } }, [art]);
      scene.appendChild(el);
      x += L + gap;
      ctx.draggable(el, {
        targets: () => slots,
        accepts: (t) => Number(t.dataset.slot) === k,
        magnet: 50,
        onPick: () => ctx.sfx('pick'),
        onDrop: () => {
          el.dataset.placed = '1';
          ctx.sfx('fit');
          ctx.bounce(el);
          if (k === n - 1) ctx.say('long', el);
          else if (k === 0) ctx.say('short', el);
          left -= 1;
          if (left === 0) ctx.later(() => tidyUp(root, ctx, scene, { n, lens, T, x0, rowY, box: { x: boxX, y: boxY, w: boxW, h: boxH } }), 1300);
        },
        onMiss: () => { ctx.wobble(el); ctx.sfx('back'); },
      });
    });
  });
}

// おかたづけ：てんとう虫が階段をのぼり、箱のふたが閉まる
function tidyUp(root, ctx, scene, o) {
  const { n, lens, T, x0, rowY, box } = o;
  const pts = lens.map((L, k) => ({ x: x0 + L - 26, y: rowY(k) }));
  const bug = ladybugArt();
  const bs = 44;
  bug.dataset.ladybug = '1';
  bug.style.cssText = `position:absolute;left:${-bs / 2}px;top:${-bs / 2}px;width:${bs}px;height:${bs * 1.2}px;pointer-events:none;z-index:8;opacity:0;transition:opacity .6s`;
  scene.appendChild(bug);
  const start = { x: pts[0].x - 40, y: pts[0].y + T * 0.9 };
  const route = [start, ...pts];
  const ang = (a, b) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90;
  const dur = 1300;
  bug.style.translate = `${start.x}px ${start.y}px`;
  bug.style.rotate = ang(route[0], route[1]) + 'deg';
  ctx.later(() => { bug.style.opacity = '1'; }, 300);
  route.slice(1).forEach((p, i) => {
    ctx.later(() => {
      const a = route[i];
      bug.style.rotate = ang(a, p) + 'deg';
      if (bug.animate) {
        bug.animate([{ translate: `${a.x}px ${a.y}px` }, { translate: `${p.x}px ${p.y}px` }], { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
      } else bug.style.translate = `${p.x}px ${p.y}px`;
    }, 900 + i * (dur + 150));
  });
  const climbEnd = 900 + route.length * (dur + 150);
  ctx.later(() => { bug.style.opacity = '0'; }, climbEnd);
  // ふたが閉まる
  ctx.later(() => {
    const lid = lidArt(box.w, box.h);
    lid.dataset.lid = '1';
    lid.style.cssText = `position:absolute;left:${box.x}px;top:${box.y - box.h - 30}px;width:${box.w}px;height:${box.h}px;opacity:0;transition:top 1.1s ease, opacity .5s;z-index:9`;
    scene.appendChild(lid);
    requestAnimationFrame(() => requestAnimationFrame(() => { lid.style.top = box.y + 'px'; lid.style.opacity = '1'; }));
    ctx.later(() => ctx.sfx('open'), 900);
  }, climbEnd + 600);
  ctx.later(() => {
    ctx.sfx('tada');
    const r = root.getBoundingClientRect();
    ctx.cheer({ x: r.left + box.x + box.w / 2, y: r.top + box.y + box.h / 2 }, { count: 5, spread: 100 });
    ctx.done();
    ctx.again(() => round(root, ctx));
  }, climbEnd + 2000);
}
