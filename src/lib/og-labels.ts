/**
 * /api/og に渡せる `label` のホワイトリスト（§11.4: 画像に任意テキストを流し込ませない）と、
 * OG 画像に描画する固定文言（フォントサブセット生成の入力にもなる）。
 */
import { NOTES } from '@/data/notes';
import { GUIDES } from '@/data/guides';

export const OG_SITE_LABEL = '香水診断 調香箋';
export const OG_SITE_URL_LABEL = 'kosui-shindan.com';
export const OG_PHARMACY = '香水診断 調香箋';
export const OG_TAGLINE = '12の質問で、あなたに似合う香水がわかる。';
export const OG_SUBLINE = '無料・登録不要・約九十秒 ／ 十六タイプの調香箋';
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

/** label に許可する文字列（ノート題名・ガイド短題名） */
export function allowedOgLabels(): Set<string> {
  const s = new Set<string>();
  for (const n of NOTES) s.add(`${n.name}系の香水とは`);
  for (const g of GUIDES) s.add(g.title.split('｜')[0] ?? g.title);
  s.add('香水タイプ一覧');
  s.add('香りノート解説');
  s.add('香水の選び方ガイド');
  return s;
}
