// 重さの確認：処理速度を1/4に落として（Fire HD 10 の代わり）、動きの滑らかさを測る
import { open, openGame, sleep, check, finish, center } from './helpers.mjs';

async function fps(page, ms, during) {
  await page.evaluate(() => { window.__frames = []; const f = (t) => { window.__frames.push(t); window.__raf = requestAnimationFrame(f); }; window.__raf = requestAnimationFrame(f); });
  await during();
  await sleep(ms);
  return page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    const fr = window.__frames; const gaps = fr.slice(1).map((t, i) => t - fr[i]);
    gaps.sort((a, b) => a - b);
    return { fps: Math.round((fr.length - 1) / ((fr[fr.length - 1] - fr[0]) / 1000)), p95: Math.round(gaps[Math.floor(gaps.length * 0.95)] || 0) };
  });
}

const t = await open('fire');
const cdp = await t.context.newCDPSession(t.page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

for (const id of ['colors', 'shapes', 'sizes', 'lengths', 'peekaboo', 'drawing', 'candles']) {
  await openGame(t, id, 3);
  await sleep(1500);
  const r = await fps(t.page, 2500, async () => {
    // 画面の中央付近をゆっくりなぞる（ドラッグできるものがあれば運ぶ）
    const sel = await t.page.locator('.draggable').count() ? '.draggable >> nth=0' : `[data-stage="${id}"]`;
    const a = await center(t.page, sel);
    await t.page.mouse.move(a.x, a.y); await t.page.mouse.down();
    for (let i = 0; i < 30; i++) { await t.page.mouse.move(a.x + i * 6, a.y - i * 3); await sleep(16); }
    await t.page.mouse.up();
  });
  check(r.fps >= 30 && r.p95 <= 70, `${id}: ${r.fps}fps（95%の間隔 ${r.p95}ms）`);
}
check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
await t.close();
finish();
