// ⑦ ろうそく ふーっ の自動確認
import { open, openGame, tap, shot, sleep, check, finish, doneCount } from './helpers.mjs';

for (const device of ['iphone', 'fire']) {
  console.log(`ろうそく ${device}`);
  const t = await open(device);
  const { page } = t;
  await openGame(t, 'candles');
  await sleep(900);
  const animal = await page.locator('[data-animal]').getAttribute('data-animal');
  check(await page.locator('[data-cake]').count() === 1, 'ケーキがある ' + animal);

  for (let i = 1; i <= 5; i++) {
    await tap(page, '[data-cake]');
    await sleep(500);
    check(await page.locator('[data-candle]').count() === i, `ろうそく${i}本`);
    if (i === 3 && device === 'iphone') await shot(page, 'candles-iphone-3');
  }
  check(await page.locator('.bubble').count() >= 1, '数える吹き出し');
  await tap(page, '[data-cake]');
  await sleep(400);
  check(await page.locator('[data-candle]').count() === 5, '6回目でも増えない');
  check(await page.locator('[data-flame]').count() === 5, '炎5つ');
  if (device === 'fire') await shot(page, 'candles-fire-5');

  for (let i = 0; i < 5; i++) {
    await tap(page, '[data-flame]');
    await sleep(350);
  }
  check(await page.locator('[data-flame]').count() === 0, '全部消えた');
  await sleep(1500);
  check(await doneCount(page) === 1, 'done が増える');
  await sleep(6500);
  check(await page.locator('[data-candle]').count() === 0 && await page.locator('[data-cake]').count() === 1, '次のケーキになる');
  const next = await page.locator('[data-animal]').getAttribute('data-animal');
  check(next !== animal, '次の動物 ' + next);
  check(await page.locator('[data-again]').count() === 0, 'もういっかいボタンなし');
  check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
  check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
  await t.close();
}
finish();
