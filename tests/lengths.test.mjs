// ④ ながい・みじかい の自動確認
import { open, openGame, drag, tap, shot, sleep, check, finish, doneCount } from './helpers.mjs';

const N = { 1: 2, 2: 3, 3: 5 };
for (const device of ['iphone', 'fire']) {
  for (const level of [1, 2, 3]) {
    console.log(`ながい・みじかい ${device} レベル${level}`);
    const t = await open(device);
    const { page } = t;
    await openGame(t, 'lengths', level);
    await sleep(1600);
    const n = N[level];
    check(await page.locator('[data-crayon]').count() === n && await page.locator('[data-slot]').count() === n, `クレヨンとくぼみの数 ${n}`);
    const rects = await page.evaluate(() => [...document.querySelectorAll('[data-crayon],[data-slot]')].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, e.hasAttribute('data-crayon')]; }));
    const vw = await page.evaluate(() => innerWidth); const vh = await page.evaluate(() => innerHeight);
    check(rects.every((r) => r[2] >= 64 && r[3] >= 64 && r[0] >= 0 && r[1] >= 0 && r[0] + r[2] <= vw && r[1] + r[3] <= vh), '64px以上で画面に収まる');
    let overlap = false;
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]; const b = rects[j];
      if (a[4] !== b[4] && false) continue;
      if (a[0] < b[0] + b[2] - 1 && b[0] < a[0] + a[2] - 1 && a[1] < b[1] + b[3] - 1 && b[1] < a[1] + a[3] - 1) overlap = true;
    }
    check(!overlap, '重ならない');
    // くぼみは上から長い順
    const sl = await page.evaluate((m) => Array.from({ length: m }, (_, k) => { const r = document.querySelector(`[data-slot="${k}"]`).getBoundingClientRect(); return [r.top, r.width]; }), n);
    check(sl.every((v, k) => k === 0 || (v[0] < sl[k - 1][0] && v[1] > sl[k - 1][1])), 'くぼみは上から長い順');
    await shot(page, `lengths-${device}-start-${level}`);

    // 違う長さのくぼみでは戻る
    const wrongSlot = n - 1;
    const before = await page.locator('[data-crayon="0"]').boundingBox();
    await drag(page, '[data-crayon="0"]', `[data-slot="${wrongSlot}"]`);
    await sleep(1000);
    const after = await page.locator('[data-crayon="0"]').boundingBox();
    check(Math.abs(before.x - after.x) < 2 && Math.abs(before.y - after.y) < 2, '違う長さのくぼみでは元の場所へ戻る');
    check(await page.locator('[data-crayon="0"][data-placed]').count() === 0, 'はまらない');

    for (let k = 0; k < n; k++) {
      await drag(page, `[data-crayon="${k}"]`, `[data-slot="${k}"]`);
      await sleep(600);
      check(await page.locator(`[data-crayon="${k}"][data-placed]`).count() === 1, `クレヨン${k}が入る`);
      if (k === 0) check(await page.locator('[data-word="short"]').count() === 1, 'みじかい の吹き出し');
      if (k === n - 1) check(await page.locator('[data-word="long"]').count() === 1, 'ながい の吹き出し');
      if (k === n - 1 && level === 3) await shot(page, `lengths-${device}-full`);
    }
    await sleep(2800);
    check(await page.locator('[data-ladybug]').count() === 1, 'てんとう虫が出る');
    await sleep(11000);
    check(await page.locator('[data-lid]').count() === 1, 'ふたが閉まる');
    check(await doneCount(page) === 1, 'done になる');
    check(await page.locator('[data-again]').count() === 1, '「もういっかい」が出る');
    await tap(page, '[data-again]');
    await sleep(900);
    check(await page.locator('[data-crayon]:not([data-placed])').count() === n, 'もういっかいで新しい回が始まる');
    check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
    check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
    await t.close();
  }
}
finish();
