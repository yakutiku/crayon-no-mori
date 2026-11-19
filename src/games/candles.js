// ⑦ ろうそく ふーっ：どうぶつのおたんじょうびケーキに、ろうそくを立てて「いち、にぃ、さん」、ふーっと消す
import { P } from '../core/palette.js';
import { s, svg, h, line, shuffle, CRAYON, CRAYON_LITE } from '../core/crayon.js';
import { NUMBER_KEYS } from '../core/words.js';

const VW = 388; const VH = 440;
const MAX = 5;
const XS = [62, 128, 194, 260, 326];
const BASE_Y = 300;
const CANDLE_COLORS = [P.pink, P.sky, P.yellowPale, P.greenPale, P.orange];
const CONFETTI = [P.pink, P.sky, P.yellow, P.grass, P.orange, P.pinkDeep, P.greenPale];
const ANIMALS = ['bear', 'rabbit', 'cat', 'pig'];

// どうぶつの顔（194,110 を中心に）。ケーキの上にのぞく
function animalArt(kind) {
  const g = svg(VW, VH);
  const body = { bear: P.wood, rabbit: P.white, cat: P.orange, pig: P.pink }[kind];
  const out = [];
  if (kind === 'bear') {
    out.push(s('circle', { cx: 130, cy: 52, r: 24, fill: body, ...line(4) }), s('circle', { cx: 258, cy: 52, r: 24, fill: body, ...line(4) }),
      s('circle', { cx: 130, cy: 54, r: 11, fill: P.woodDark }), s('circle', { cx: 258, cy: 54, r: 11, fill: P.woodDark }));
  } else if (kind === 'rabbit') {
    out.push(s('path', { d: 'M150 70 C130 20 140 -4 156 6 C170 16 176 50 178 72 Z', fill: body, ...line(4) }),
      s('path', { d: 'M238 70 C258 20 248 -4 232 6 C218 16 212 50 210 72 Z', fill: body, ...line(4) }),
      s('path', { d: 'M152 60 C146 30 150 18 156 20 C162 24 166 44 166 62 Z', fill: P.pink }),
      s('path', { d: 'M236 60 C242 30 238 18 232 20 C226 24 222 44 222 62 Z', fill: P.pink }));
  } else if (kind === 'cat') {
    out.push(s('path', { d: 'M124 84 L118 30 L168 62 Z', fill: body, ...line(4) }), s('path', { d: 'M264 84 L270 30 L220 62 Z', fill: body, ...line(4) }));
  } else {
    out.push(s('path', { d: 'M126 66 C112 44 130 36 152 56 Z', fill: body, ...line(4) }), s('path', { d: 'M262 66 C276 44 258 36 236 56 Z', fill: body, ...line(4) }));
  }
  out.push(s('ellipse', { cx: 194, cy: 120, rx: 80, ry: 68, fill: body, ...line(4.5) }));
  out.push(s('circle', { cx: 160, cy: 110, r: 7, fill: P.brown }), s('circle', { cx: 228, cy: 110, r: 7, fill: P.brown }));
  out.push(s('circle', { cx: 140, cy: 134, r: 11, fill: P.pink, opacity: 0.7 }), s('circle', { cx: 248, cy: 134, r: 11, fill: P.pink, opacity: 0.7 }));
  if (kind === 'pig') {
    out.push(s('ellipse', { cx: 194, cy: 136, rx: 26, ry: 18, fill: P.pinkDeep, ...line(3.5) }), s('circle', { cx: 185, cy: 136, r: 3.5, fill: P.brown }), s('circle', { cx: 203, cy: 136, r: 3.5, fill: P.brown }));
  } else {
    out.push(s('path', { d: 'M186 128 H202 L194 138 Z', fill: P.brown, ...line(3) }), s('path', { d: 'M194 138 V146 M180 150 Q194 160 194 146 Q194 160 208 150', fill: 'none', ...line(3.5) }));
  }
  if (kind === 'cat') out.push(s('path', { d: 'M150 138 L116 130 M150 146 L118 152 M238 138 L272 130 M238 146 L270 152', fill: 'none', ...line(3, P.brownSoft) }));
  g.append(...out);
  return g;
}

