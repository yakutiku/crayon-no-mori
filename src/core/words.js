// 言葉の一覧。ja=ひらがな、kana=英語のカタカナ読み、en=英語
export const WORDS = {
  // いろ
  red: { ja: 'あか', kana: 'レッド', en: 'red' },
  blue: { ja: 'あお', kana: 'ブルー', en: 'blue' },
  yellow: { ja: 'きいろ', kana: 'イエロー', en: 'yellow' },
  green: { ja: 'みどり', kana: 'グリーン', en: 'green' },
  pink: { ja: 'ピンク', kana: 'ピンク', en: 'pink' },
  orange: { ja: 'オレンジ', kana: 'オレンジ', en: 'orange' },
  brown: { ja: 'ちゃいろ', kana: 'ブラウン', en: 'brown' },
  sky: { ja: 'みずいろ', kana: 'ライトブルー', en: 'light blue' },
  // かたち
  circle: { ja: 'まる', kana: 'サークル', en: 'circle' },
  square: { ja: 'しかく', kana: 'スクエア', en: 'square' },
  triangle: { ja: 'さんかく', kana: 'トライアングル', en: 'triangle' },
  star: { ja: 'ほし', kana: 'スター', en: 'star' },
  heart: { ja: 'ハート', kana: 'ハート', en: 'heart' },
  // おおきさ・ながさ
  big: { ja: 'おおきい', kana: 'ビッグ', en: 'big' },
  small: { ja: 'ちいさい', kana: 'スモール', en: 'small' },
  long: { ja: 'ながい', kana: 'ロング', en: 'long' },
  short: { ja: 'みじかい', kana: 'ショート', en: 'short' },
  // どうぶつ
  dog: { ja: 'いぬ', kana: 'ドッグ', en: 'dog' },
  cat: { ja: 'ねこ', kana: 'キャット', en: 'cat' },
  rabbit: { ja: 'うさぎ', kana: 'ラビット', en: 'rabbit' },
  bear: { ja: 'くま', kana: 'ベア', en: 'bear' },
  elephant: { ja: 'ぞう', kana: 'エレファント', en: 'elephant' },
  pig: { ja: 'ぶた', kana: 'ピッグ', en: 'pig' },
  frog: { ja: 'かえる', kana: 'フロッグ', en: 'frog' },
  bird: { ja: 'とり', kana: 'バード', en: 'bird' },
  squirrel: { ja: 'りす', kana: 'スクワロル', en: 'squirrel' },
  fish: { ja: 'さかな', kana: 'フィッシュ', en: 'fish' },
  turtle: { ja: 'かめ', kana: 'タートル', en: 'turtle' },
  octopus: { ja: 'たこ', kana: 'オクトパス', en: 'octopus' },
  // もの
  apple: { ja: 'りんご', kana: 'アップル', en: 'apple' },
  strawberry: { ja: 'いちご', kana: 'ストロベリー', en: 'strawberry' },
  tomato: { ja: 'トマト', kana: 'トマト', en: 'tomato' },
  balloon: { ja: 'ふうせん', kana: 'バルーン', en: 'balloon' },
  car: { ja: 'くるま', kana: 'カー', en: 'car' },
  cup: { ja: 'コップ', kana: 'カップ', en: 'cup' },
  banana: { ja: 'バナナ', kana: 'バナナ', en: 'banana' },
  chick: { ja: 'ひよこ', kana: 'チック', en: 'chick' },
  lemon: { ja: 'レモン', kana: 'レモン', en: 'lemon' },
  leaf: { ja: 'はっぱ', kana: 'リーフ', en: 'leaf' },
  pepper: { ja: 'ピーマン', kana: 'ペッパー', en: 'pepper' },
  // かず
  one: { ja: 'いち', kana: 'ワン', en: 'one' },
  two: { ja: 'にぃ', kana: 'ツー', en: 'two' },
  three: { ja: 'さん', kana: 'スリー', en: 'three' },
  four: { ja: 'よん', kana: 'フォー', en: 'four' },
  five: { ja: 'ご', kana: 'ファイブ', en: 'five' },
  // その他
  happyBirthday: { ja: 'おめでとう', kana: 'ハッピーバースデー', en: 'happy birthday' },
  fuu: { ja: 'ふーっ', kana: '', en: '' },
};

export const NUMBER_KEYS = ['one', 'two', 'three', 'four', 'five'];

export function word(key) {
  return WORDS[key] || { ja: key, kana: '', en: '' };
}
