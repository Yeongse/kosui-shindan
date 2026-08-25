/**
 * OG 画像に描画する固定文言（フォントサブセット生成の入力にもなる）。
 * OG はビルド時生成（scripts/build-og.ts）なので、外部から任意テキストが入る経路はない。
 */

export const OG_SITE_LABEL = '香水診断 調香箋';
export const OG_SITE_URL_LABEL = 'kosui-shindan.com';
export const OG_PHARMACY = '香水診断 調香箋';
export const OG_TAGLINE = '12の質問で、あなたに似合う香水がわかる。';
export const OG_SUBLINE = '全12問・約90秒・無料・登録不要・16タイプ';
export const OG_DEFAULT_TITLE = '香水診断';
export const OG_TYPE_SUFFIX = 'タイプに似合う香水';

export const OG_FIXED_STRINGS: readonly string[] = [
  OG_SITE_LABEL,
  OG_SITE_URL_LABEL,
  OG_PHARMACY,
  OG_TAGLINE,
  OG_SUBLINE,
  OG_DEFAULT_TITLE,
  OG_TYPE_SUFFIX,
  'Top',
  'Middle',
  'Last',
  '調合番号',
  '見本',
  '第号',
  'トップ',
  'ミドル',
  'ラスト',
  '系の香水とは',
  '香水診断・調香箋',
  '香水の選び方ガイド',
  '香りノート解説',
];
