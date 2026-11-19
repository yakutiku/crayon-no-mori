// 保護者設定画面と「保護者の方へ」ページ
import { h } from '../core/crayon.js';
import { getSettings, setSetting } from '../core/settings.js';
import { voiceStatus } from '../core/speech.js';
import { resetLevels } from '../core/level.js';
import { unlockAudio, sfx } from '../core/sound.js';
import { refreshBgm } from '../core/bgm.js';
import { speak } from '../core/speech.js';
import { guideHtml } from './guide.js';

const GAME_NAMES = {
  colors: 'いろあわせ', shapes: 'かたちあわせ', sizes: 'おおきい・ちいさい', lengths: 'ながい・みじかい',
  peekaboo: 'どうぶつ いないいないばあ', drawing: 'おえかき', candles: 'ろうそく ふーっ',
};

function seg(name, options, onChange) {
  const box = h('div', { class: 'seg', 'data-setting': name });
  const paint = () => {
    const v = getSettings()[name];
    [...box.children].forEach((b) => b.setAttribute('aria-pressed', String(String(v) === b.dataset.value)));
  };
  options.forEach(([value, label]) => {
    const b = h('button', { 'data-value': String(value), text: label });
    b.addEventListener('click', () => {
      setSetting(name, value);
      paint();
      onChange && onChange(value);
    });
    box.appendChild(b);
  });
  paint();
  return box;
}

function row(label, control, note) {
  return h('div', { class: 'row' }, [h('div', { class: 'row-label', text: label }), control, note ? h('div', { class: 'row-note', text: note }) : null]);
}

export function openPanel(app, onClose) {
  const panel = h('div', { class: 'panel', 'data-panel': '1' });
  const inner = h('div', { class: 'panel-in' });
  panel.appendChild(inner);

  const close = () => { panel.remove(); onClose && onClose(); };

  function renderSettings() {
    const st = getSettings();
    const vs = voiceStatus();
    const closeBtn = h('button', { class: 'close', text: 'とじる', 'data-close': '1' });
    closeBtn.addEventListener('click', close);

    const hiddenBox = h('div', { class: 'seg', 'data-setting': 'hidden' });
    Object.entries(GAME_NAMES).forEach(([id, name]) => {
      const b = h('button', { 'data-value': id, text: name });
      const paint = () => b.setAttribute('aria-pressed', String(!getSettings().hidden.includes(id)));
      b.addEventListener('click', () => {
        const hid = getSettings().hidden;
        setSetting('hidden', hid.includes(id) ? hid.filter((x) => x !== id) : [...hid, id]);
        paint();
      });
      paint();
      hiddenBox.appendChild(b);
    });

    const test = h('button', { class: 'small-btn', text: 'おとを ためす', style: { marginTop: '10px' } });
    test.addEventListener('click', () => { unlockAudio(); setTimeout(() => { sfx('tada'); speak('いぬ', 'dog'); }, 50); });

    const guideBtn = h('button', { class: 'link-btn', text: '保護者の方へ（使い方・画面の固定など）', 'data-guide': '1' });
    guideBtn.addEventListener('click', renderGuide);

    const resetBtn = h('button', { class: 'small-btn', text: 'レベルの記録を最初に戻す' });
    resetBtn.addEventListener('click', () => { resetLevels(); resetBtn.textContent = '最初に戻しました'; });

    const voiceNote = !vs.checked ? '声：しらべています…'
      : `声：日本語 ${vs.ja ? 'つかえる' : 'つかえない'}／英語 ${vs.en ? 'つかえる' : 'つかえない'}` + (vs.ja ? '' : '（声のかわりに効果音だけになります）');

    inner.replaceChildren(
      closeBtn,
      h('h1', { text: '保護者設定' }),
      row('音', seg('sound', [['none', 'なし'], ['sfx', '効果音のみ'], ['voice', '声＋効果音']], () => unlockAudio()), voiceNote),
      test,
      row('BGM', seg('bgm', [[false, 'なし'], [true, 'あり']], () => { unlockAudio(); refreshBgm(); }), 'オルゴールのような、ゆっくりした曲が小さく流れます。「音」の設定とは別に切り替えられます。'),
      row('音の大きさ', seg('volume', [['small', '小'], ['medium', '中']]), '効果音・声・BGMの大きさです。'),
      row('英語', seg('english', [[false, '日本語のみ'], [true, '日本語＋英語']]), '英語オンのときは「いぬ／ドッグ／dog」のように文字が出て、声も日本語のあとに英語を言います。'),
      row('遊びの表示（緑が表示中）', hiddenBox),
      row('レベル', seg('level', [['auto', '自動で上がる'], [1, '1に固定'], [2, '2に固定'], [3, '3に固定']]), '自動：同じレベルを3回最後まで遊ぶと、次に開いたとき1つ上がります。'),
      resetBtn,
      row('おしまいの合図', seg('bedtime', [[0, 'なし'], [10, '10分'], [20, '20分'], [30, '30分']]), '時間になると「おやすみ」の絵がゆっくり出ます。右下の葉っぱを3秒押すと閉じます。時間は設定を変えたときから数えます。'),
      h('div', { style: { marginTop: '22px' } }, [guideBtn]),
    );
    panel.scrollTop = 0;
    void st;
  }

  function renderGuide() {
    const back = h('button', { class: 'close', text: 'もどる' });
    back.addEventListener('click', renderSettings);
    const g = h('div', { class: 'guide' });
    g.innerHTML = guideHtml;
    inner.replaceChildren(back, h('h1', { text: '保護者の方へ' }), g);
    panel.scrollTop = 0;
  }

  renderSettings();
  app.appendChild(panel);
}
