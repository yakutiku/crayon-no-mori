// ⑥ おえかき の自動確認
import { open, openGame, drag, tap, shot, sleep, check, finish, doneCount, center } from './helpers.mjs';

const painted = (page) => page.evaluate(() => {
  const c = document.querySelector('[data-canvas]');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
});

for (const device of ['iphone', 'fire']) {
  console.log(`おえかき ${device}`);
  const t = await open(device);
  const { page } = t;
  await openGame(t, 'drawing');

  check(await page.locator('[data-crayon]').count() === 8, 'クレヨン8本');
  const sizes = await page.locator('[data-crayon]').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  check(sizes.every((v) => v >= 64), 'クレヨンは64px以上');
  check(await painted(page) === 0, '最初は白い紙');

  // クレヨンをタップ → 吹き出し
  await tap(page, '[data-crayon="blue"]');
  await sleep(500);
  check(await page.locator('.bubble').count() >= 1, 'クレヨンで吹き出し');
  if (device === 'iphone') await shot(page, 'drawing-iphone-paper');

  // しろいかみになぞる
  const a = await page.locator('[data-area]').boundingBox();
  await drag(page, { x: a.x + a.width * 0.25, y: a.y + a.height * 0.3 }, { x: a.x + a.width * 0.75, y: a.y + a.height * 0.6 }, 20);
  const n1 = await painted(page);
  check(n1 > 500, `線が描ける ${n1}`);
  await tap(page, '[data-new]');
  await sleep(200);
  check(await painted(page) === 0, 'あたらしいかみで消える');
  check(await doneCount(page) === 0, 'しろいかみでは done なし');

  // ぬりえ
  await tap(page, '[data-mode="coloring"]');
  await sleep(300);
  if (device === 'fire') await shot(page, 'drawing-fire-coloring');
  await tap(page, '[data-crayon="green"]');
  const r0 = page.locator('[data-region]').first();
  const before = await r0.getAttribute('fill');
  await tap(page, '[data-region="0"]');
  const after = await r0.getAttribute('fill');
  check(before !== after, '区画が塗れる');
  const green = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--green').trim());
  check(after.toLowerCase() === green.toLowerCase(), '選んだ色で塗れる ' + after);

  const sheet1 = await page.locator('[data-sheet]').getAttribute('data-sheet');
  await tap(page, '[data-next]');
  await sleep(200);
  const sheet2 = await page.locator('[data-sheet]').getAttribute('data-sheet');
  check(sheet1 !== sheet2, 'シート切替 ' + sheet1 + ' → ' + sheet2);
  await tap(page, '[data-prev]');
  await sleep(200);
  check(await page.locator('[data-sheet]').getAttribute('data-sheet') === sheet1, '前に戻る');
  check(await page.locator('[data-region]').first().getAttribute('data-filled') === null, 'シートを替えると新しい紙');

  // 全部の区画を塗る
  const nReg = await page.locator('[data-region]').count();
  for (let i = 0; i < nReg; i++) {
    const c = await center(page, `[data-region="${i}"]`);
    // 区画の中心が他の区画に隠れていることがあるので、要素そのものにイベントを送る
    await page.locator(`[data-region="${i}"]`).dispatchEvent('click');
  }
  await sleep(900);
  check(await doneCount(page) === 1, `1枚ぜんぶ塗ると done（区画${nReg}）`);
  if (device === 'iphone') await shot(page, 'drawing-iphone-done');
  await tap(page, '[data-new]');
  await sleep(200);
  check(await page.locator('[data-filled]').count() === 0, 'ぬりえもあたらしいかみで消える');

  check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
  check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
  await t.close();
}
finish();
