// どうぶつ12種類（200×200 の viewBox。顔＋上半身の、まるい絵本調）
// 使い方: animal('dog', { filter: CRAYON_LITE | CRAYON | null, size: 160 }) → <svg>
//  動く部品は data-part 付きの <g>（transform-box: view-box と transform-origin 指定済み）:
//   dog/cat/squirrel/pig: tail   cat/dog/rabbit/pig/elephant/squirrel: ears   bear: arm   elephant: trunk
//   frog: throat   bird: wing（左右2つ。data-side="l"|"r"）   turtle: head   octopus: legs
import { P } from '../core/palette.js';
import { s, svg, line, CRAYON_LITE } from '../core/crayon.js';

export const ANIMALS = ['dog', 'cat', 'rabbit', 'bear', 'elephant', 'pig', 'frog', 'bird', 'squirrel', 'fish', 'turtle', 'octopus'];

// どの景色に出るか（景色ごとに4匹）
export const ANIMALS_BY_SCENE = {
  mori: ['bear', 'squirrel', 'cat', 'frog'],
  harappa: ['dog', 'rabbit', 'pig', 'elephant'],
  umi: ['fish', 'turtle', 'octopus', 'bird'],
};
export const SCENE_OF = Object.fromEntries(Object.entries(ANIMALS_BY_SCENE).flatMap(([sc, ks]) => ks.map((k) => [k, sc])));

// かげから顔を出すとき、絵のうち何割が見えるか（上から）
export const PEEK = { fish: 0.78, turtle: 0.72, octopus: 0.66, bird: 0.62 };
export const PEEK_DEFAULT = 0.58;

const L = (w = 4) => line(w);
const part = (name, ox, oy, kids, extra = {}) =>
  s('g', { 'data-part': name, style: `transform-box:view-box;transform-origin:${ox}px ${oy}px`, ...extra }, kids);
const E = (cx, cy, rx, ry, fill, w = 4, extra = {}) => s('ellipse', { cx, cy, rx, ry, fill, ...L(w), ...extra });
const C = (cx, cy, r, fill, w = 4, extra = {}) => s('circle', { cx, cy, r, fill, ...L(w), ...extra });
const eye = (x, y, r = 6.5) => s('g', {}, [
  s('circle', { cx: x, cy: y, r, fill: P.brown }),
  s('circle', { cx: x + r * 0.3, cy: y - r * 0.35, r: r * 0.34, fill: P.white }),
]);
const blush = (x, y) => s('ellipse', { cx: x, cy: y, rx: 9, ry: 6, fill: P.pinkDeep, opacity: 0.55 });
const mouthY = (x, y, w = 12) => s('path', { d: `M${x} ${y} v6 M${x} ${y + 6} q-${w / 2} 7 -${w} 0 M${x} ${y + 6} q${w / 2} 7 ${w} 0`, fill: 'none', ...L(3) });
const strokeThick = (d, outer, inner, fillc) => [
  s('path', { d, fill: 'none', ...line(outer, P.brown) }),
  s('path', { d, fill: 'none', ...line(inner, fillc) }),
];

