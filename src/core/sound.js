// 効果音。音のファイルは使わず、Web Audio で木琴のようなやわらかい音を作る
import { getSettings } from './settings.js';

let ac = null;

// iPhone では、指で触ったときに初めて音の準備ができる
export function unlockAudio() {
  const st = getSettings();
  if (st.sound === 'none' && !st.bgm) return;
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}

// BGM からも同じ音の準備を使う
export function audioContext() { return ac; }

const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5, G4: 392, E4: 329.63, C4: 261.63 };

// 名前 → 鳴らす音の並び [音, 開始(秒)]
const SOUNDS = {
  tap: [['G5', 0]],
  pick: [['E5', 0]],
  fit: [['C5', 0], ['E5', 0.09], ['G5', 0.18]],
  back: [['E4', 0], ['C4', 0.12]],
  pop: [['A5', 0]],
  tada: [['C5', 0], ['E5', 0.12], ['G5', 0.24], ['C6', 0.38]],
  open: [['G4', 0], ['C5', 0.1]],
  blow: [['C6', 0], ['G5', 0.08], ['E5', 0.16]],
};

function tone(freq, at, vol) {
  const t = ac.currentTime + at;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
  g.connect(ac.destination);
  // 基音（サイン）＋ 少しだけ倍音（三角波）で木の響きに
  const o1 = ac.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = freq;
  o1.connect(g);
  const g2 = ac.createGain();
  g2.gain.value = 0.25;
  g2.connect(g);
  const o2 = ac.createOscillator();
  o2.type = 'triangle';
  o2.frequency.value = freq * 2;
  o2.connect(g2);
  o1.start(t); o2.start(t);
  o1.stop(t + 1); o2.stop(t + 0.4);
}

export function sfx(name) {
  const s = getSettings();
  if (s.sound === 'none' || !ac) return;
  const seq = SOUNDS[name] || SOUNDS.tap;
  const vol = s.volume === 'medium' ? 0.16 : 0.07;
  try { seq.forEach(([n, at]) => tone(NOTE[n], at, vol)); } catch (e) { /* noop */ }
}
