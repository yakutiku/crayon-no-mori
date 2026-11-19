// 公開されるファイルの合計サイズと、大きい順の上位10件を表示する開発用スクリプト。
// 対象: index.html, manifest.webmanifest, sw.js, icons/**, src/**（tests/ と tools/ は除外）
// 使い方: node tools/size.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SINGLE_FILES = ['index.html', 'manifest.webmanifest', 'sw.js'];
const DIRS = ['icons', 'src'];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

const files = [];
for (const f of SINGLE_FILES) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) files.push(p);
  else console.log(`(見つからないためスキップ: ${f})`);
}
for (const d of DIRS) {
  const p = path.join(ROOT, d);
  if (fs.existsSync(p)) files.push(...walk(p));
}

const rows = files
  .map((p) => ({ rel: path.relative(ROOT, p), bytes: fs.statSync(p).size }))
  .sort((a, b) => b.bytes - a.bytes);

const total = rows.reduce((s, r) => s + r.bytes, 0);
console.log(`公開ファイル: ${rows.length} 個`);
console.log(`合計: ${(total / 1024).toFixed(1)} KB (${total} bytes)`);
console.log('');
console.log('大きい順 上位10件:');
for (const r of rows.slice(0, 10)) {
  console.log(`  ${(r.bytes / 1024).toFixed(1).padStart(8)} KB  ${r.rel}`);
}
