// ① いろあわせ：散らばったものを、同じ色のかごへ指で運ぶ（モンテッソーリの「色板」）
import { P, LEARN_COLORS } from '../core/palette.js';
import { s, svg, h, line, shuffle, CRAYON, CRAYON_LITE } from '../core/crayon.js';
import { thing, THINGS_BY_COLOR } from '../art/things.js';

const LEVELS = { 1: { colors: 2, items: 4 }, 2: { colors: 3, items: 6 }, 3: { colors: 4, items: 8 } };

// かごの絵。color の帯が入った木のかご。lid=true でふた付き
function basketArt(color) {
  const g = svg(160, 120);
  g.append(
    s('path', { d: 'M12 42 H148 L136 112 C135 116 132 118 128 118 H32 C28 118 25 116 24 112 Z', fill: P.wood, ...line(4) }),
    s('path', { d: 'M20 62 H140 M24 84 H136', fill: 'none', ...line(2.5, P.woodDark) }),
    s('path', { d: 'M44 46 L50 114 M80 46 V114 M116 46 L110 114', fill: 'none', ...line(2.5, P.woodDark) }),
    s('path', { d: 'M18 62 H142 L139 82 H21 Z', fill: color, ...line(3) }),
    s('rect', { x: 8, y: 34, width: 144, height: 14, rx: 7, fill: P.woodDark, ...line(3.5) }),
  );
  g.setAttribute('filter', CRAYON);
  return g;
}

