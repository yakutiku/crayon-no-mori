// sw.js のファイル一覧とバージョンを、今のファイルから作り直す（公開前に毎回実行）
// 使い方: node tools/update-sw.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const list = ['./', './index.html', './manifest.webmanifest'];
const walk = (dir) => {
  for (const f of fs.readdirSync(path.join(ROOT, dir)).sort()) {
    const rel = path.posix.join(dir, f);
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel);
    else if (/\.(js|css|png|svg)$/.test(f)) list.push('./' + rel);
  }
};
walk('src');
walk('icons');

const hash = crypto.createHash('sha256');
for (const f of list.slice(1)) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) hash.update(f).update(fs.readFileSync(p));
}
const version = 'v-' + hash.digest('hex').slice(0, 10);

const swPath = path.join(ROOT, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
sw = sw.replace(/\/\/ FILES-START[\s\S]*?\/\/ FILES-END/, '// FILES-START\n' + list.map((f) => `  '${f}',`).join('\n') + '\n  // FILES-END');
fs.writeFileSync(swPath, sw);
console.log(`sw.js: ${list.length} files, ${version}`);
