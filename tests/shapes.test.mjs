// ② かたちあわせ の自動確認
import { open, openGame, drag, tap, shot, sleep, check, finish, doneCount } from './helpers.mjs';

const N = { 1: 2, 2: 3, 3: 5 };
for (const device of ['iphone', 'fire']) {
  for (const level of [1, 2, 3]) {
    console.log(`かたちあわせ ${device} レベル${level}`);
    const t = await open(device);
    const { page } = t;
    await openGame(t, 'shapes', level);
    await sleep(1600);
    const n = await page.locator('[data-piece]').count();
    check(n === N[level] && await page.locator('[data-hole]').count() === n, `ピースと穴の数 ${n}`);
    // 大きさ64以上・重ならない・画面内
    const rects = await page.evaluate(() => [...document.querySelectorAll('[data-piece],[data-hole]')].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, e.hasAttribute('data-piece')]; }));
    const vw = await page.evaluate(() => innerWidth); const vh = await page.evaluate(() => innerHeight);
    check(rects.every((r) => r[2] >= 64 && r[3] >= 64 && r[0] >= 0 && r[1] >= 0 && r[0] + r[2] <= vw && r[1] + r[3] <= vh), '64px以上で画面に収まる');
    let overlap = false;
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]; const b = rects[j];
      if (a[0] < b[0] + b[2] - 1 && b[0] < a[0] + a[2] - 1 && a[1] < b[1] + b[3] - 1 && b[1] < a[1] + a[3] - 1) overlap = true;
    }
    check(!overlap, '重ならない');
    if (level === 3) await shot(page, `shapes-${device}-start`);

    // 違う穴では戻る
    const p0 = page.locator('[data-piece]').first();
    const shape = await p0.getAttribute('data-piece');
    const wrong = await page.locator(`[data-hole]:not([data-hole="${shape}"])`).first().getAttribute('data-hole');
    const before = await p0.boundingBox();
    await drag(page, `[data-piece="${shape}"]`, `[data-hole="${wrong}"]`);
    await sleep(1000);
    const after = await p0.boundingBox();
    check(Math.abs(before.x - after.x) < 2 && Math.abs(before.y - after.y) < 2, '違う穴では元の場所へ戻る');
    check(await p0.getAttribute('data-placed') === null, '違う穴ではまらない');

    const shapes = await page.locator('[data-piece]').evaluateAll((els) => els.map((e) => e.dataset.piece));
    for (let i = 0; i < shapes.length; i++) {
      await drag(page, `[data-piece="${shapes[i]}"]`, `[data-hole="${shapes[i]}"]`);
      await sleep(600);
      if (i === 0) check(await page.locator(`[data-piece="${shapes[i]}"][data-placed]`).count() === 1, 'はまると data-placed');
      if (i === 0 && level === 3) await shot(page, `shapes-${device}-fit`);
    }
    await sleep(6500);
    check(await doneCount(page) === 1, 'おかたづけまで進んで done になる');
    check(await page.locator('[data-again]').count() === 1, '「もういっかい」が出る');
    await tap(page, '[data-again]');
    await sleep(900);
    const n2 = await page.locator('[data-piece]').count();
    check(n2 === n && await page.locator('[data-piece][data-placed]').count() === 0, 'もういっかいで新しい回が始まる');
    check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
    check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
    await t.close();
  }
}
finish();
