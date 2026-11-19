// ⑤ どうぶつ いないいないばあ：かげから顔を出す動物をタップすると、飛び出して名前を教えてくれる
import { P } from '../core/palette.js';
import { s, svg, h, line, CRAYON, CRAYON_LITE } from '../core/crayon.js';
import { animal, ANIMALS_BY_SCENE, PEEK, PEEK_DEFAULT } from '../art/animals.js';
import { scene, SCENES, SCENE_LABEL } from '../art/scenes.js';

const rnd = (a, b) => a + Math.random() * (b - a);

// ── ホームの絵ボタン：草むらから顔を出すうさぎ ──
function icon() {
  const g = svg(120, 120);
  const cs = [[34, 88, 24], [60, 80, 28], [88, 88, 24]];
  g.append(
    s('g', { transform: 'translate(0 -4)' }, [
      s('ellipse', { cx: 48, cy: 36, rx: 8, ry: 22, fill: P.white, ...line(3.5), transform: 'rotate(-8 48 36)' }),
      s('ellipse', { cx: 72, cy: 36, rx: 8, ry: 22, fill: P.white, ...line(3.5), transform: 'rotate(8 72 36)' }),
      s('ellipse', { cx: 48, cy: 38, rx: 3.5, ry: 14, fill: P.pink, transform: 'rotate(-8 48 36)' }),
      s('ellipse', { cx: 72, cy: 38, rx: 3.5, ry: 14, fill: P.pink, transform: 'rotate(8 72 36)' }),
      s('ellipse', { cx: 60, cy: 66, rx: 26, ry: 22, fill: P.white, ...line(3.5) }),
      s('circle', { cx: 50, cy: 62, r: 3.5, fill: P.brown }),
      s('circle', { cx: 70, cy: 62, r: 3.5, fill: P.brown }),
      s('ellipse', { cx: 60, cy: 70, rx: 3.5, ry: 2.5, fill: P.pinkDeep }),
    ]),
    ...cs.map(([x, y, r]) => s('circle', { cx: x, cy: y, r, fill: P.grassDeep, ...line(7) })),
    ...cs.map(([x, y, r]) => s('circle', { cx: x, cy: y, r: r - 0.5, fill: P.grassDeep })),
    s('rect', { x: 14, y: 90, width: 92, height: 20, fill: P.grassDeep }),
    s('path', { d: 'M30 92 q6 -9 12 0 M70 96 q6 -9 12 0', fill: 'none', ...line(3.5, P.grass) }),
  );
  g.setAttribute('filter', CRAYON);
  return g;
}

function arrowArt(dir) {
  const g = svg(72, 72);
  g.append(
    s('circle', { cx: 36, cy: 36, r: 32, fill: P.cream, ...line(4) }),
    s('path', { d: dir < 0 ? 'M42 20 L26 36 L42 52' : 'M30 20 L46 36 L30 52', fill: 'none', ...line(7, P.woodDeep) }),
  );
  g.setAttribute('filter', CRAYON_LITE);
  return g;
}

// ── 動物ごとのうごき（ゆったり）。sp = そのかげの情報 ──
const swing = (els, deg, ms, n, dir = 1) => els.forEach((el, i) => el.animate(
  [{ transform: 'rotate(0deg)' }, { transform: `rotate(${deg * dir * (i % 2 ? -1 : 1) * (els.length > 1 ? 1 : 1)}deg)` }, { transform: 'rotate(0deg)' }, { transform: `rotate(${-deg * dir * (i % 2 ? -1 : 1) * 0.6}deg)` }, { transform: 'rotate(0deg)' }],
  { duration: ms, iterations: n, easing: 'ease-in-out' }));
const hop = (el, px, ms, n) => el.animate(
  [{ translate: '0 0' }, { translate: `0 ${-px}px` }, { translate: '0 0' }],
  { duration: ms, iterations: n, easing: 'ease-in-out' });
const parts = (sp, n) => [...sp.art.querySelectorAll(`[data-part="${n}"]`)];

