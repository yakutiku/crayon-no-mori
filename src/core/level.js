// レベルの自動調整。同じレベルを3回最後までできたら、次に開いたときに1つ上がる
import { getSettings } from './settings.js';

const KEY = 'crayon-no-mori:levels:v1';
const NEED = 3;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function write(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* noop */ }
}

// 遊びを開くときに呼ぶ。今回のレベルを返す
export function levelFor(gameId) {
  const fixed = getSettings().level;
  if (fixed !== 'auto') return Number(fixed);
  const all = read();
  const st = all[gameId] || { level: 1, count: 0 };
  if (st.count >= NEED && st.level < 3) {
    st.level += 1;
    st.count = 0;
    all[gameId] = st;
    write(all);
  }
  return st.level;
}

// 最後まで遊べたときに呼ぶ
export function recordDone(gameId, level) {
  if (getSettings().level !== 'auto') return;
  const all = read();
  const st = all[gameId] || { level: 1, count: 0 };
  if (st.level === level) st.count += 1;
  all[gameId] = st;
  write(all);
}

export function resetLevels() { write({}); }
