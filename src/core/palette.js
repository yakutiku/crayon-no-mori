// 色の定義。アプリの中で色コードを書いてよいのはこのファイルだけ。
// 原色をそのまま使わず、少しくすませたクレヨン調の色。

export const P = {
  // 学習する4色
  red: '#E2725B',
  blue: '#5B8DD6',
  yellow: '#F2C94C',
  green: '#6BAF6B',
  // 背景・線
  paper: '#FBF6EC',   // かみいろ（背景）
  brown: '#6B5446',   // ちゃいろ（線画。真っ黒は使わない）
  // その他（背景や動物など。学習する4色と混同しない使い方にする）
  pink: '#F4B6B0',    // うすもも
  orange: '#F2A65A',  // だいだい
  sky: '#A8D0E6',     // そらいろ
  grass: '#B7D49B',   // くさいろ
  // 補助色（上の色から作った、うすい色・こい色）
  white: '#FFFDF8',
  cream: '#F5EBD8',
  wood: '#E3C49D',
  woodDark: '#C49A6C',
  woodDeep: '#9C7656',
  brownSoft: '#A08876',
  gray: '#CFC6BA',
  graySoft: '#E8E1D6',
  skyPale: '#DCEBF2',
  grassDeep: '#8DB874',
  pinkDeep: '#E89A93',
  redPale: '#F3B7A9',
  bluePale: '#B3CBEE',
  yellowPale: '#F8E3A1',
  greenPale: '#B9DAB9',
  shadow: 'rgba(107, 84, 70, 0.18)',
  veil: 'rgba(251, 246, 236, 0.92)',
  night: '#4A5470',
  nightSoft: '#6E7894',
};

// 学習する4色（いろあわせ・おえかき用）。key は words.js の言葉のキー
export const LEARN_COLORS = [
  { key: 'red', color: P.red, pale: P.redPale },
  { key: 'blue', color: P.blue, pale: P.bluePale },
  { key: 'yellow', color: P.yellow, pale: P.yellowPale },
  { key: 'green', color: P.green, pale: P.greenPale },
];

// おえかきのクレヨン8色
export const CRAYONS = [
  { key: 'red', color: P.red },
  { key: 'blue', color: P.blue },
  { key: 'yellow', color: P.yellow },
  { key: 'green', color: P.green },
  { key: 'pink', color: P.pink },
  { key: 'orange', color: P.orange },
  { key: 'brown', color: P.brown },
  { key: 'sky', color: P.sky },
];

// CSS から var(--paper) のように使えるようにする
export function installCssVars() {
  const s = document.documentElement.style;
  for (const [k, v] of Object.entries(P)) s.setProperty('--' + k, v);
}
