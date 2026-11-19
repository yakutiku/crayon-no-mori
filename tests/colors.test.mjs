// ① いろあわせ の自動確認
import { open, openGame, drag, tap, shot, sleep, check, finish, doneCount } from './helpers.mjs';

for (const device of ['iphone', 'fire']) {
  for (const level of [1, 2, 3]) {
    console.log(`いろあわせ ${device} レベル${level}`);
    const t = await open(device);
    const { page } = t;
    await openGame(t, 'colors', level);
    await sleep(1200);
    const n = await page.locator('[data-item]').count();
    check(n === { 1: 4, 2: 6, 3: 8 }[level], `ものの数 ${n}`);
    const baskets = await page.locator('[data-basket]').count();
    check(baskets === level + 1, `かごの数 ${baskets}`);
    if (level === 1) await shot(page, `colors-${device}-start`);

    // 違うかごに置くと、元に戻る
    const first = page.locator('[data-item]').first();
    const color = await first.getAttribute('data-color');
    const wrong = await page.locator(`[data-basket]:not([data-basket="${color}"])`).first().getAttribute('data-basket');
    const before = await first.boundingBox();
    await drag(page, '[data-item] >> nth=0', `[data-basket="${wrong}"]`);
    await sleep(900);
    const after = await first.boundingBox();
    check(Math.abs(before.x - after.x) < 2 && Math.abs(before.y - after.y) < 2, '違うかごでは元の場所へ戻る');
    check(await first.getAttribute('data-placed') === null, '違うかごでは入らない');

    // 全部正しいかごへ
    for (let i = 0; i < n; i++) {
      const it = page.locator('[data-item]:not([data-placed])').first();
      const c = await it.getAttribute('data-color');
      const k = await it.getAttribute('data-item');
      await drag(page, `[data-item="${k}"][data-color="${c}"]:not([data-placed])`, `[data-basket="${c}"]`);
      await sleep(450);
      if (i === 0 && level === 1) await shot(page, `colors-${device}-bubble`);
    }
    await sleep(5000);
    check(await doneCount(page) === 1, 'おかたづけまで進んで done になる');
    check(await page.locator('[data-again]').count() === 1, '「もういっかい」が出る');
    if (level === 3) await shot(page, `colors-${device}-done`);
    await tap(page, '[data-again]');
    await sleep(800);
    check(await page.locator('[data-item]').count() === n, 'もういっかいで新しい回が始まる');
    check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
    check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
    await t.close();
  }
}
finish();
