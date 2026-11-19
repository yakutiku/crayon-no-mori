// ③ おおきい・ちいさい の自動確認
import { open, openGame, drag, tap, shot, sleep, check, finish, doneCount } from './helpers.mjs';

async function layoutOk(page, sel, what) {
  const rects = await page.evaluate((q) => [...document.querySelectorAll(q)].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }), sel);
  const vw = await page.evaluate(() => innerWidth); const vh = await page.evaluate(() => innerHeight);
  check(rects.every((r) => r[2] >= 64 && r[3] >= 64 && r[0] >= 0 && r[1] >= 0 && r[0] + r[2] <= vw && r[1] + r[3] <= vh), `${what}は64px以上で画面に収まる`);
  let overlap = false;
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i]; const b = rects[j];
    if (a[0] < b[0] + b[2] - 1 && b[0] < a[0] + a[2] - 1 && a[1] < b[1] + b[3] - 1 && b[1] < a[1] + a[3] - 1) overlap = true;
  }
  check(!overlap, `${what}は重ならない`);
}

for (const device of ['iphone', 'fire']) {
  for (const level of [1, 2, 3]) {
    console.log(`おおきい・ちいさい ${device} レベル${level}`);
    const t = await open(device);
    const { page } = t;
    await openGame(t, 'sizes', level);
    await sleep(1600);

    if (level === 1) {
      await layoutOk(page, '[data-bear],[data-bed]', 'くまとベッド');
      await shot(page, `sizes-${device}-start`);
      const p0 = page.locator('[data-bear="big"]');
      const before = await p0.boundingBox();
      await drag(page, '[data-bear="big"]', '[data-bed="small"]');
      await sleep(1000);
      const after = await p0.boundingBox();
      check(Math.abs(before.x - after.x) < 2 && Math.abs(before.y - after.y) < 2, 'おおきいくまは小さいベッドから戻る');
      check(await p0.getAttribute('data-placed') === null, '入らない');
      for (const sz of ['big', 'small']) {
        await drag(page, `[data-bear="${sz}"]`, `[data-bed="${sz}"]`);
        await sleep(700);
        check(await page.locator(`[data-bear="${sz}"][data-placed]`).count() === 1, `${sz} が入る`);
        check(await page.locator(`[data-word="${sz}"]`).count() === 1, `${sz} の吹き出し`);
      }
    } else {
      const n = level === 2 ? 3 : 5;
      check(await page.locator('[data-block]').count() === n, `ブロックの数 ${n}`);
      await layoutOk(page, '[data-block],[data-slot]', 'ブロックと台');
      await shot(page, `sizes-${device}-start`);
      // 一番大きくないものを先に置くと戻る
      const p0 = page.locator('[data-block="0"]');
      const before = await p0.boundingBox();
      await drag(page, '[data-block="0"]', '[data-slot]');
      await sleep(1000);
      const after = await p0.boundingBox();
      check(Math.abs(before.x - after.x) < 2 && Math.abs(before.y - after.y) < 2, '小さいブロックを先に置くと戻る');
      check(await p0.getAttribute('data-placed') === null, '積まれない');
      for (let r = n - 1; r >= 0; r--) {
        await drag(page, `[data-block="${r}"]`, '[data-slot]');
        await sleep(900);
        check(await page.locator(`[data-block="${r}"][data-placed]`).count() === 1, `ブロック${r}が積まれる`);
      }
      // 積んだ順に下から並ぶ
      const ys = await page.evaluate((n) => Array.from({ length: n }, (_, i) => document.querySelector(`[data-block="${i}"]`).getBoundingClientRect().top), n);
      check(ys.every((y, i) => i === 0 || y > ys[i - 1]), '大きいものが下、小さいものが上');
    }
    await sleep(500);
    if (level === 3) await shot(page, `sizes-${device}-done`);
    await sleep(6500);
    check(await page.locator('[data-bird]').count() === 1, '小鳥がとまる');
    check(await doneCount(page) === 1, 'done になる');
    check(await page.locator('[data-again]').count() === 1, '「もういっかい」が出る');
    await tap(page, '[data-again]');
    await sleep(900);
    check(await page.locator('[data-bear]:not([data-placed]),[data-block]:not([data-placed])').count() === (level === 1 ? 2 : (level === 2 ? 3 : 5)), 'もういっかいで新しい回が始まる');
    check(t.errors.length === 0, 'エラーなし ' + t.errors.join(' | '));
    check(t.external.length === 0, '外部通信なし ' + t.external.join(' | '));
    await t.close();
  }
}
finish();
