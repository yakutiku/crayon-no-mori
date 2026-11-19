// ⑤ いないいないばあ の自動確認
import { open, openGame, tap, shot, sleep, check, finish, doneCount } from './helpers.mjs';

const SCENES = { mori: ['bear', 'squirrel', 'cat', 'frog'], harappa: ['dog', 'rabbit', 'pig', 'elephant'], umi: ['fish', 'turtle', 'octopus', 'bird'] };

// いま景色にいて、まだタップしていない動物が顔を出すのを待ってタップ。タップしたキーを返す
async function tapAny(page, keys, done, ms = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    for (const k of keys) {
      if (done.has(k)) continue;
      if (await page.locator(`[data-animal="${k}"][data-state="peek"]`).count()) {
        await sleep(300);
        if (!await page.locator(`[data-animal="${k}"][data-state="peek"]`).count()) continue;
        await tap(page, `[data-animal="${k}"]`);
        return k;
      }
    }
    await sleep(120);
  }
  return null;
}

for (const device of (process.env.DEV ? [process.env.DEV] : ['iphone', 'fire'])) {
  console.log(`いないいないばあ ${device}`);
  const t = await open(device);
  const { page } = t;
  await openGame(t, 'peekaboo');
  check(await page.locator('[data-scene="mori"]').count() === 1, 'はじめは もり');
  check(await page.locator('[data-next]').count() === 1 && await page.locator('[data-prev]').count() === 1, '矢印がある');
  const ab = await page.locator('[data-next]').boundingBox();
  check(ab.width >= 64 && ab.height >= 64, `矢印の大きさ ${ab.width}x${ab.height}`);

  // 景色の切り替え
  await tap(page, '[data-next]'); await sleep(300);
  check(await page.locator('[data-scene="harappa"]').count() === 1, 'つぎで はらっぱ');
  await tap(page, '[data-next]'); await sleep(300);
  check(await page.locator('[data-scene="umi"]').count() === 1, 'つぎで うみ');
  await tap(page, '[data-next]'); await sleep(300);
  check(await page.locator('[data-scene="mori"]').count() === 1, 'つぎで もり にもどる');
  await tap(page, '[data-prev]'); await sleep(300);
  check(await page.locator('[data-scene="umi"]').count() === 1, 'まえで うみ');
  for (const [name, keys] of Object.entries(SCENES)) {
    // 各景色の動物がそろっている
    while (await page.locator(`[data-scene="${name}"]`).count() === 0) { await tap(page, '[data-next]'); await sleep(300); }
    for (const k of keys) check(await page.locator(`[data-animal="${k}"]`).count() === 1, `${name}: ${k} がいる`);
  }

  // もり：4匹すべてタップ → 吹き出し → done
  while (await page.locator('[data-scene="mori"]').count() === 0) { await tap(page, '[data-next]'); await sleep(300); }
  const t0 = Date.now();
  while (Date.now() - t0 < 12000 && !await page.locator('[data-out="1"]').count()) await sleep(100);
  check(await page.locator('[data-out="1"]').count() > 0, `最初の動物が出る ${Date.now() - t0}ms`);
  const seen = new Set();
  for (let i = 0; i < 4; i++) {
    const k = await tapAny(page, SCENES.mori, seen);
    check(!!k, `もりの動物をタップできた ${k}`);
    if (!k) break;
    seen.add(k);
    await sleep(400);
    check(await page.locator(`.bubble[data-word="${k}"]`).count() === 1, `${k} の吹き出し`);
    if (i === 0 && device === 'iphone') await shot(page, 'peekaboo-iphone-pop');
    if (i < 3) await sleep(1500);
  }
  check(await doneCount(page) === 0, 'おかたづけの前は done でない');
  await sleep(7500);
  if (device === 'fire') await shot(page, 'peekaboo-fire-done');
  check(await doneCount(page) === 1, 'もり4匹で done');

  // はらっぱ・うみもタップして動く（エラーなし）
  for (const name of ['harappa', 'umi']) {
    await tap(page, '[data-next]'); await sleep(800);
    const seen2 = new Set();
    for (let i = 0; i < 4; i++) {
      const k = await tapAny(page, SCENES[name], seen2);
      check(!!k, `${name} の動物をタップできた ${k}`);
      if (!k) break;
      seen2.add(k);
      await sleep(400);
      check(await page.locator(`.bubble[data-word="${k}"]`).count() === 1, `${k} の吹き出し`);
      if (i < 3) await sleep(1500);
    }
    await sleep(7500);
    check(await doneCount(page) === (name === 'harappa' ? 2 : 3), `${name} 4匹で done`);
  }
  check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
  check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
  await t.close();
}
finish();