function lidArt(color) {
  const g = svg(160, 40);
  g.append(
    s('path', { d: 'M6 34 C10 10 150 10 154 34 Z', fill: P.woodDark, ...line(3.5) }),
    s('rect', { x: 66, y: 4, width: 28, height: 12, rx: 6, fill: color, ...line(3) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

function shelfArt(w) {
  const g = svg(w, 24, { preserveAspectRatio: 'none' });
  g.append(s('rect', { x: 2, y: 4, width: w - 4, height: 14, rx: 6, fill: P.woodDark, ...line(3) }));
  return g;
}

let st = null;

export default {
  id: 'colors',
  title: 'いろあわせ',
  icon() {
    const g = svg(120, 120);
    g.append(
      s('rect', { x: 10, y: 66, width: 46, height: 40, rx: 8, fill: P.red, ...line(3.5) }),
      s('rect', { x: 64, y: 66, width: 46, height: 40, rx: 8, fill: P.blue, ...line(3.5) }),
      s('circle', { cx: 33, cy: 34, r: 18, fill: P.red, ...line(3.5) }),
      s('path', { d: 'M33 16 C33 10 36 6 40 4', fill: 'none', ...line(3.5) }),
      s('ellipse', { cx: 87, cy: 32, rx: 16, ry: 20, fill: P.blue, ...line(3.5) }),
      s('path', { d: 'M87 52 C89 58 85 60 87 64', fill: 'none', ...line(2.5, P.brownSoft) }),
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
  const cfg = LEVELS[ctx.level] || LEVELS[1];
  const W = root.clientWidth; const H = root.clientHeight;
  const cols = shuffle(LEARN_COLORS).slice(0, cfg.colors);

  // もの：色ごとに同じ数ずつ
  const per = cfg.items / cfg.colors;
  const items = [];
  cols.forEach((c) => {
    const pool = shuffle(THINGS_BY_COLOR[c.key]);
    for (let i = 0; i < per; i++) items.push({ key: pool[i % pool.length], color: c });
  });
  const list = shuffle(items);

  // ── かご（画面下）。たて長の画面で3つ以上なら2段にする ──
  const n = cols.length;
  const perRow = W < 600 && n > 2 ? 2 : n;
  const rows = Math.ceil(n / perRow);
  const bw = Math.min(170, (W - 24) / perRow - 18);
  const bh = bw * 0.75;
  const baseY = H - Math.max(16, H * 0.03) - rows * bh - (rows - 1) * 14;
  const by = baseY;
  const baskets = cols.map((c, i) => {
    const r = Math.floor(i / perRow); const k = i % perRow;
    const inRow = Math.min(perRow, n - r * perRow);
    const gap = (W - bw * inRow) / (inRow + 1);
    const art = basketArt(c.color);
    const inside = h('div', { class: 'basket-inside', style: { position: 'absolute', left: '12%', right: '12%', top: '-6%', height: '40%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' } });
    const el = h('div', { 'data-basket': c.key, style: { position: 'absolute', left: (gap + k * (bw + gap)) + 'px', top: (baseY + r * (bh + 14)) + 'px', width: bw + 'px', height: bh + 'px' } }, [inside, art]);
    art.style.width = '100%'; art.style.height = '100%'; art.style.position = 'relative';
    root.appendChild(el);
    return { el, inside, color: c, count: 0 };
  });

  // ── もの（画面上に散らばる） ──
  const top = 12; const areaH = by - top - 24; const areaW = W - 24;
  const nc = Math.max(2, Math.round(Math.sqrt(list.length * areaW / Math.max(1, areaH))));
  const nr = Math.ceil(list.length / nc);
  const cw = areaW / nc; const ch = areaH / nr;
  const size = Math.max(72, Math.min(120, cw * 0.72, ch * 0.78));
  let left = list.length;

  list.forEach((it, i) => {
    const r = Math.floor(i / nc); const c = i % nc;
    const rowCount = r === nr - 1 ? list.length - r * nc : nc;
    const offset = (nc - rowCount) * cw / 2;
    const x = 12 + offset + c * cw + (cw - size) / 2 + (Math.random() - 0.5) * Math.max(0, cw - size) * 0.6;
    const y = top + r * ch + (ch - size) / 2 + (Math.random() - 0.5) * Math.max(0, ch - size) * 0.6;
    const art = thing(it.key, it.color.color);
    art.style.width = '100%'; art.style.height = '100%';
    const inner = h('div', { style: { width: '100%', height: '100%' } }, [art]);
    const el = h('div', { 'data-item': it.key, 'data-color': it.color.key, style: { position: 'absolute', left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px', opacity: '0', transition: 'opacity .5s' } }, [inner]);
    root.appendChild(el);
    ctx.later(() => { el.style.opacity = '1'; }, 120 * i + 100);

    ctx.draggable(el, {
      targets: () => baskets.map((b) => b.el),
      accepts: (t) => t.dataset.basket === it.color.key,
      onPick: () => ctx.sfx('pick'),
      onDrop: (t) => {
        const b = baskets.find((x) => x.el === t);
        el.dataset.placed = '1';
        el.style.transition = 'opacity .3s, transform .3s';
        el.style.opacity = '0';
        ctx.later(() => el.remove(), 320);
        // かごの中に、ものが小さく顔を出す
        const mini = thing(it.key, it.color.color);
        mini.style.width = (bw * 0.3) + 'px'; mini.style.height = (bw * 0.3) + 'px';
        mini.style.margin = `0 ${-bw * 0.04}px`;
        b.inside.appendChild(mini);
        b.count += 1;
        ctx.sfx('fit');
        ctx.bounce(b.el);
        ctx.say(it.color.key, b.el);
        left -= 1;
        if (left === 0) ctx.later(() => tidyUp(root, ctx, baskets, bw, bh), 1200);
      },
      onMiss: () => ctx.sfx('back'),
    });
  });
}

// おかたづけ：かごにふたが閉まり、棚に並ぶ
function tidyUp(root, ctx, baskets, bw, bh) {
  baskets.forEach((b, i) => {
    const lid = lidArt(b.color.color);
    lid.style.cssText = `position:absolute;left:-2%;width:104%;height:${bw * 0.26}px;top:${-bh * 0.6}px;opacity:0;transition:top .7s ease ${i * 0.15}s, opacity .4s ease ${i * 0.15}s`;
    b.el.appendChild(lid);
    requestAnimationFrame(() => requestAnimationFrame(() => { lid.style.top = (bh * 0.3 - bw * 0.26 * 0.85) + 'px'; lid.style.opacity = '1'; }));
  });
  ctx.later(() => {
    // 棚
    const H = root.clientHeight; const W = root.clientWidth;
    const shelfY = H * 0.42;
    const shelf = shelfArt(W - 40);
    shelf.style.cssText = `position:absolute;left:20px;top:${shelfY}px;width:${W - 40}px;height:24px;opacity:0;transition:opacity .6s`;
    root.appendChild(shelf);
    requestAnimationFrame(() => { shelf.style.opacity = '1'; });
    // 棚の上に1列に並べる（入りきらなければ少し小さくする）
    const n = baskets.length;
    const k = Math.min(1, (W - 40) / n / (bw + 16));
    const gap = (W - bw * k * n) / (n + 1);
    baskets.forEach((b, i) => {
      const x0 = parseFloat(b.el.style.left); const y0 = parseFloat(b.el.style.top);
      const x1 = gap + i * (bw * k + gap); const y1 = shelfY - bh * k + 6;
      b.el.style.transformOrigin = '0 0';
      b.el.style.transition = `transform 1s cubic-bezier(.3,.7,.35,1) ${i * 0.12}s`;
      b.el.style.transform = `translate(${x1 - x0}px, ${y1 - y0}px) scale(${k})`;
    });
    ctx.later(() => {
      ctx.sfx('tada');
      ctx.cheer({ x: root.getBoundingClientRect().left + W / 2, y: root.getBoundingClientRect().top + shelfY - bh / 2 }, { count: 6, spread: 110 });
      ctx.done();
      ctx.again(() => round(root, ctx));
    }, 1300);
  }, 1100);
}