const DRAW = {
  dog: () => [
    part('tail', 150, 172, strokeThick('M150 176 C176 166 184 142 172 124', 18, 11, P.woodDark)),
    E(100, 180, 58, 44, P.cream),
    part('ears', 100, 70, [
      E(42, 88, 18, 38, P.woodDark, 4, { transform: 'rotate(14 42 88)' }),
      E(158, 88, 18, 38, P.woodDark, 4, { transform: 'rotate(-14 158 88)' }),
    ]),
    E(100, 96, 57, 51, P.cream),
    s('ellipse', { cx: 76, cy: 88, rx: 19, ry: 21, fill: P.woodDark, opacity: 0.9 }),
    eye(78, 90), eye(124, 90),
    E(100, 116, 25, 18, P.white, 3.5),
    E(100, 107, 9.5, 6.5, P.brown, 2),
    s('path', { d: 'M100 112 V120 M100 120 q-8 7 -16 1 M100 120 q8 7 16 1', fill: 'none', ...L(3) }),
    s('path', { d: 'M94 124 q6 14 12 0 Z', fill: P.pinkDeep, ...L(2.5) }),
  ],
  cat: () => [
    part('tail', 150, 176, strokeThick('M150 182 C192 176 196 132 176 118', 18, 11, P.orange)),
    E(100, 180, 56, 44, P.orange),
    part('ears', 100, 64, [
      s('path', { d: 'M52 74 L50 20 L92 48 Z', fill: P.orange, ...L(4) }),
      s('path', { d: 'M58 62 L57 36 L77 49 Z', fill: P.pink }),
      s('path', { d: 'M148 74 L150 20 L108 48 Z', fill: P.orange, ...L(4) }),
      s('path', { d: 'M142 62 L143 36 L123 49 Z', fill: P.pink }),
    ]),
    E(100, 100, 58, 50, P.orange),
    s('path', { d: 'M100 52 V66 M84 54 L86 67 M116 54 L114 67', fill: 'none', ...line(3.5, P.woodDark) }),
    E(100, 120, 21, 14, P.cream, 0),
    eye(74, 96, 7.5), eye(126, 96, 7.5),
    s('path', { d: 'M93 108 H107 L100 116 Z', fill: P.pinkDeep, ...L(2.5) }),
    s('path', { d: 'M100 116 v5 M100 121 q-6 6 -12 0 M100 121 q6 6 12 0', fill: 'none', ...L(3) }),
    s('path', { d: 'M62 112 L34 106 M62 119 L34 124 M138 112 L166 106 M138 119 L166 124', fill: 'none', ...line(2.5, P.brownSoft) }),
  ],
  rabbit: () => [
    E(100, 182, 55, 42, P.white),
    part('ears', 100, 100, [
      s('g', { transform: 'rotate(-8 72 50)' }, [E(72, 50, 17, 45, P.white), E(72, 52, 8, 30, P.pink, 0)]),
      s('g', { transform: 'rotate(8 128 50)' }, [E(128, 50, 17, 45, P.white), E(128, 52, 8, 30, P.pink, 0)]),
    ]),
    E(100, 120, 52, 46, P.white),
    eye(77, 116), eye(123, 116), blush(64, 130), blush(136, 130),
    E(100, 127, 6.5, 4.5, P.pinkDeep, 2),
    s('path', { d: 'M100 132 q-6 8 -12 4 M100 132 q6 8 12 4', fill: 'none', ...L(3) }),
    s('rect', { x: 94, y: 137, width: 12, height: 10, rx: 3, fill: P.white, ...L(2.5) }),
  ],
  bear: () => [
    E(100, 182, 56, 44, P.wood),
    E(100, 188, 34, 28, P.cream, 0),
    E(48, 168, 15, 26, P.wood, 4, { transform: 'rotate(25 48 168)' }),
    part('arm', 152, 150, [E(160, 166, 15, 26, P.wood, 4, { transform: 'rotate(-25 160 166)' })]),
    part('ears', 100, 60, [C(54, 54, 21, P.wood), C(54, 54, 10, P.cream, 0), C(146, 54, 21, P.wood), C(146, 54, 10, P.cream, 0)]),
    C(100, 100, 55, P.wood),
    eye(76, 92), eye(124, 92), blush(62, 112), blush(138, 112),
    E(100, 118, 27, 21, P.cream, 3.5),
    E(100, 109, 9.5, 7, P.brown, 2),
    s('path', { d: 'M100 115 V123 M100 123 q-8 7 -16 1 M100 123 q8 7 16 1', fill: 'none', ...L(3) }),
  ],
  elephant: () => [
    E(100, 184, 60, 42, P.gray),
    part('ears', 100, 90, [
      E(36, 98, 34, 44, P.gray), E(36, 100, 19, 29, P.pink, 0),
      E(164, 98, 34, 44, P.gray), E(164, 100, 19, 29, P.pink, 0),
    ]),
    E(100, 98, 54, 52, P.gray),
    eye(76, 86), eye(124, 86), blush(60, 108), blush(140, 108),
    part('trunk', 100, 128, [
      ...strokeThick('M100 124 C100 150 98 168 110 176', 34, 25, P.gray),
      s('path', { d: 'M88 140 q12 4 24 0', fill: 'none', ...line(2.5, P.brownSoft) }),
    ]),
  ],
  pig: () => [
    part('tail', 152, 172, strokeThick('M150 174 q24 -2 22 -18 q-2 -12 -14 -6 q-8 6 2 12', 10, 5, P.pinkDeep)),
    E(100, 182, 58, 44, P.pink),
    part('ears', 100, 62, [
      s('path', { d: 'M54 78 L52 34 L94 54 Z', fill: P.pinkDeep, ...L(4) }),
      s('path', { d: 'M146 78 L148 34 L106 54 Z', fill: P.pinkDeep, ...L(4) }),
    ]),
    E(100, 100, 60, 51, P.pink),
    eye(70, 90), eye(130, 90), blush(56, 112), blush(144, 112),
    E(100, 117, 27, 20, P.pinkDeep, 3.5),
    E(91, 117, 4.5, 6.5, P.brown, 0), E(109, 117, 4.5, 6.5, P.brown, 0),
    s('path', { d: 'M88 140 q12 8 24 0', fill: 'none', ...L(3) }),
  ],
  frog: () => [
    E(100, 184, 56, 42, P.grass),
    E(100, 190, 34, 28, P.cream, 0),
    C(66, 72, 23, P.grass), C(134, 72, 23, P.grass),
    C(66, 72, 14, P.white, 3), C(134, 72, 14, P.white, 3),
    C(68, 73, 7, P.brown, 0), C(132, 73, 7, P.brown, 0),
    s('circle', { cx: 71, cy: 70, r: 2.5, fill: P.white }), s('circle', { cx: 135, cy: 70, r: 2.5, fill: P.white }),
    E(100, 118, 64, 46, P.grass),
    s('ellipse', { cx: 62, cy: 100, rx: 9, ry: 6, fill: P.grassDeep, opacity: 0.8 }),
    s('ellipse', { cx: 140, cy: 96, rx: 8, ry: 5, fill: P.grassDeep, opacity: 0.8 }),
    part('throat', 100, 136, [E(100, 146, 26, 14, P.cream, 3)]),
    s('path', { d: 'M48 126 Q100 160 152 126', fill: 'none', ...L(4) }),
    blush(58, 128), blush(142, 128),
    s('circle', { cx: 92, cy: 108, r: 2.5, fill: P.brown }), s('circle', { cx: 108, cy: 108, r: 2.5, fill: P.brown }),
  ],
  bird: () => [
    s('path', { d: 'M84 176 v16 M116 176 v16 M72 194 h24 M104 194 h24', fill: 'none', ...line(5, P.orange) }),
    C(100, 114, 62, P.sky),
    E(100, 142, 38, 32, P.cream, 0),
    s('path', { d: 'M92 56 q2 -16 8 -6 M100 54 q8 -18 14 -2', fill: 'none', ...L(4) }),
    part('wing', 56, 118, [E(40, 128, 17, 34, P.bluePale, 4, { transform: 'rotate(18 40 128)' })], { 'data-side': 'l' }),
    part('wing', 144, 118, [E(160, 128, 17, 34, P.bluePale, 4, { transform: 'rotate(-18 160 128)' })], { 'data-side': 'r' }),
    eye(78, 98), eye(122, 98), blush(62, 116), blush(138, 116),
    s('path', { d: 'M88 112 L112 112 L100 132 Z', fill: P.orange, ...L(3.5) }),
  ],
  squirrel: () => [
    part('tail', 150, 168, [
      E(168, 112, 28, 62, P.woodDark, 4, { transform: 'rotate(18 168 112)' }),
      s('path', { d: 'M160 76 q16 20 6 52 M172 70 q14 26 2 60', fill: 'none', ...line(3, P.wood), transform: 'rotate(18 168 112)' }),
    ]),
    E(100, 184, 54, 42, P.woodDark),
    E(100, 190, 32, 26, P.cream, 0),
    part('ears', 100, 56, [
      s('path', { d: 'M54 66 L54 26 Q62 20 76 40 Z', fill: P.woodDark, ...L(4) }),
      s('path', { d: 'M146 66 L146 26 Q138 20 124 40 Z', fill: P.woodDark, ...L(4) }),
    ]),
    C(100, 100, 51, P.woodDark),
    E(80, 118, 22, 16, P.cream, 0), E(120, 118, 22, 16, P.cream, 0),
    eye(76, 92), eye(124, 92), blush(58, 110), blush(142, 110),
    E(100, 108, 8.5, 6, P.brown, 2),
    s('path', { d: 'M100 114 v6 M100 120 q-8 6 -14 0 M100 120 q8 6 14 0', fill: 'none', ...L(3) }),
    s('rect', { x: 95, y: 122, width: 10, height: 10, rx: 3, fill: P.white, ...L(2.5) }),
    E(100, 170, 14, 17, P.wood, 3.5), E(100, 156, 17, 9, P.woodDeep, 3.5),
  ],
  fish: () => [
    part('tail', 66, 100, [s('path', { d: 'M68 100 L20 62 Q12 100 20 138 Z', fill: P.pinkDeep, ...L(4) })]),
    s('path', { d: 'M100 62 Q122 26 156 58', fill: P.pinkDeep, ...L(4) }),
    E(118, 100, 62, 48, P.orange),
    E(124, 118, 42, 20, P.cream, 0),
    s('path', { d: 'M92 84 q10 14 0 28 M110 80 q10 18 0 36', fill: 'none', ...line(2.5, P.woodDark) }),
    part('fin', 110, 118, [s('path', { d: 'M108 118 Q96 142 126 140 Q124 126 108 118 Z', fill: P.pinkDeep, ...L(3) })]),
    C(152, 90, 10, P.white, 3), C(154, 91, 5.5, P.brown, 0),
    blush(150, 114),
    s('path', { d: 'M176 106 q-8 6 -16 0', fill: 'none', ...L(3) }),
  ],
  turtle: () => [
    part('head', 100, 100, [
      E(100, 98, 21, 26, P.grass),
      C(100, 68, 30, P.grass),
      eye(88, 64, 5.5), eye(112, 64, 5.5), blush(80, 78), blush(120, 78),
      s('path', { d: 'M92 78 q8 7 16 0', fill: 'none', ...L(3) }),
    ]),
    E(44, 184, 20, 12, P.grass), E(156, 184, 20, 12, P.grass),
    s('path', { d: 'M20 172 C20 102 58 80 100 80 C142 80 180 102 180 172 Z', fill: P.grassDeep, ...L(4.5) }),
    E(100, 124, 26, 21, P.greenPale, 3),
    s('path', { d: 'M74 118 L52 110 M126 118 L148 110 M84 142 L62 160 M116 142 L138 160 M100 103 V92', fill: 'none', ...line(3, P.brown) }),
    s('rect', { x: 16, y: 164, width: 168, height: 26, rx: 13, fill: P.wood, ...L(4) }),
  ],
  octopus: () => [
    part('legs', 100, 120, [48, 80, 120, 152].map((x, i) => {
      const d = i % 2 ? `M${x} 120 q-16 28 0 48 q12 14 -6 26` : `M${x} 120 q16 28 0 48 q-12 14 6 26`;
      return s('g', {}, strokeThick(d, 26, 18, P.pinkDeep));
    })),
    C(100, 90, 58, P.pinkDeep),
    C(76, 52, 8, P.pink, 0, { opacity: 0.9 }), C(112, 44, 6, P.pink, 0, { opacity: 0.9 }), C(130, 60, 7, P.pink, 0, { opacity: 0.9 }),
    eye(76, 94, 8), eye(124, 94, 8), blush(58, 112), blush(142, 112),
    s('path', { d: 'M90 112 q10 9 20 0', fill: 'none', ...L(3.5) }),
  ],
};

// opts: { filter: CRAYON_LITE(既定) | CRAYON | null, size: px（指定すると width/height を付ける） }
export function animal(key, opts = {}) {
  const g = svg(200, 200, { class: 'animal', 'data-art': key, role: 'img' });
  g.append(...DRAW[key]());
  const f = opts.filter === undefined ? CRAYON_LITE : opts.filter;
  if (f) g.setAttribute('filter', f);
  if (opts.size) { g.setAttribute('width', opts.size); g.setAttribute('height', opts.size); }
  return g;
}
