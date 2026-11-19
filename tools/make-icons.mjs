// アイコン（PNG・SVG）を書き出す開発用スクリプト。公開アプリの一部ではない。
// 使い方: node tools/make-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// playwright は開発環境に入っているものを使う
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ICONS = path.join(ROOT, 'icons');
const PALETTE_FILE = path.join(ROOT, 'src', 'core', 'palette.js');

// 色は src/core/palette.js の P から読む（色コードをこのファイルに書き写さない）
function loadPalette() {
  const src = fs.readFileSync(PALETTE_FILE, 'utf8');
  const block = src.match(/export const P = \{([\s\S]*?)\n\};/);
  if (!block) throw new Error('palette.js から P を読めませんでした');
  const P = {};
  for (const m of block[1].matchAll(/(\w+):\s*'(#[0-9A-Fa-f]{6})'/g)) P[m[1]] = m[2];
  return P;
}

// 絵（512×512 の座標系）。木と、手前に斜めに置いた3本のクレヨン
function artwork(P) {
  const ink = P.brown;
  const sw = 14;
  // クレヨン: 先端を原点、体は +y 方向。center に置き、deg で傾ける
  const crayon = (color, cx, cy, deg) => `
    <g transform="translate(${cx} ${cy}) rotate(${deg}) translate(0 -105)" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -24 56 L 0 0 L 24 56 Z" fill="${color}"/>
      <rect x="-24" y="56" width="48" height="154" rx="6" fill="${color}"/>
      <rect x="-24" y="92" width="48" height="84" fill="${P.white}"/>
    </g>`;
  // 中心を少し下げて、全体が上下中央に来るようにする
  return `
  <g transform="translate(0 17)">
    <ellipse cx="256" cy="392" rx="172" ry="26" fill="${P.grassDeep}" stroke="${ink}" stroke-width="${sw}"/>
    <rect x="236" y="262" width="40" height="130" rx="8" fill="${P.woodDark}" stroke="${ink}" stroke-width="${sw}"/>
    <circle cx="256" cy="180" r="120" fill="${P.grass}" stroke="${ink}" stroke-width="${sw}"/>
    ${crayon(P.blue, 285.6, 304.9, -25)}
    ${crayon(P.red, 249.6, 332.5, -50)}
    ${crayon(P.yellow, 228.6, 372, -75)}
  </g>`;
}

// size 四方の SVG。rounded で角丸（透過）、false で全面塗り
function svgDoc(P, size, { rounded, maskable }) {
  const bg = `<rect width="512" height="512"${rounded ? ' rx="112"' : ''} fill="${P.paper}"/>`;
  const art = artwork(P);
  const inner = maskable
    ? `<g transform="translate(256 256) scale(0.8) translate(-256 -256)">${art}</g>`
    : art;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">${bg}${inner}</svg>`;
}

async function renderPng(browser, P, size, file, opts) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const svg = svgDoc(P, size, opts);
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>${svg}</body></html>`);
  await page.screenshot({
    path: path.join(ICONS, file),
    omitBackground: !!opts.rounded, // 角丸の外側だけ透過させる。それ以外は全面塗り
    clip: { x: 0, y: 0, width: size, height: size },
  });
  await page.close();
  console.log(`${file} (${size}x${size})`);
}

async function main() {
  const P = loadPalette();
  fs.mkdirSync(ICONS, { recursive: true });

  // 元の SVG（角丸版）を保存
  fs.writeFileSync(path.join(ICONS, 'icon.svg'), svgDoc(P, 512, { rounded: true }) + '\n');
  console.log('icon.svg');

  const browser = await chromium.launch();
  try {
    await renderPng(browser, P, 192, 'icon-192.png', { rounded: true });
    await renderPng(browser, P, 512, 'icon-512.png', { rounded: true });
    await renderPng(browser, P, 512, 'icon-maskable-512.png', { rounded: false, maskable: true });
    await renderPng(browser, P, 180, 'apple-touch-icon.png', { rounded: false });
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
