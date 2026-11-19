// 絵本のような景色3つ（もり・はらっぱ・うみ）と、動物がかげにかくれる「前景パーツ」
// 使い方: const { back, spots, portrait } = scene('mori', W, H)   （W,H は舞台の px）
//  back  : 画面いっぱいの背景 <svg>（preserveAspectRatio='xMidYMid slice'）
//  spots : 4つ。spots[i] が ANIMALS_BY_SCENE[name][i] のかくれ場所。
//          { x, y, w, h,   舞台での位置と大きさ(px)。front はこの箱いっぱいに置く
//            front,        前景の <svg>（動物より手前）
//            size,         動物の絵の大きさ(px)
//            ci,           かくれ場所の上の縁（箱の上から ci px 下）
//            z, kind, cx }
import { P } from '../core/palette.js';
import { s, svg, line, CRAYON } from '../core/crayon.js';

export const SCENES = ['mori', 'harappa', 'umi'];
export const SCENE_LABEL = { mori: 'もり', harappa: 'はらっぱ', umi: 'うみ' };
export const SCENE_KINDS = {
  mori: ['rock', 'bush', 'stump', 'bush'],
  harappa: ['grass', 'flowers', 'grass', 'rock'],
  umi: ['wave', 'wave', 'wave', 'seaRock'],
};

const L = (w = 4) => line(w);

// まるを重ねたかたまり（内側の線を消して、外側だけ線を残す）
function blob(circles, fill, sw = 4) {
  return [
    ...circles.map(([x, y, r]) => s('circle', { cx: x, cy: y, r, fill, ...L(sw * 2) })),
    ...circles.map(([x, y, r]) => s('circle', { cx: x, cy: y, r: r - 0.5, fill })),
  ];
}

