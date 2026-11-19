// 保護者設定の保存と読み込み（端末内の localStorage のみ）
const KEY = 'crayon-no-mori:settings:v1';

export const DEFAULTS = {
  sound: 'none',        // 'none' | 'sfx' | 'voice'（声＋効果音）
  volume: 'small',      // 'small' | 'medium'
  bgm: false,           // BGM（やさしいオルゴール）なし / あり
  english: false,       // false=日本語のみ / true=日本語＋英語
  hidden: [],           // 表示しない遊びの id
  level: 'auto',        // 'auto' | 1 | 2 | 3
  bedtime: 0,           // おしまいの合図（分）。0=なし
};

let current = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) { /* 保存できない環境でも初期値で動く */ }
  return { ...DEFAULTS };
}

export function getSettings() { return current; }

export function setSetting(name, value) {
  current = { ...current, [name]: value };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) { /* noop */ }
  listeners.forEach((fn) => fn(current));
}

export function onSettingsChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
