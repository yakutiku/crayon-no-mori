// 全部の自動確認を順に実行する: node tests/all.mjs
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { ROOT } from './helpers.mjs';
const files = ['app', 'colors', 'shapes', 'sizes', 'lengths', 'peekaboo', 'drawing', 'candles'].filter((n) => fs.existsSync(path.join(ROOT, 'tests', n + '.test.mjs')));
let ng = 0;
for (const f of files) {
  process.stdout.write(`\n=== ${f} ===\n`);
  try { execFileSync('node', [path.join(ROOT, 'tests', f + '.test.mjs')], { stdio: 'inherit' }); } catch { ng += 1; }
}
console.log(ng ? `\n${ng} 個のファイルで NG` : '\n全部 ok');
process.exitCode = ng ? 1 : 0;