function cakeArt() {
  const g = svg(VW, VH);
  g.append(
    s('ellipse', { cx: 194, cy: 428, rx: 188, ry: 12, fill: P.graySoft, ...line(3, P.gray) }),
    s('path', { d: 'M14 300 H374 V410 C374 420 366 426 356 426 H32 C22 426 14 420 14 410 Z', fill: P.pink, ...line(4.5) }),
    s('path', { d: 'M14 300 H374 V322 C360 340 346 316 330 330 C314 344 300 318 282 330 C264 342 250 318 232 330 C214 342 200 318 182 330 C164 342 150 318 132 330 C114 342 100 318 82 330 C64 342 44 318 14 326 Z', fill: P.white, ...line(4) }),
    ...[[60, 380], [130, 366], [200, 384], [270, 368], [330, 382]].map(([x, y], i) => s('circle', { cx: x, cy: y, r: 9, fill: [P.yellow, P.sky, P.greenPale, P.orange, P.yellowPale][i], ...line(3) })),
  );
  return g;
}

function candleBody(i) {
  const x = XS[i];
  const g = s('g', { 'data-candle': i });
  const body = s('g', {}, [
    s('rect', { x: x - 11, y: BASE_Y - 56, width: 22, height: 60, rx: 5, fill: CANDLE_COLORS[i], ...line(3.5) }),
    s('path', { d: `M${x - 11} ${BASE_Y - 38} L${x + 11} ${BASE_Y - 30} M${x - 11} ${BASE_Y - 20} L${x + 11} ${BASE_Y - 12}`, fill: 'none', ...line(3, P.white) }),
    s('path', { d: `M${x} ${BASE_Y - 56} V${BASE_Y - 66}`, fill: 'none', ...line(3) }),
  ]);
  body.setAttribute('filter', CRAYON_LITE);
  g.append(body);
  return g;
}

