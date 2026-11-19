// 声。端末に入っている読み上げ機能（Web Speech API）を使う。通信はしない
import { getSettings } from './settings.js';

const synth = window.speechSynthesis;
let jaVoice = null;
let enVoice = null;
let checked = false;

function pick(voices, lang) {
  const list = voices.filter((v) => (v.lang || '').replace('_', '-').toLowerCase().startsWith(lang));
  // 端末内の声を優先（通信が必要な声は使わない）
  return list.find((v) => v.localService) || null;
}

function refresh() {
  if (!synth) return;
  const voices = synth.getVoices();
  if (!voices.length) return;
  jaVoice = pick(voices, 'ja');
  enVoice = pick(voices, 'en');
  checked = true;
}

export function initSpeech() {
  if (!synth) { checked = true; return; }
  refresh();
  if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', refresh);
  setTimeout(() => { refresh(); checked = true; }, 1500);
}

export function voiceStatus() {
  return { checked, ja: !!jaVoice, en: !!enVoice };
}

function utter(text, voice) {
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.85;
  u.pitch = 1.2;
  u.volume = getSettings().volume === 'medium' ? 1 : 0.6;
  synth.speak(u);
}

// ja: ひらがな、en: 英語（英語オンのときだけ）
export function speak(ja, en) {
  const s = getSettings();
  if (s.sound !== 'voice' || !synth || !jaVoice) return;
  try {
    synth.cancel();
    if (ja) utter(ja, jaVoice);
    if (s.english && en && enVoice) utter(en, enVoice);
  } catch (e) { /* noop */ }
}

export function stopSpeech() { try { synth && synth.cancel(); } catch (e) { /* noop */ } }