const MOTION = {
  dog: (sp) => { swing(parts(sp, 'tail'), 26, 560, 4); hop(sp.art, 8, 1100, 2); },
  cat: (sp) => { swing(parts(sp, 'tail'), 18, 1000, 2); swing(parts(sp, 'ears'), 5, 600, 3); },
  rabbit: (sp) => { hop(sp.art, sp.A * 0.16, 760, 3); swing(parts(sp, 'ears'), 8, 760, 3); },
  bear: (sp) => { swing(parts(sp, 'arm'), 30, 800, 3); hop(sp.art, 6, 1200, 2); },
  elephant: (sp) => parts(sp, 'trunk').forEach((el) => el.animate(
    [{ transform: 'rotate(0deg)' }, { transform: 'rotate(125deg)', offset: 0.28 }, { transform: 'rotate(118deg)', offset: 0.5 }, { transform: 'rotate(125deg)', offset: 0.72 }, { transform: 'rotate(0deg)' }],
    { duration: 2800, easing: 'ease-in-out' })),
  pig: (sp) => { swing(parts(sp, 'tail'), 24, 600, 4); swing(parts(sp, 'ears'), 6, 800, 3); hop(sp.art, 10, 900, 2); },
  frog: (sp) => {
    parts(sp, 'throat').forEach((el) => el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35,1.5)' }, { transform: 'scale(1)' }], { duration: 800, iterations: 3, easing: 'ease-in-out' }));
    hop(sp.art, sp.A * 0.1, 900, 3);
  },
  bird: (sp) => {
    parts(sp, 'wing').forEach((el) => {
      const k = el.dataset.side === 'l' ? -1 : 1;
      el.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${k * 38}deg)` }, { transform: 'rotate(0deg)' }], { duration: 520, iterations: 5, easing: 'ease-in-out' });
    });
    hop(sp.art, sp.A * 0.1, 520, 5);
  },
  squirrel: (sp) => { swing(parts(sp, 'tail'), 14, 900, 3); hop(sp.art, 8, 900, 2); },
  fish: (sp) => {
    // 水面からジャンプして、水しぶき
    const base = sp.risen;
    sp.splash();
    sp.wrap.animate(
      [{ translate: `0 ${base}px`, rotate: '0deg' }, { translate: `0 ${base - sp.A * 0.7}px`, rotate: '-14deg', offset: 0.45 }, { translate: `0 ${base - sp.A * 0.5}px`, rotate: '14deg', offset: 0.6 }, { translate: `0 ${base}px`, rotate: '0deg' }],
      { duration: 1700, easing: 'ease-in-out' });
    parts(sp, 'tail').forEach((el) => swing([el], 14, 420, 4));
    sp.later(() => sp.splash(), 1500);
  },
  turtle: (sp) => parts(sp, 'head').forEach((el) => el.animate(
    [{ transform: 'translateY(0px)' }, { transform: 'translateY(52px)', offset: 0.25 }, { transform: 'translateY(52px)', offset: 0.65 }, { transform: 'translateY(0px)' }],
    { duration: 2600, easing: 'ease-in-out' })),
  octopus: (sp) => {
    parts(sp, 'legs').forEach((el) => el.animate(
      [{ transform: 'skewX(0deg) scaleY(1)' }, { transform: 'skewX(9deg) scaleY(0.94)' }, { transform: 'skewX(0deg) scaleY(1)' }, { transform: 'skewX(-9deg) scaleY(0.94)' }, { transform: 'skewX(0deg) scaleY(1)' }],
      { duration: 1000, iterations: 3, easing: 'ease-in-out' }));
    sp.art.animate([{ rotate: '0deg' }, { rotate: '5deg' }, { rotate: '-5deg' }, { rotate: '0deg' }], { duration: 1500, iterations: 2, easing: 'ease-in-out' });
  },
};
// 飛び出すときの高さ（動物の大きさに対する割合。マイナスが上）
const RISE = { fish: 0.12, turtle: 0.18, octopus: 0.2, bird: 0.45 };

export default {
  id: 'peekaboo',
  title: 'いないいないばあ',
  icon,
  start(root, ctx) {
    let idx = 0;
    let gen = 0;
    let layer = null;
    let spots = [];
    let celebrating = false;
    const touched = Object.fromEntries(SCENES.map((n) => [n, new Set()]));
    root.style.background = P.skyPale;

    // 舞台の中での位置（水しぶき用）
    const fxPoint = (x, y) => {
      const a = root.getBoundingClientRect(); const b = ctx.fx.getBoundingClientRect();
      return { x: x + a.left - b.left, y: y + a.top - b.top };
    };

    function move(sp, to, ms, easing) {
      const from = sp.y;
      sp.y = to;
      sp.wrap.style.translate = `0 ${to}px`;
      sp.wrap.animate([{ translate: `0 ${from}px` }, { translate: `0 ${to}px` }], { duration: ms, easing });
    }
    const st = (sp, v) => { sp.state = v; sp.wrap.dataset.state = v; };
    const outMark = (sp, on) => { if (on) sp.wrap.setAttribute('data-out', '1'); else sp.wrap.removeAttribute('data-out'); };

    function peek(sp) {
      if (sp.state !== 'hidden') return;
      st(sp, 'peek');
      sp.last = Date.now();
      sp.wrap.style.visibility = 'visible';
      outMark(sp, true);
      move(sp, 0, 1800, 'ease-out');
      clearTimeout(sp.timer);
      sp.timer = ctx.later(() => { if (sp.state === 'peek') hide(sp); }, rnd(6500, 8500));
    }
    function hide(sp, ms = 1400) {
      if (sp.state === 'hidden') return;
      const g = gen;
      st(sp, 'going');
      outMark(sp, false);
      move(sp, sp.hiddenY, ms, 'ease-in');
      ctx.later(() => { if (g === gen && sp.state === 'going') { st(sp, 'hidden'); sp.wrap.style.visibility = 'hidden'; } }, ms + 50);
    }

    function splash(sp) {
      const r = sp.el.getBoundingClientRect();
      const p = fxPoint(r.left + r.width / 2 - root.getBoundingClientRect().left, r.top + sp.ci - root.getBoundingClientRect().top);
      for (let i = 0; i < 7; i++) {
        const d = h('div', { style: { position: 'absolute', left: p.x - 7 + 'px', top: p.y - 7 + 'px', width: '14px', height: '18px', borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%', background: P.skyPale, border: `2.5px solid ${P.sky}` } });
        ctx.fx.appendChild(d);
        const dx = (i - 3) * (sp.A * 0.13) + rnd(-6, 6);
        const up = rnd(40, 80);
        d.animate(
          [{ transform: 'translate(0,0) scale(.4)', opacity: 0 }, { transform: `translate(${dx * 0.6}px, ${-up}px) scale(1)`, opacity: 1, offset: 0.4 }, { transform: `translate(${dx}px, 10px) scale(.8)`, opacity: 0 }],
          { duration: 1300, easing: 'ease-out' }).onfinish = () => d.remove();
      }
    }

    function pop(sp) {
      if (sp.state !== 'peek' || celebrating) return;
      const g = gen;
      st(sp, 'pop');
      clearTimeout(sp.timer);
      ctx.sfx('pop');
      ctx.say(sp.key, sp.art, { gap: sp.A * 0.5 + 24 });
      touched[SCENES[idx]].add(sp.key);
      sp.risen = -(RISE[sp.key] ?? 0.5) * sp.A;
      sp.later = (fn, ms) => ctx.later(() => { if (g === gen) fn(); }, ms);
      sp.splash = () => splash(sp);
      move(sp, sp.risen, 700, 'cubic-bezier(.2,.8,.3,1.2)');
      sp.later(() => { MOTION[sp.key](sp); }, 700);
      sp.later(() => {
        if (sp.state !== 'pop') return;
        if (touched[SCENES[idx]].size >= 4 && !celebrating) { celebrate(g, sp); return; }
        hide(sp, 1500);
      }, 3300);
    }

    // おかたづけ：4匹そろって顔を出し、手をふる（ぴょんと跳ねる）→ done
    function celebrate(g, last) {
      celebrating = true;
      const name = SCENES[idx];
      st(last, 'wave');
      move(last, 0, 900, 'ease-in-out');
      spots.forEach((sp, i) => {
        if (sp === last) return;
        clearTimeout(sp.timer);
        sp.later = (fn, ms) => ctx.later(() => { if (g === gen) fn(); }, ms);
        if (sp.state === 'hidden' || sp.state === 'going') {
          st(sp, 'wave'); sp.wrap.style.visibility = 'visible'; outMark(sp, true);
          move(sp, 0, 1300, 'ease-out');
        } else st(sp, 'wave');
      });
      outMark(last, true);
      ctx.later(() => {
        if (g !== gen) return;
        spots.forEach((sp, i) => {
          ctx.later(() => { if (g !== gen) return; ctx.bounce(sp.art); ctx.sfx('pop'); }, i * 350);
          ctx.later(() => { if (g !== gen) return; ctx.bounce(sp.art); }, i * 350 + 1600);
        });
        const r = root.getBoundingClientRect();
        ctx.cheer({ x: r.left + r.width / 2, y: r.top + r.height * 0.35 }, { count: 6, spread: 120 });
      }, 1300);
      ctx.later(() => {
        if (g !== gen) return;
        ctx.done();
      }, 3400);
      ctx.later(() => {
        if (g !== gen) return;
        touched[name].clear();
        spots.forEach((sp) => { st(sp, 'going'); hide(sp, 1500); });
        ctx.later(() => { if (g === gen) celebrating = false; }, 1700);
      }, 5000);
    }

    function tick(g) {
      if (g !== gen) return;
      if (!celebrating) {
        const out = spots.filter((sp) => sp.state === 'peek' || sp.state === 'pop').length;
        const free = spots.filter((sp) => sp.state === 'hidden');
        let n = out === 0 ? 1 + (Math.random() < 0.4 ? 1 : 0) : (Math.random() < 0.55 ? 1 : 0);
        n = Math.min(n, 3 - out, free.length);
        // しばらく出ていない動物を先に（かたよらないように）
        const pick = free.slice().sort((a, b) => (a.last - b.last) + rnd(-1500, 1500)).slice(0, n);
        pick.forEach((sp, i) => ctx.later(() => { if (g === gen) peek(sp); }, i * 500));
      }
      ctx.later(() => tick(g), rnd(2200, 3200));
    }

    function build(first) {
      gen += 1;
      const g = gen;
      celebrating = false;
      const name = SCENES[idx];
      const W = root.clientWidth; const H = root.clientHeight;
      if (layer) layer.remove();
      const sc = scene(name, W, H);
      layer = h('div', { 'data-scene': name, style: { position: 'absolute', inset: '0', overflow: 'hidden' } });
      layer.append(sc.back);
      spots = sc.spots.map((spd, i) => {
        const key = ANIMALS_BY_SCENE[name][i];
        const A = spd.size;
        const peekFrac = PEEK[key] ?? PEEK_DEFAULT;
        const art = animal(key, { filter: CRAYON_LITE });
        art.style.cssText = 'width:100%;height:100%;display:block;';
        const wrap = h('div', { 'data-animal': key, style: { position: 'absolute', left: (spd.w - A) / 2 + 'px', top: (spd.ci - peekFrac * A) + 'px', width: A + 'px', height: A + 'px', visibility: 'hidden', willChange: 'translate' } }, [art]);
        const hiddenY = peekFrac * A;
        wrap.style.translate = `0 ${hiddenY}px`;
        const el = h('div', { 'data-spot': key, style: { position: 'absolute', left: spd.x + 'px', top: spd.y + 'px', width: spd.w + 'px', height: spd.h + 'px', zIndex: spd.z, clipPath: 'inset(-2000px -300px 0px -300px)' } }, [wrap, spd.front]);
        const sp = { key, el, wrap, art, A, ci: spd.ci, hiddenY, y: hiddenY, state: 'hidden', timer: 0, risen: 0, last: 0 };
        wrap.dataset.state = 'hidden';
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); pop(sp); });
        layer.appendChild(el);
        return sp;
      });
      root.insertBefore(layer, root.firstChild);
      if (!first) layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'ease-out' });
      label.textContent = SCENE_LABEL[name];
      dots.forEach((d, i) => { d.style.background = i === idx ? P.woodDeep : P.cream; });
      ctx.later(() => tick(g), first ? 700 : 900);
    }

    // 左右の矢印、景色の名前と印
    const mkArrow = (dir) => {
      const b = h('button', { 'aria-label': dir < 0 ? 'まえの けしき' : 'つぎの けしき', [dir < 0 ? 'data-prev' : 'data-next']: '1', style: { position: 'absolute', width: '72px', height: '72px', padding: '0', border: '0', background: 'transparent', zIndex: 40, [dir < 0 ? 'left' : 'right']: '8px' } }, [arrowArt(dir)]);
      b.firstChild.style.cssText = 'width:100%;height:100%;display:block;';
      b.addEventListener('click', () => { ctx.sfx('tap'); idx = (idx + dir + SCENES.length) % SCENES.length; build(false); });
      return b;
    };
    const prev = mkArrow(-1); const next = mkArrow(1);
    const label = h('div', { 'data-label': '1', style: { position: 'absolute', left: '50%', top: '10px', transform: 'translateX(-50%)', zIndex: 40, fontSize: '26px', fontWeight: '700', letterSpacing: '.1em', color: P.brown, background: P.veil, borderRadius: '22px', padding: '4px 18px', pointerEvents: 'none' } });
    const dots = SCENES.map(() => h('div', { style: { width: '14px', height: '14px', borderRadius: '50%', border: `2.5px solid ${P.brownSoft}` } }));
    const dotRow = h('div', { style: { position: 'absolute', left: '50%', top: '52px', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 40, pointerEvents: 'none' } }, dots);
    const placeArrows = () => {
      const top = root.clientHeight > root.clientWidth ? root.clientHeight * 0.1 : root.clientHeight * 0.5 - 36;
      prev.style.top = next.style.top = top + 'px';
    };
    root.append(prev, next, label, dotRow);
    placeArrows();
    build(true);
    ctx.onResize(() => { placeArrows(); build(true); });
  },
  stop() {},
};