// ── 前景（かくれ場所）。どれも箱 w×h いっぱい。上の縁は h*0.2 あたり ──
const FRONT = {
  bush(w, h) {
    const t = h * 0.2;
    const r = h * 0.36;
    const cs = [[w * 0.2, t + r * 1.25, r * 0.95], [w * 0.5, t + r, r * 1.15], [w * 0.8, t + r * 1.25, r * 0.95], [w * 0.35, h - r * 0.4, r], [w * 0.65, h - r * 0.4, r]];
    const out = blob(cs, P.grassDeep);
    out.push(s('rect', { x: w * 0.12, y: h * 0.6, width: w * 0.76, height: h * 0.4, fill: P.grassDeep }));
    [[0.3, 0.45], [0.55, 0.36], [0.72, 0.55], [0.42, 0.68]].forEach(([fx, fy]) => out.push(s('path', { d: `M${w * fx} ${h * fy} q8 -10 16 0`, fill: 'none', ...line(3.5, P.grass) })));
    [[0.24, 0.62], [0.78, 0.7]].forEach(([fx, fy]) => out.push(s('circle', { cx: w * fx, cy: h * fy, r: 6, fill: P.pink, ...line(2, P.brownSoft) })));
    return out;
  },
  rock(w, h) {
    const t = h * 0.2;
    return [
      s('path', { d: `M${w * 0.04} ${h} C${w * 0.0} ${h * 0.5} ${w * 0.2} ${t} ${w * 0.5} ${t} C${w * 0.8} ${t} ${w} ${h * 0.5} ${w * 0.96} ${h} Z`, fill: P.gray, ...L(4.5) }),
      s('path', { d: `M${w * 0.2} ${h * 0.45} C${w * 0.24} ${h * 0.34} ${w * 0.32} ${h * 0.3} ${w * 0.4} ${h * 0.29}`, fill: 'none', ...line(5, P.white), opacity: 0.7 }),
      s('path', { d: `M${w * 0.62} ${h * 0.5} l${w * 0.07} ${h * 0.12} l-${w * 0.05} ${h * 0.12} M${w * 0.3} ${h * 0.72} l${w * 0.08} ${h * 0.08}`, fill: 'none', ...line(3, P.brownSoft) }),
      s('path', { d: `M${w * 0.16} ${h * 0.58} q${w * 0.1} -${h * 0.1} ${w * 0.2} ${h * 0.02} q-${w * 0.1} ${h * 0.12} -${w * 0.2} -${h * 0.02} Z`, fill: P.grassDeep, ...line(2.5, P.brownSoft) }),
    ];
  },
  stump(w, h) {
    const t = h * 0.2;
    const x0 = w * 0.1; const x1 = w * 0.9;
    return [
      s('path', { d: `M${x0} ${t + 12} V${h} H${x1} V${t + 12}`, fill: P.woodDark, ...L(4.5) }),
      s('path', { d: `M${w * 0.28} ${h * 0.5} V${h * 0.92} M${w * 0.5} ${h * 0.46} V${h * 0.96} M${w * 0.72} ${h * 0.5} V${h * 0.9}`, fill: 'none', ...line(3, P.woodDeep), opacity: 0.8 }),
      s('ellipse', { cx: w * 0.5, cy: t + 12, rx: (x1 - x0) / 2, ry: 16, fill: P.wood, ...L(4.5) }),
      s('ellipse', { cx: w * 0.5, cy: t + 12, rx: (x1 - x0) * 0.3, ry: 9, fill: 'none', ...line(2.5, P.woodDeep) }),
      s('ellipse', { cx: w * 0.5, cy: t + 12, rx: (x1 - x0) * 0.12, ry: 4, fill: 'none', ...line(2.5, P.woodDeep) }),
      s('path', { d: `M${w * 0.1} ${h} q-${w * 0.08} 0 -${w * 0.1} -6 M${w * 0.9} ${h} q${w * 0.08} 0 ${w * 0.1} -6`, fill: 'none', ...L(4) }),
    ];
  },
  grass(w, h) {
    const t = h * 0.2;
    const n = 9;
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = w * (0.08 + (i / (n - 1)) * 0.84);
      const mid = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
      const top = t + (1 - mid) * h * 0.2 + (i % 2) * h * 0.06;
      const lean = (i - (n - 1) / 2) * 3;
      out.push(s('path', { d: `M${x - w * 0.07} ${h} Q${x - 4} ${top + (h - top) * 0.4} ${x + lean} ${top} Q${x + w * 0.02} ${top + (h - top) * 0.4} ${x + w * 0.07} ${h} Z`, fill: i % 2 ? P.grassDeep : P.grass, ...L(3.5) }));
    }
    out.push(s('rect', { x: w * 0.04, y: h * 0.78, width: w * 0.92, height: h * 0.22, fill: P.grassDeep }));
    return out;
  },
  flowers(w, h) {
    const out = FRONT.grass(w, h);
    const cols = [P.pink, P.orange, P.white, P.pinkDeep];
    [[0.2, 0.34], [0.42, 0.24], [0.62, 0.3], [0.8, 0.4], [0.5, 0.5]].forEach(([fx, fy], i) => {
      const cx = w * fx; const cy = h * fy;
      out.push(s('path', { d: `M${cx} ${cy} V${cy + h * 0.2}`, fill: 'none', ...line(3, P.grassDeep) }));
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        out.push(s('circle', { cx: cx + Math.cos(a) * 9, cy: cy + Math.sin(a) * 9, r: 7.5, fill: cols[i % 4], ...line(2, P.brownSoft) }));
      }
      out.push(s('circle', { cx, cy, r: 5, fill: P.yellowPale, ...line(2, P.brownSoft) }));
    });
    return out;
  },
  wave(w, h) {
    const t = h * 0.2;
    const n = 4;
    const sw = w / n;
    let d = `M0 ${h} V${t + 14}`;
    for (let i = 0; i < n; i++) d += ` q${sw * 0.25} -${14 + (i % 2) * 6} ${sw * 0.5} 0 t${sw * 0.5} 0`;
    d += ` V${h} Z`;
    return [
      s('path', { d, fill: P.sky, ...L(4.5) }),
      s('path', { d: `M${w * 0.12} ${h * 0.5} q${w * 0.1} -10 ${w * 0.2} 0 M${w * 0.5} ${h * 0.62} q${w * 0.1} -10 ${w * 0.2} 0 M${w * 0.25} ${h * 0.8} q${w * 0.1} -10 ${w * 0.2} 0`, fill: 'none', ...line(4, P.white), opacity: 0.85 }),
      s('path', { d: `M${w * 0.1} ${t + 12} q${w * 0.08} -10 ${w * 0.16} 0 M${w * 0.6} ${t + 10} q${w * 0.08} -10 ${w * 0.16} 0`, fill: 'none', ...line(4, P.white) }),
    ];
  },
  seaRock(w, h) {
    const out = FRONT.rock(w, h);
    out.push(s('path', { d: `M${w * 0.1} ${h} q${w * 0.15} -${h * 0.12} ${w * 0.3} 0 M${w * 0.55} ${h} q${w * 0.15} -${h * 0.12} ${w * 0.3} 0`, fill: 'none', ...line(5, P.skyPale) }));
    return out;
  },
};

