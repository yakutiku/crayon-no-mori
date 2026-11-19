// くだもの・乗り物など（いろあわせ用）。どれも 100×100 の座標で描く
// 本体はその「いろ」1色で塗り、ほかの学習色を混ぜない（色だけに集中できるように）
import { P } from '../core/palette.js';
import { s, svg, line, CRAYON_LITE } from '../core/crayon.js';

// いろ → もの
export const THINGS_BY_COLOR = {
  red: ['apple', 'strawberry', 'tomato'],
  blue: ['balloon', 'car', 'cup'],
  yellow: ['banana', 'chick', 'lemon'],
  green: ['leaf', 'pepper', 'frog'],
};

const L = (w = 3.5) => line(w);

const DRAW = {
  apple: (c) => [
    s('path', { d: 'M50 30 C30 18 12 30 14 54 C16 78 34 92 50 86 C66 92 84 78 86 54 C88 30 70 18 50 30 Z', fill: c, ...L() }),
    s('path', { d: 'M50 30 C50 22 52 14 56 9', fill: 'none', ...L(4) }),
    s('path', { d: 'M28 44 C30 38 34 35 38 34', fill: 'none', ...line(3, P.white), opacity: 0.7 }),
  ],
  strawberry: (c) => [
    s('path', { d: 'M50 92 C30 80 14 60 16 42 C18 28 34 24 50 28 C66 24 82 28 84 42 C86 60 70 80 50 92 Z', fill: c, ...L() }),
    s('path', { d: 'M34 28 L42 20 L50 28 L58 20 L66 28 C60 34 40 34 34 28 Z', fill: P.woodDeep, ...L(2.5) }),
    ...[[36, 46], [50, 44], [64, 46], [42, 60], [58, 60], [50, 74]].map(([x, y]) => s('ellipse', { cx: x, cy: y, rx: 2.2, ry: 3, fill: P.white })),
  ],
  tomato: (c) => [
    s('path', { d: 'M50 26 C24 24 10 40 12 58 C14 78 32 88 50 88 C68 88 86 78 88 58 C90 40 76 24 50 26 Z', fill: c, ...L() }),
    s('path', { d: 'M50 20 L54 30 L66 28 L57 35 L62 44 L50 38 L38 44 L43 35 L34 28 L46 30 Z', fill: P.woodDeep, ...L(2.5) }),
    s('path', { d: 'M24 50 C26 44 30 40 35 38', fill: 'none', ...line(3, P.white), opacity: 0.7 }),
  ],
  balloon: (c) => [
    s('path', { d: 'M50 76 C52 84 46 88 50 98', fill: 'none', ...line(2.5, P.brownSoft) }),
    s('ellipse', { cx: 50, cy: 42, rx: 28, ry: 34, fill: c, ...L() }),
    s('path', { d: 'M45 76 L55 76 L50 70 Z', fill: c, ...L(2.5) }),
    s('path', { d: 'M34 30 C36 22 42 17 48 16', fill: 'none', ...line(3, P.white), opacity: 0.7 }),
  ],
  car: (c) => [
    s('path', { d: 'M10 70 V56 C10 50 14 48 20 47 L30 32 C32 29 35 28 38 28 H62 C66 28 68 30 70 33 L80 47 C86 48 90 50 90 56 V70 Z', fill: c, ...L() }),
    s('path', { d: 'M34 46 L40 35 H48 V46 Z M54 46 V35 H62 L68 46 Z', fill: P.skyPale, ...L(2.5) }),
    s('circle', { cx: 30, cy: 72, r: 10, fill: P.brownSoft, ...L(3) }),
    s('circle', { cx: 70, cy: 72, r: 10, fill: P.brownSoft, ...L(3) }),
    s('circle', { cx: 30, cy: 72, r: 3.5, fill: P.cream }),
    s('circle', { cx: 70, cy: 72, r: 3.5, fill: P.cream }),
  ],
  cup: (c) => [
    s('path', { d: 'M70 40 C86 38 88 64 68 64', fill: 'none', ...line(7, P.brown) }),
    s('path', { d: 'M70 40 C86 38 88 64 68 64', fill: 'none', ...line(3.5, c) }),
    s('path', { d: 'M20 24 H76 L70 84 C70 88 66 90 62 90 H34 C30 90 26 88 26 84 Z', fill: c, ...L() }),
    s('path', { d: 'M20 24 H76', fill: 'none', ...L(4) }),
    s('path', { d: 'M32 34 L35 76', fill: 'none', ...line(3, P.white), opacity: 0.6 }),
  ],
  banana: (c) => [
    s('path', { d: 'M18 30 C16 62 40 86 78 78 C86 76 88 70 82 68 C52 70 34 54 30 28 C30 22 20 22 18 30 Z', fill: c, ...L() }),
    s('path', { d: 'M24 34 C26 56 44 72 70 72', fill: 'none', ...line(2.5, P.woodDark), opacity: 0.8 }),
    s('path', { d: 'M18 30 L20 20 L28 22 L28 28', fill: P.woodDeep, ...L(2.5) }),
  ],
  chick: (c) => [
    s('ellipse', { cx: 52, cy: 62, rx: 32, ry: 26, fill: c, ...L() }),
    s('circle', { cx: 42, cy: 38, r: 20, fill: c, ...L() }),
    s('path', { d: 'M20 36 L30 33 L30 41 Z', fill: P.orange, ...L(2.5) }),
    s('circle', { cx: 38, cy: 34, r: 3.4, fill: P.brown }),
    s('path', { d: 'M54 58 C62 52 72 54 74 62', fill: 'none', ...L(3) }),
    s('path', { d: 'M44 88 V94 M58 88 V94', fill: 'none', ...line(3.5, P.orange) }),
  ],
  lemon: (c) => [
    s('path', { d: 'M10 52 C14 50 16 46 20 42 C30 28 70 28 80 42 C84 46 86 50 90 52 C86 54 84 58 80 62 C70 76 30 76 20 62 C16 58 14 54 10 52 Z', fill: c, ...L() }),
    s('path', { d: 'M30 44 C34 40 40 38 46 38', fill: 'none', ...line(3, P.white), opacity: 0.7 }),
  ],
  leaf: (c) => [
    s('path', { d: 'M14 86 C12 46 40 16 88 12 C88 60 60 88 14 86 Z', fill: c, ...L() }),
    s('path', { d: 'M14 86 C34 64 56 42 78 22', fill: 'none', ...line(3, P.brownSoft) }),
    s('path', { d: 'M36 64 L34 48 M50 50 L50 34 M44 58 L60 58 M58 42 L72 44', fill: 'none', ...line(2.5, P.brownSoft) }),
  ],
  pepper: (c) => [
    s('path', { d: 'M50 26 C30 18 14 30 16 50 C18 72 30 90 42 88 C46 87 48 84 50 84 C52 84 54 87 58 88 C70 90 82 72 84 50 C86 30 70 18 50 26 Z', fill: c, ...L() }),
    s('path', { d: 'M50 26 C50 34 48 60 46 82', fill: 'none', ...line(2.5, P.brownSoft), opacity: 0.7 }),
    s('path', { d: 'M44 26 C44 18 48 12 56 10', fill: 'none', ...line(6, P.brown) }),
    s('path', { d: 'M44 26 C44 18 48 12 56 10', fill: 'none', ...line(2.5, P.woodDeep) }),
  ],
  frog: (c) => [
    s('ellipse', { cx: 50, cy: 62, rx: 38, ry: 28, fill: c, ...L() }),
    s('circle', { cx: 30, cy: 36, r: 14, fill: c, ...L() }),
    s('circle', { cx: 70, cy: 36, r: 14, fill: c, ...L() }),
    s('circle', { cx: 30, cy: 36, r: 8, fill: P.white }),
    s('circle', { cx: 70, cy: 36, r: 8, fill: P.white }),
    s('circle', { cx: 31, cy: 37, r: 4, fill: P.brown }),
    s('circle', { cx: 71, cy: 37, r: 4, fill: P.brown }),
    s('path', { d: 'M34 66 C42 74 58 74 66 66', fill: 'none', ...L(3) }),
    s('circle', { cx: 24, cy: 60, r: 4, fill: P.pink, opacity: 0.8 }),
    s('circle', { cx: 76, cy: 60, r: 4, fill: P.pink, opacity: 0.8 }),
  ],
};

// もの1つの絵を返す。color は P のいずれか
export function thing(key, color, lite = true) {
  const g = svg(100, 100, { 'data-thing': key });
  (DRAW[key] || DRAW.apple)(color).forEach((n) => g.appendChild(n));
  if (lite) g.setAttribute('filter', CRAYON_LITE);
  return g;
}
