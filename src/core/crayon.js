// クレヨン質感のSVGフィルターと、絵を描くための共通部品
import { P } from './palette.js';

export const SVGNS = 'http://www.w3.org/2000/svg';

// SVG要素を作る。s('circle', {cx:10, cy:10, r:5, fill:P.red})
export function s(tag, attrs = {}, children = []) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    el.setAttribute(k, String(v));
  }
  for (const c of [].concat(children)) if (c) el.appendChild(c);
  return el;
}

// 新しい <svg> を作る。viewBox の座標で絵を描く
export function svg(w, h, attrs = {}) {
  return s('svg', { viewBox: `0 0 ${w} ${h}`, xmlns: SVGNS, ...attrs });
}

// HTML要素を作る
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, String(v));
  }
  for (const c of [].concat(children)) if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return el;
}

// クレヨンの線の共通設定（ちゃいろ・まるい端）
export function line(width = 4, color = P.brown) {
  return { stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
}

// 質感フィルター。動かない絵には filter: 'url(#crayon)'（ふちのゆらぎ＋紙のざらざら）、
// 動く絵や小さな絵には 'url(#crayon-lite)'（ざらざらのみ・軽い）を使う
export const CRAYON = 'url(#crayon)';
export const CRAYON_LITE = 'url(#crayon-lite)';

export function installCrayonDefs() {
  if (document.getElementById('crayon-defs')) return;
  const defs = svg(0, 0, { id: 'crayon-defs', width: 0, height: 0, 'aria-hidden': 'true' });
  defs.style.position = 'absolute';
  defs.innerHTML = `
  <defs>
    <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="wob"/>
      <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="rough"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.3 1.55" result="holes"/>
      <feComposite in="rough" in2="holes" operator="in"/>
    </filter>
    <filter id="crayon-lite" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.2 1.5" result="holes"/>
      <feComposite in="SourceGraphic" in2="holes" operator="in"/>
    </filter>
  </defs>`;
  document.body.prepend(defs);
}

// 「おうち」の絵（ホームに戻るボタン）
export function houseIcon() {
  const g = svg(64, 64);
  g.append(
    s('path', { d: 'M10 31 L32 11 L54 31', fill: 'none', ...line(5) }),
    s('path', { d: 'M16 29 V53 H48 V29', fill: P.cream, ...line(4) }),
    s('path', { d: 'M27 53 V40 a5 5 0 0 1 10 0 V53', fill: P.woodDark, ...line(3.5) }),
    s('path', { d: 'M10 31 L32 11 L54 31 Z', fill: P.orange, ...line(4) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

// 「もういっかい」の絵（くるっと回る矢印）
export function againIcon() {
  const g = svg(64, 64);
  g.append(
    s('circle', { cx: 32, cy: 32, r: 28, fill: P.grass, ...line(3.5) }),
    s('path', { d: 'M44 24 A14 14 0 1 0 46 36', fill: 'none', ...line(5, P.white) }),
    s('path', { d: 'M38 18 L46 24 L38 30', fill: 'none', ...line(5, P.white) }),
  );
  return g;
}

// 小さなお花（できたときの反応や、はまったときに使う）
export function flower(color = P.pink, size = 40) {
  const g = svg(40, 40, { width: size, height: size });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.append(s('circle', { cx: 20 + Math.cos(a) * 9, cy: 20 + Math.sin(a) * 9, r: 7.5, fill: color, stroke: P.brownSoft, 'stroke-width': 1.5 }));
  }
  g.append(s('circle', { cx: 20, cy: 20, r: 6, fill: P.yellow, stroke: P.brownSoft, 'stroke-width': 1.5 }));
  return g;
}

export function sparkle(color = P.yellow, size = 34) {
  const g = svg(40, 40, { width: size, height: size });
  g.append(s('path', { d: 'M20 3 L24.5 15.5 L37 20 L24.5 24.5 L20 37 L15.5 24.5 L3 20 L15.5 15.5 Z', fill: color, stroke: P.brownSoft, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  return g;
}

// 配列をまぜる
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