function front(kind, w, h) {
  const g = svg(w, h, { width: '100%', height: '100%', preserveAspectRatio: 'none' });
  g.style.position = 'absolute';
  g.style.inset = '0';
  g.style.overflow = 'visible';
  // フィルターのざらざらで後ろの動物が透けないよう、ふちなしの下敷きを重ねる
  const base = s('g', {}, FRONT[kind](w, h));
  const crayon = s('g', { filter: CRAYON }, FRONT[kind](w, h));
  g.append(base, crayon);
  return g;
}

// ── 背景 ──
function cloud(x, y, u) {
  return s('g', {}, [
    s('ellipse', { cx: x, cy: y, rx: u * 1.1, ry: u * 0.5, fill: P.white }),
    s('ellipse', { cx: x - u * 0.6, cy: y + u * 0.15, rx: u * 0.7, ry: u * 0.4, fill: P.white }),
    s('ellipse', { cx: x + u * 0.7, cy: y + u * 0.15, rx: u * 0.8, ry: u * 0.4, fill: P.white }),
  ]);
}
function tree(x, yBase, sz) {
  return s('g', {}, [
    s('rect', { x: x - sz * 0.11, y: yBase - sz * 0.95, width: sz * 0.22, height: sz * 0.95, rx: 4, fill: P.woodDark, ...L(3.5) }),
    ...blob([[x, yBase - sz * 1.25, sz * 0.6], [x - sz * 0.45, yBase - sz * 0.95, sz * 0.42], [x + sz * 0.45, yBase - sz * 0.95, sz * 0.42]], P.grass, 3.5),
    s('path', { d: `M${x - sz * 0.2} ${yBase - sz * 1.3} q${sz * 0.1} -${sz * 0.12} ${sz * 0.22} -${sz * 0.1}`, fill: 'none', ...line(3.5, P.greenPale) }),
  ]);
}
function dots(W, H, y0, list, cols) {
  return list.map(([fx, fy], i) => {
    const cx = W * fx; const cy = y0 + (H - y0) * fy;
    return s('g', {}, [
      ...[0, 1, 2, 3, 4].map((k) => s('circle', { cx: cx + Math.cos(k * 1.256) * 6, cy: cy + Math.sin(k * 1.256) * 6, r: 5, fill: cols[i % cols.length] })),
      s('circle', { cx, cy, r: 3.5, fill: P.yellowPale }),
    ]);
  });
}

