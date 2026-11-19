// BGM。音のファイルは使わず、Web Audio でオルゴールのようなやさしい曲をゆっくり繰り返す
// （曲はこのアプリのためにコードで作ったオリジナル。ドレミソラの5つの音だけを使う）
import { getSettings } from './settings.js';
import { audioContext } from './sound.js';

const F = { G3: 196, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99 };
const BEAT = 60 / 66; // 1分に66拍のゆっくりしたテンポ

// [音, 長さ(拍)]。null は休み。4拍で1小節、全部で8小節
const MELODY = [
  ['E5', 1], ['D5', 1], ['C5', 2],
  ['D5', 1], ['E5', 1], ['G5', 2],
  ['E5', 1], ['D5', 1], ['C5', 1], ['A4', 1],
  ['G4', 3], [null, 1],
  ['A4', 1], ['C5', 1], ['D5', 2],
  ['E5', 1], ['G5', 1], ['E5', 2],
  ['D5', 1], ['C5', 1], ['D5', 1], ['E5', 1],
  ['C5', 3], [null, 1],
];
// 1小節ごとの低い音（ゆったりした伴奏）
const BASS = ['C4', 'G3', 'A4', 'G3', 'F4', 'C4', 'G3', 'C4'];

let master = null;
let timer = 0;
let nextTime = 0;
let step = 0;
let playing = false;

function note(ac, freq, t, dur, vol) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(1.2, dur * 1.6));
  g.connect(master);
  const o = ac.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq;
  o.connect(g);
  // ほんの少しだけ高い倍音をのせて、オルゴールらしい響きに
  const g2 = ac.createGain();
  g2.gain.value = 0.12;
  g2.connect(g);
  const o2 = ac.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = freq * 3;
  o2.connect(g2);
  const end = t + Math.max(1.3, dur * 1.7);
  o.start(t); o2.start(t); o.stop(end); o2.stop(t + 0.5);
}

// 少し先までの音を予約していく
function schedule() {
  const ac = audioContext();
  if (!ac || !playing) return;
  while (nextTime < ac.currentTime + 0.3) {
    const [name, beats] = MELODY[step % MELODY.length];
    // 小節の頭で低い音
    const beatPos = MELODY.slice(0, step % MELODY.length).reduce((a, m) => a + m[1], 0);
    if (beatPos % 4 === 0) note(ac, F[BASS[(beatPos / 4) % BASS.length]] / 2, nextTime, 4 * BEAT, 0.35);
    if (name) note(ac, F[name], nextTime, beats * BEAT, 0.5);
    nextTime += beats * BEAT;
    step += 1;
    // 1曲ごとに少し間をあける
    if (step % MELODY.length === 0) nextTime += 2 * BEAT;
  }
}

function level() { return getSettings().volume === 'medium' ? 0.06 : 0.03; }

export function startBgm() {
  const ac = audioContext();
  if (!getSettings().bgm || !ac || playing || document.visibilityState !== 'visible') return;
  if (!master) { master = ac.createGain(); master.connect(ac.destination); }
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(level(), ac.currentTime + 2); // ゆっくり大きくなる
  playing = true;
  document.body.dataset.bgm = '1';
  step = 0;
  nextTime = ac.currentTime + 0.2;
  schedule();
  timer = setInterval(schedule, 100);
}

export function stopBgm() {
  const ac = audioContext();
  playing = false;
  document.body.dataset.bgm = '0';
  clearInterval(timer);
  if (ac && master) {
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ac.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.6);
    // 予約済みの音を止めるため、出口を付け替える
    const old = master;
    master = null;
    setTimeout(() => { try { old.disconnect(); } catch (e) { /* noop */ } }, 700);
  }
}

export function bgmPlaying() { return playing; }

// 設定・音量が変わったとき
export function refreshBgm() {
  if (!getSettings().bgm) { stopBgm(); return; }
  const ac = audioContext();
  if (playing && ac && master) master.gain.setTargetAtTime(level(), ac.currentTime, 0.3);
  else startBgm();
}
