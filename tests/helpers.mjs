// 自動の動作確認のための共通部品（公開はしない・開発環境だけで使う）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// playwright は開発環境に入っているものを使う（require なら全体のインストール先も探せる）
const { chromium } = createRequire(import.meta.url)('playwright');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SHOTS = path.join(ROOT, 'tests', 'shots');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };

// 小さな静的サーバー（localhost）
export function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, url: `http://localhost:${srv.address().port}/` }));
  });
}

export const DEVICES = {
  iphone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
  fire: { viewport: { width: 1280, height: 800 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
};

// ブラウザを開いて、エラーと外部通信を記録する
export async function open(device = 'iphone', opts = {}) {
  const server = opts.server || await serve();
  const browser = opts.browser || await chromium.launch();
  const context = await browser.newContext({ ...DEVICES[device], serviceWorkers: opts.sw ? 'allow' : 'block' });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!r.url().startsWith(server.url) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  return {
    server, browser, context, page, errors, external, url: server.url,
    async close() { await context.close(); if (!opts.browser) await browser.close(); if (!opts.server) server.srv.close(); },
  };
}

// 中心の座標
export async function center(page, selector) {
  const b = await page.locator(selector).first().boundingBox();
  if (!b) throw new Error('not found: ' + selector);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

// 指でゆっくり運ぶ（Pointer Events が出る）
export async function drag(page, from, to, steps = 12) {
  const a = typeof from === 'string' ? await center(page, from) : from;
  const b = typeof to === 'string' ? await center(page, to) : to;
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps);
  await page.mouse.up();
}

export async function tap(page, selector) {
  const c = await center(page, selector);
  await page.mouse.click(c.x, c.y);
}

export async function shot(page, name) {
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 確認結果の表示
let fails = 0;
export function check(cond, msg) {
  if (cond) console.log('  ok  ' + msg);
  else { fails += 1; console.log('  NG  ' + msg); }
}
export function finish() {
  if (fails) { console.log(`\n${fails} 件 NG`); process.exitCode = 1; } else console.log('\nすべて ok');
}

// 遊びを開く
export async function openGame(t, id, level) {
  await t.page.goto(t.url + '#/' + id + (level ? '?level=' + level : ''));
  await t.page.waitForSelector(`[data-stage="${id}"]`);
  await sleep(400);
}

export async function doneCount(page) {
  return Number(await page.evaluate(() => document.body.dataset.doneCount || 0));
}
