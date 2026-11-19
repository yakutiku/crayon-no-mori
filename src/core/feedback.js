// できたときの反応（跳ねる、お花や星がふわっと出る）と、名前の吹き出し
import { P } from './palette.js';
import { h, flower, sparkle } from './crayon.js';
import { word } from './words.js';
import { getSettings } from './settings.js';

const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pointOf(at) {
  if (!at) return { x: innerWidth / 2, y: innerHeight / 2 };
  if (at.getBoundingClientRect) {
    const r = at.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return at;
}

// ぴょんと跳ねる（transform を使わないので、ドラッグ中の位置とぶつからない）
export function bounce(el) {
  if (!el || !el.animate) return;
  el.animate(
    [{ translate: '0 0' }, { translate: '0 -18px' }, { translate: '0 0' }, { translate: '0 -6px' }, { translate: '0 0' }],
    { duration: 700, easing: 'ease-out' },
  );
}

// ゆらゆら（順番が違うときなど。×の代わりの、やわらかい合図）
export function wobble(el) {
  if (!el || !el.animate) return;
  el.animate(
    [{ rotate: '0deg' }, { rotate: '-6deg' }, { rotate: '5deg' }, { rotate: '-3deg' }, { rotate: '0deg' }],
    { duration: 800, easing: 'ease-in-out' },
  );
}

// お花や星がふわっと出る
export function cheer(layer, at, opts = {}) {
  const { x, y } = pointOf(at);
  const lr = layer.getBoundingClientRect();
  const n = opts.count || 5;
  const colors = opts.colors || [P.pink, P.yellow, P.sky, P.orange, P.grass];
  for (let i = 0; i < n; i++) {
    const kind = i % 2 ? sparkle(colors[i % colors.length], 28) : flower(colors[i % colors.length], 34);
    const p = h('div', { class: 'cheer-bit' }, [kind]);
    p.style.left = (x - lr.left - 17) + 'px';
    p.style.top = (y - lr.top - 17) + 'px';
    layer.appendChild(p);
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    const dist = (opts.spread || 70) + Math.random() * 30;
    const dx = Math.cos(a) * dist; const dy = Math.sin(a) * dist - 20;
    if (reduce() || !p.animate) { setTimeout(() => p.remove(), 900); continue; }
    p.animate(
      [
        { transform: 'translate(0,0) scale(0.3)', opacity: 0 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy - 20}px) scale(0.9)`, opacity: 0 },
      ],
      { duration: 1400, easing: 'ease-out' },
    ).onfinish = () => p.remove();
  }
}

// 名前の吹き出し。英語オンなら「いぬ／ドッグ／dog」の3段
let lastBubble = null;
export function bubble(layer, at, key, opts = {}) {
  const w = word(key);
  const en = getSettings().english && w.en;
  if (lastBubble) lastBubble.remove();
  const b = h('div', { class: 'bubble', 'data-word': key }, [
    h('div', { class: 'bubble-ja', text: opts.text || w.ja }),
    en && w.kana ? h('div', { class: 'bubble-kana', text: w.kana }) : null,
    en ? h('div', { class: 'bubble-en', text: w.en }) : null,
  ]);
  layer.appendChild(b);
  lastBubble = b;
  const { x, y } = pointOf(at);
  const lr = layer.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  let left = x - lr.left - br.width / 2;
  let top = y - lr.top - br.height - (opts.gap ?? 56);
  if (top < 8) top = y - lr.top + (opts.gap ?? 56);
  left = Math.max(8, Math.min(lr.width - br.width - 8, left));
  top = Math.max(8, Math.min(lr.height - br.height - 8, top));
  b.style.left = left + 'px';
  b.style.top = top + 'px';
  b.classList.add('show');
  setTimeout(() => { b.classList.remove('show'); setTimeout(() => b.remove(), 500); }, opts.ms || 2600);
  return b;
}