const BACK = {
  mori(W, H) {
    const u = Math.min(W * 0.5, H * 0.55);
    const hz = H * 0.3;
    return [
      s('rect', { width: W, height: H, fill: P.skyPale }),
      cloud(W * 0.2, H * 0.1, u * 0.12), cloud(W * 0.72, H * 0.06, u * 0.1),
      s('ellipse', { cx: W * 0.25, cy: hz + 10, rx: W * 0.5, ry: H * 0.1, fill: P.greenPale }),
      s('ellipse', { cx: W * 0.85, cy: hz + 20, rx: W * 0.45, ry: H * 0.09, fill: P.greenPale }),
      s('rect', { x: 0, y: hz + 20, width: W, height: H - hz, fill: P.grass }),
      s('path', { d: `M${W * 0.4} ${H} C${W * 0.45} ${H * 0.7} ${W * 0.55} ${H * 0.55} ${W * 0.52} ${hz + 30}`, fill: 'none', ...line(Math.max(40, W * 0.08), P.wood), opacity: 0.55 }),
      ...[[0.06, 0.4, 0.3], [0.33, 0.34, 0.2], [0.62, 0.37, 0.26], [0.93, 0.4, 0.3], [0.5, 0.33, 0.14], [0.2, 0.33, 0.14]].map(([fx, fy, f]) => tree(W * fx, H * fy, f * u)),
      ...dots(W, H, H * 0.45, [[0.05, 0.1], [0.3, 0.55], [0.55, 0.2], [0.8, 0.7], [0.95, 0.3], [0.18, 0.85], [0.65, 0.9]], [P.pink, P.white, P.orange]),
    ];
  },
  harappa(W, H) {
    const u = Math.min(W * 0.5, H * 0.55);
    const hz = H * 0.32;
    const sun = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      sun.push(s('path', { d: `M${W * 0.86 + Math.cos(a) * u * 0.2} ${H * 0.1 + Math.sin(a) * u * 0.2} L${W * 0.86 + Math.cos(a) * u * 0.28} ${H * 0.1 + Math.sin(a) * u * 0.28}`, fill: 'none', ...line(4, P.yellow) }));
    }
    return [
      s('rect', { width: W, height: H, fill: P.skyPale }),
      ...sun,
      s('circle', { cx: W * 0.86, cy: H * 0.1, r: u * 0.14, fill: P.yellowPale, ...L(3.5) }),
      cloud(W * 0.18, H * 0.11, u * 0.13), cloud(W * 0.5, H * 0.07, u * 0.09),
      s('ellipse', { cx: W * 0.2, cy: hz + 30, rx: W * 0.5, ry: H * 0.12, fill: P.greenPale }),
      s('ellipse', { cx: W * 0.8, cy: hz + 40, rx: W * 0.55, ry: H * 0.13, fill: P.grassDeep }),
      s('rect', { x: 0, y: hz + 50, width: W, height: H, fill: P.grass }),
      s('path', { d: `M0 ${H * 0.52} Q${W * 0.3} ${H * 0.46} ${W * 0.6} ${H * 0.52} T${W} ${H * 0.5}`, fill: 'none', ...line(4, P.grassDeep), opacity: 0.6 }),
      tree(W * 0.08, H * 0.4, u * 0.2),
      ...dots(W, H, H * 0.42, [[0.1, 0.2], [0.28, 0.6], [0.45, 0.1], [0.6, 0.5], [0.78, 0.2], [0.92, 0.65], [0.2, 0.9], [0.7, 0.88], [0.5, 0.75]], [P.pink, P.orange, P.white, P.pinkDeep]),
    ];
  },
  umi(W, H) {
    const u = Math.min(W * 0.5, H * 0.55);
    const hz = H * 0.28;
    const waves = [];
    for (let r = 0; r < 7; r++) {
      const y = hz + (H - hz) * (0.08 + r * 0.14);
      let d = `M${(r % 2) * -30} ${y}`;
      for (let x = 0; x < W + 60; x += 60) d += ` q15 -9 30 0 t30 0`;
      waves.push(s('path', { d, fill: 'none', ...line(3.5, P.white), opacity: 0.6 }));
    }
    return [
      s('rect', { width: W, height: H, fill: P.skyPale }),
      s('circle', { cx: W * 0.82, cy: H * 0.1, r: u * 0.13, fill: P.yellowPale, ...L(3.5) }),
      cloud(W * 0.2, H * 0.1, u * 0.12), cloud(W * 0.55, H * 0.15, u * 0.09),
      s('rect', { x: 0, y: hz, width: W, height: H - hz, fill: P.sky }),
      s('rect', { x: 0, y: hz + (H - hz) * 0.45, width: W, height: H, fill: P.bluePale, opacity: 0.45 }),
      s('path', { d: `M${W * 0.52} ${hz + 6} q${u * 0.1} 14 ${u * 0.25} 0 Z`, fill: P.woodDark, ...L(3.5) }),
      s('path', { d: `M${W * 0.52 + u * 0.12} ${hz} V${hz - u * 0.22} L${W * 0.52 + u * 0.26} ${hz - 4} Z`, fill: P.cream, ...L(3) }),
      ...waves,
    ];
  },
};

function backSvg(name, W, H) {
  const g = svg(W, H, { preserveAspectRatio: 'xMidYMid slice', width: '100%', height: '100%' });
  g.style.position = 'absolute';
  g.style.inset = '0';
  g.append(...BACK[name](W, H));
  g.setAttribute('filter', CRAYON);
  return g;
}

export function scene(name, W, H) {
  const portrait = H > W;
  let A; let sw; let sh; let cxs; let bases;
  if (portrait) {
    A = Math.min(W * 0.34, H * 0.2);
    sw = A * 1.4; sh = A * 1.1;
    cxs = [0.3, 0.74, 0.27, 0.71].map((f) => f * W);
    bases = [0.56, 0.56, 0.9, 0.9].map((f) => f * H);
  } else {
    A = Math.min(H * 0.34, W * 0.17);
    sw = A * 1.3; sh = A * 1.1;
    cxs = [0.19, 0.4, 0.61, 0.82].map((f) => f * W);
    bases = [0.64, 0.94, 0.64, 0.94].map((f) => f * H);
  }
  const spots = SCENE_KINDS[name].map((kind, i) => ({
    kind, cx: cxs[i], x: cxs[i] - sw / 2, y: bases[i] - sh, w: sw, h: sh, size: A, ci: sh * 0.2,
    z: Math.round(bases[i]), front: front(kind, sw, sh),
  }));
  return { name, back: backSvg(name, W, H), spots, portrait };
}
