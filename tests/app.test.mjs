// アプリ全体の自動確認：ホーム、画面の行き来、保護者設定、オフライン、外部通信、色コード
import fs from 'node:fs';
import path from 'node:path';
import { open, serve, ROOT, tap, shot, sleep, check, finish } from './helpers.mjs';

const IDS = ['colors', 'shapes', 'sizes', 'lengths', 'peekaboo', 'drawing', 'candles'];

// ── 色コードは palette.js だけ ──
console.log('色コード');
const bad = [];
const walk = (d) => fs.readdirSync(d).forEach((f) => {
  const p = path.join(d, f);
  if (fs.statSync(p).isDirectory()) return walk(p);
  if (!/\.(js|css)$/.test(f) || f === 'palette.js') return;
  fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
    if (/#[0-9A-Fa-f]{3,8}\b|rgba?\(/.test(line.replace(/url\(#[\w-]+\)/g, ''))) bad.push(`${path.relative(ROOT, p)}:${i + 1}`);
  });
});
walk(path.join(ROOT, 'src'));
check(bad.length === 0, 'palette.js 以外に色コードがない ' + bad.join(', '));

// ── 外部への参照がない ──
const ext = [];
const walk2 = (d) => fs.readdirSync(d).forEach((f) => {
  const p = path.join(d, f);
  if (fs.statSync(p).isDirectory()) return walk2(p);
  if (!/\.(js|css|html)$/.test(f)) return;
  const t = fs.readFileSync(p, 'utf8');
  if (/https?:\/\/(?!www\.w3\.org)/.test(t)) ext.push(path.relative(ROOT, p));
});
walk2(path.join(ROOT, 'src'));
check(ext.length === 0, 'コードに外部URLがない ' + ext.join(', '));

const server = await serve();
for (const device of ['iphone', 'fire']) {
  console.log(`全体 ${device}`);
  const t = await open(device, { server });
  const { page } = t;
  await page.goto(t.url);
  await page.waitForSelector('.game-btn');
  check(await page.locator('.game-btn').count() === 7, 'ホームに7つの遊び');
  await shot(page, `home-${device}`);

  // ボタンがはみ出していない・64px以上
  const boxes = await page.locator('.game-btn').evaluateAll((els) => els.map((e) => ({ ...e.getBoundingClientRect().toJSON(), vw: innerWidth })));
  check(boxes.every((b) => b.width >= 64 && b.height >= 64 && b.left >= 0 && b.right <= b.vw), 'ボタンの大きさと位置');

  // 各遊びを開いて、おうちで戻る
  for (const id of IDS) {
    await tap(page, `.game-btn[data-game="${id}"]`);
    await page.waitForSelector(`[data-stage="${id}"]`);
    await sleep(1500);
    await shot(page, `game-${id}-${device}`);
    await tap(page, '[data-home]');
    await page.waitForSelector('.game-btn');
  }
  check(true, '7つの遊びを開いて、おうちで戻れる');

  // 保護者設定: 短いタップでは開かない
  await tap(page, '[data-hold]');
  await sleep(600);
  check(await page.locator('[data-panel]').count() === 0, '短いタップでは保護者設定が開かない');
  // 1.5秒で離しても開かない
  const hb = await page.locator('[data-hold]').boundingBox();
  await page.mouse.move(hb.x + 28, hb.y + 28);
  await page.mouse.down(); await sleep(1500); await page.mouse.up();
  await sleep(300);
  check(await page.locator('[data-panel]').count() === 0, '1.5秒では開かない');
  // 3秒長押しで開く
  await page.mouse.down(); await sleep(3300); await page.mouse.up();
  await page.waitForSelector('[data-panel]', { timeout: 2000 }).catch(() => {});
  check(await page.locator('[data-panel]').count() === 1, '3秒長押しで開く');
  await shot(page, `panel-${device}`);

  // 設定を変える
  await page.click('[data-setting="english"] button[data-value="true"]');
  await page.click('[data-setting="hidden"] button[data-value="candles"]');
  await page.click('[data-setting="level"] button[data-value="2"]');
  await page.click('[data-guide]');
  await sleep(300);
  await shot(page, `guide-${device}`);
  check(await page.locator('.guide h3').count() >= 3, '「保護者の方へ」ページが出る');
  await page.click('.panel .close');
  await page.click('[data-close]');
  await page.waitForSelector('.game-btn');
  check(await page.locator('.game-btn').count() === 6, '非表示にした遊びが消える');

  // 再起動しても残る
  await page.reload();
  await page.waitForSelector('.game-btn');
  check(await page.locator('.game-btn').count() === 6, '再起動後も設定が残る');
  await tap(page, '.game-btn[data-game="colors"]');
  await sleep(1200);
  check(await page.locator('[data-stage="colors"]').getAttribute('data-level') === '2', 'レベル固定が効く');
  // 英語オンで吹き出しが3段
  const it = page.locator('[data-item]').first();
  const c = await it.getAttribute('data-color');
  const ib = await it.boundingBox(); const bb = await page.locator(`[data-basket="${c}"]`).boundingBox();
  await page.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2); await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(ib.x + ib.width / 2 + (bb.x + bb.width / 2 - ib.x - ib.width / 2) * i / 10, ib.y + ib.height / 2 + (bb.y + bb.height / 2 - ib.y - ib.height / 2) * i / 10);
  await page.mouse.up();
  await sleep(500);
  check(await page.locator('.bubble .bubble-en').count() === 1, '英語オンで吹き出しに英語が出る');
  await shot(page, `english-${device}`);

  check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
  check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
  await t.close();
}

// ── おしまいの合図 ──
{
  console.log('おしまいの合図');
  const t = await open('iphone', { server });
  await t.page.addInitScript(() => localStorage.setItem('crayon-no-mori:settings:v1', JSON.stringify({ bedtime: 0.02 })));
  await t.page.goto(t.url + '#/colors');
  await sleep(2500);
  check(await t.page.locator('[data-bedtime]').count() === 1, '時間になると「おやすみ」が出る');
  await shot(t.page, 'bedtime');
  await t.close();
}

// ── オフライン ──
{
  console.log('オフライン');
  const t = await open('fire', { server, sw: true });
  const { page } = t;
  await page.goto(t.url);
  await page.waitForSelector('.game-btn');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await sleep(1500);
  await t.context.setOffline(true);
  await page.reload();
  await page.waitForSelector('.game-btn', { timeout: 5000 }).catch(() => {});
  check(await page.locator('.game-btn').count() === 7, 'オフラインで起動できる');
  for (const id of IDS) {
    await page.goto(t.url + '#/' + id);
    await page.waitForSelector(`[data-stage="${id}"]`, { timeout: 4000 }).catch(() => {});
    await sleep(600);
    const ok = await page.locator(`[data-stage="${id}"] *`).count();
    check(ok > 0, `オフラインで ${id} が動く`);
  }
  check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
  await t.close();
}

server.srv.close();
finish();