function flameArt(i) {
  const x = XS[i]; const y = BASE_Y - 68;
  const f = s('g', { 'data-flame': i, style: 'pointer-events:all;cursor:pointer' });
  f.append(s('circle', { cx: x, cy: y - 12, r: 33, fill: P.white, opacity: 0.01 }));
  const fl = s('g', { style: 'transform-box:fill-box;transform-origin:50% 100%' }, [
    s('path', { d: `M${x} ${y - 36} C${x + 16} ${y - 18} ${x + 13} ${y} ${x} ${y} C${x - 13} ${y} ${x - 16} ${y - 18} ${x} ${y - 36} Z`, fill: P.orange, ...line(3) }),
    s('path', { d: `M${x} ${y - 20} C${x + 7} ${y - 11} ${x + 6} ${y - 2} ${x} ${y - 2} C${x - 6} ${y - 2} ${x - 7} ${y - 11} ${x} ${y - 20} Z`, fill: P.yellow }),
  ]);
  f.append(fl);
  if (fl.animate) fl.animate(
    [{ transform: 'scale(1,1) rotate(-3deg)' }, { transform: 'scale(1.07,0.94) rotate(3deg)' }],
    { duration: 1500 + Math.random() * 700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' },
  );
  return f;
}

let st = null;

export default {
  id: 'candles',
  title: 'ろうそく ふーっ',
  icon() {
    const g = svg(120, 120);
    g.append(
      s('path', { d: 'M14 66 H106 V100 C106 106 102 110 96 110 H24 C18 110 14 106 14 100 Z', fill: P.pink, ...line(3.5) }),
      s('path', { d: 'M14 66 H106 V76 C96 86 88 72 76 80 C64 88 56 72 44 80 C32 88 24 74 14 78 Z', fill: P.white, ...line(3) }),
      s('rect', { x: 52, y: 36, width: 16, height: 30, rx: 4, fill: P.sky, ...line(3.5) }),
      s('path', { d: 'M60 8 C70 20 68 30 60 30 C52 30 50 20 60 8 Z', fill: P.orange, ...line(3) }),
    );
    g.setAttribute('filter', CRAYON);
    return g;
  },

  start(root, ctx) {
    st = { root, ctx };
    root.style.background = P.paper;
    root.style.overflow = 'hidden';
    let order = shuffle(ANIMALS);
    let turn = 0;
    let scene = null; let busy = false;
    let candles = 0;

    function sizeScene() {
      if (!scene) return;
      const W = root.clientWidth; const H = root.clientHeight;
      const k = Math.min(W * 0.98 / VW, H * 0.98 / VH);
      scene.style.width = (VW * k) + 'px'; scene.style.height = (VH * k) + 'px';
      scene.style.left = ((W - VW * k) / 2) + 'px'; scene.style.top = ((H - VH * k) / 2) + 'px';
      scene.dataset.k = String(k);
    }

    function newCake() {
      root.replaceChildren();
      busy = false; candles = 0;
      const kind = order[turn % order.length];
      turn += 1;
      const back = animalArt(kind); const cake = cakeArt();
      back.setAttribute('filter', CRAYON); cake.setAttribute('filter', CRAYON);
      const cakeHit = s('g', { 'data-cake': '1', style: 'cursor:pointer' }, [s('rect', { x: 14, y: 290, width: 360, height: 140, fill: P.white, opacity: 0.01, style: 'pointer-events:all' })]);
      const front = svg(VW, VH);
      const candleLayer = s('g', {});
      front.append(cakeHit, candleLayer);
      for (const el of [back, cake, front]) { el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible'; }
      front.style.pointerEvents = 'none';
      cakeHit.style.pointerEvents = 'all';
      scene = h('div', { 'data-animal': kind, style: { position: 'absolute', opacity: '0', transition: 'opacity .8s ease' } }, [back, cake, front]);
      root.appendChild(scene);
      sizeScene();
      requestAnimationFrame(() => requestAnimationFrame(() => { if (scene) scene.style.opacity = '1'; }));

      const addCandle = () => {
        if (busy) return;
        if (candles >= MAX) { ctx.wobble(cake); return; }
        const i = candles; candles += 1;
        const c = candleBody(i);
        const fl = flameArt(i);
        c.append(fl);
        candleLayer.append(c);
        scene.dataset.candles = String(candles);
        scene.dataset.lit = String(candles);
        c.animate && c.animate([{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'ease-out' });
        ctx.sfx('pop');
        ctx.say(NUMBER_KEYS[i], c);
        ctx.bounce(back);
        floatNumber(i + 1);
        fl.addEventListener('click', () => blow(c, fl, i));
        fl.style.pointerEvents = 'all';
      };
      cakeHit.addEventListener('click', addCandle);

      function floatNumber(n) {
        const k = Number(scene.dataset.k) || 1;
        const d = h('div', { 'data-number': n, text: String(n), style: { position: 'absolute', left: '0', right: '0', top: (VH * 0.66 * k) + 'px', textAlign: 'center', fontSize: (110 * k) + 'px', fontWeight: '700', color: P.woodDeep, pointerEvents: 'none', opacity: '0' } });
        scene.appendChild(d);
        const a = d.animate ? d.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 0.5, transform: 'translateY(-10px)', offset: 0.35 }, { opacity: 0, transform: 'translateY(-34px)' }], { duration: 1800, easing: 'ease-out' }) : null;
        if (a) a.onfinish = () => d.remove(); else d.remove();
      }

      function blow(c, fl, i) {
        if (busy || !fl.isConnected || fl.dataset.blowing) return;
        fl.dataset.blowing = '1';
        ctx.sfx('blow');
        const x = XS[i]; const y = BASE_Y - 80;
        // どうぶつの鼻（口）から、ふーっと風が炎へ向かう
        const nose = { x: 194, y: 140 };
        ctx.bounce(back);
        for (let j = 0; j < 3; j++) {
          const ox = (j - 1) * 10; const oy = (j - 1) * 8;
          const mx = (nose.x + x) / 2 + ox + (x < nose.x ? 20 : -20); const my = (nose.y + y) / 2 + oy - 10;
          const wind = s('path', { d: `M${nose.x + ox / 2} ${nose.y + 6 + oy / 2} Q${mx} ${my} ${x + ox / 3} ${y + oy / 2}`, fill: 'none', stroke: P.sky, 'stroke-width': 7 - j, 'stroke-linecap': 'round', opacity: 0.9 });
          candleLayer.append(wind);
          const len = wind.getTotalLength ? wind.getTotalLength() : 200;
          wind.setAttribute('stroke-dasharray', `${len * 0.35} ${len * 2}`);
          wind.setAttribute('stroke-dashoffset', String(len * 0.35));
          const a = wind.animate && wind.animate(
            [{ strokeDashoffset: len * 0.35, opacity: 0.9 }, { strokeDashoffset: -len * 0.9, opacity: 0.2 }],
            { duration: 700, delay: j * 90, easing: 'ease-in', fill: 'backwards' },
          );
          if (a) a.onfinish = () => wind.remove(); else wind.remove();
        }
        // 風が届いたら炎が消える
        ctx.later(() => blowOut(c, fl, i, x, y), 560);
      }

      function blowOut(c, fl, i, x, y) {
        if (!fl.isConnected) return;
        fl.remove();
        scene.dataset.lit = String(scene.querySelectorAll('[data-flame]').length);
        for (let j = 0; j < 3; j++) {
          const sm = s('circle', { cx: x + (j - 1) * 6, cy: y, r: 8 + j * 2, fill: P.graySoft, opacity: 0 });
          candleLayer.append(sm);
          const a = sm.animate && sm.animate([{ opacity: 0.8, transform: 'translateY(0) scale(0.6)' }, { opacity: 0, transform: `translateY(${-46 - j * 14}px) scale(1.8)` }], { duration: 2000, delay: j * 200, easing: 'ease-out', fill: 'backwards' });
          if (a) a.onfinish = () => sm.remove(); else sm.remove();
        }
        if (scene.querySelectorAll('[data-flame]').length === 0) allOut();
      }
    }

    function allOut() {
      busy = true;
      ctx.later(() => {
        ctx.sfx('tada');
        confetti();
        ctx.done();
      }, 900);
      ctx.later(() => {
        if (!scene) return;
        scene.style.opacity = '0';
        ctx.later(newCake, 900);
      }, 6000);
    }

    function confetti() {
      const W = root.clientWidth; const H = root.clientHeight;
      for (let i = 0; i < 36; i++) {
        const sz = 10 + Math.random() * 10;
        const p = h('div', { style: { position: 'absolute', left: (Math.random() * W) + 'px', top: '-30px', width: sz + 'px', height: (sz * 0.6) + 'px', borderRadius: i % 3 ? '2px' : '50%', background: CONFETTI[i % CONFETTI.length], pointerEvents: 'none', opacity: '0.9' } });
        root.appendChild(p);
        const sway = (Math.random() - 0.5) * 120;
        const a = p.animate && p.animate([
          { transform: 'translate(0,0) rotate(0deg)', opacity: 0.9 },
          { transform: `translate(${sway}px, ${H * 0.55}px) rotate(${180 + Math.random() * 180}deg)`, opacity: 0.9, offset: 0.7 },
          { transform: `translate(${sway * 1.3}px, ${H + 40}px) rotate(${360 + Math.random() * 180}deg)`, opacity: 0 },
        ], { duration: 4200 + Math.random() * 1800, delay: Math.random() * 900, easing: 'ease-in-out', fill: 'backwards' });
        if (a) a.onfinish = () => p.remove(); else p.remove();
      }
    }

    ctx.onResize(sizeScene);
    newCake();
  },

  stop() { st = null; },
};
