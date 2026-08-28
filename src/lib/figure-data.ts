/**
 * 記事に差し込む図版の中身（文言と対応表）。
 * ここに書いた文字列は scripts/build-og-fonts.ts がフォントサブセットに取り込むので、
 * 図版に出る文字は必ずこのファイル経由で定義すること（未収録の字は描画されない）。
 */
import type { TypeCode } from '@/data/schema';

/** 軸 → 香水の設計要素 の対応（4行） */
export interface AxisRow {
  axis: string; // 例: E / I
  element: string; // 例: 香りが届く距離
  left: string;
  right: string;
}

/** 3つの軸の組み合わせ → 香調 */
export interface AccordRow {
  keys: [string, string, string];
  accord: string; // 例: シトラス
  code: TypeCode; // 色の参照用（クール側の色を使う）
  note: string;
}

/** MBTI / ラブタイプの1タイプ → 香水タイプ */
export interface MapCell {
  key: string; // 例: INFP
  slug: string;
}

export interface Group {
  name: string;
  keys: string[];
  note: string;
}

/* ---------- MBTI ---------- */

export const MBTI_AXES: AxisRow[] = [
  { axis: 'E / I', element: '香りが届く距離', left: 'E＝部屋に入った時点で伝わる', right: 'I＝近づいて初めて分かる' },
  { axis: 'S / N', element: '香りの輪郭', left: 'S＝名前で言い当てられる', right: 'N＝言葉にしにくい' },
  { axis: 'T / F', element: '香りの温度', left: 'T＝澄んで冷たい', right: 'F＝肌で温まって丸くなる' },
  { axis: 'J / P', element: '香りの重心', left: 'J＝ラストに芯が残る', right: 'P＝トップが主役で軽い' },
];

export const MBTI_ACCORDS: AccordRow[] = [
  { keys: ['E', 'S', 'P'], accord: 'シトラス', code: 'CIT-C', note: '速くて誰にでも伝わる' },
  { keys: ['E', 'S', 'J'], accord: 'グルマン', code: 'GRM-C', note: '具体的な甘さを置きにいく' },
  { keys: ['E', 'N', 'P'], accord: 'フルーティ', code: 'FRT-C', note: '親しみやすく、掴ませない' },
  { keys: ['E', 'N', 'J'], accord: 'フローラル', code: 'FLR-C', note: '構図として完成している' },
  { keys: ['I', 'S', 'P'], accord: 'グリーン', code: 'GRN-C', note: '静かで具体的、そして軽い' },
  { keys: ['I', 'S', 'J'], accord: 'ウッディ', code: 'WDY-C', note: '静かで具体的、長く残る' },
  { keys: ['I', 'N', 'P'], accord: 'ムスク', code: 'MSK-C', note: '肌に溶けて説明できない' },
  { keys: ['I', 'N', 'J'], accord: 'アンバー', code: 'AMB-C', note: '重く沈んで、残る' },
];

export const MBTI_MAP: MapCell[] = [
  { key: 'ESTP', slug: 'shinko' },
  { key: 'ESFP', slug: 'yokoku' },
  { key: 'ESTJ', slug: 'setto' },
  { key: 'ESFJ', slug: 'shoko' },
  { key: 'ENTP', slug: 'karo' },
  { key: 'ENFP', slug: 'mitsugetsu' },
  { key: 'ENTJ', slug: 'gekko' },
  { key: 'ENFJ', slug: 'shunsho' },
  { key: 'ISTP', slug: 'ugo' },
  { key: 'ISFP', slug: 'nobi' },
  { key: 'ISTJ', slug: 'shinkan' },
  { key: 'ISFJ', slug: 'shinka' },
  { key: 'INTP', slug: 'hakuji' },
  { key: 'INFP', slug: 'kime' },
  { key: 'INTJ', slug: 'yoiyami' },
  { key: 'INFJ', slug: 'kohaku' },
];

export const MBTI_GROUPS: Group[] = [
  { name: '分析家', keys: ['INTJ', 'INTP', 'ENTJ', 'ENTP'], note: '全員クール側。説明を省いた香りに寄る' },
  { name: '外交官', keys: ['INFJ', 'INFP', 'ENFJ', 'ENFP'], note: '全員ウォーム側。温度はあるが正体は掴ませない' },
  { name: '番人', keys: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'], note: '甘さか木か。時間が経っても崩れない' },
  { name: '探検家', keys: ['ISTP', 'ISFP', 'ESTP', 'ESFP'], note: '立ち上がりが速く、残り方が軽い' },
];

/* ---------- ラブタイプ ---------- */

export const LOVE_AXES: AxisRow[] = [
  { axis: '主導性', element: '香りの立ち上がり', left: 'リード＝トップが主役', right: 'フォロー＝ラストが主役' },
  { axis: '公開度', element: '香りの届く距離', left: 'オープン＝部屋に伝わる', right: 'プライベート＝30cm以内' },
  { axis: '熱量', element: '香調の温度', left: 'ホット＝肌で丸くなる', right: 'クール＝輪郭を保つ' },
  { axis: 'コミット', element: '香りの持続', left: '一途＝一日ひとつの香り', right: '自由＝場面ごとに変える' },
];

export const LOVE_ACCORDS: AccordRow[] = [
  { keys: ['オープン', 'リード', '自由'], accord: 'シトラス', code: 'CIT-C', note: '先に立ち上がり、切り替えも速い' },
  { keys: ['オープン', 'リード', '一途'], accord: 'フローラル', code: 'FLR-C', note: '前へ出て、印象を固定する' },
  { keys: ['オープン', 'フォロー', '自由'], accord: 'フルーティ', code: 'FRT-C', note: '場に合わせて動く' },
  { keys: ['オープン', 'フォロー', '一途'], accord: 'グルマン', code: 'GRM-C', note: '甘さで相手を留める' },
  { keys: ['プライベート', 'リード', '自由'], accord: 'グリーン', code: 'GRN-C', note: '間合いを取り、深追いしない' },
  { keys: ['プライベート', 'リード', '一途'], accord: 'ウッディ', code: 'WDY-C', note: '静かに芯を通す' },
  { keys: ['プライベート', 'フォロー', '自由'], accord: 'ムスク', code: 'MSK-C', note: '肌に溶けて押し付けない' },
  { keys: ['プライベート', 'フォロー', '一途'], accord: 'アンバー', code: 'AMB-C', note: '残り香で深く結ぶ' },
];

/** 4軸の組み合わせ → 香水タイプ（16通り） */
export const LOVE_MAP: MapCell[] = [
  { key: 'オープン・リード・自由', slug: 'shinko' },
  { key: 'オープン・リード・一途', slug: 'gekko' },
  { key: 'オープン・フォロー・自由', slug: 'karo' },
  { key: 'オープン・フォロー・一途', slug: 'setto' },
  { key: 'プライベート・リード・自由', slug: 'ugo' },
  { key: 'プライベート・リード・一途', slug: 'shinkan' },
  { key: 'プライベート・フォロー・自由', slug: 'hakuji' },
  { key: 'プライベート・フォロー・一途', slug: 'yoiyami' },
];

/** 温度で対になるスラッグ（クール → ウォーム） */
export const WARM_PAIR: Record<string, string> = {
  shinko: 'yokoku',
  gekko: 'shunsho',
  karo: 'mitsugetsu',
  setto: 'shoko',
  ugo: 'nobi',
  shinkan: 'shinka',
  hakuji: 'kime',
  yoiyami: 'kohaku',
};

/* ---------- 2カラム対比の図 ---------- */

export interface CompareSide {
  title: string;
  sub: string;
  accords: { name: string; code: TypeCode }[];
}

export const MBTI_DISTANCE: [CompareSide, CompareSide] = [
  {
    title: '外向（E）',
    sub: '立ち上がりが速く、遠くまで届く',
    accords: [
      { name: 'シトラス', code: 'CIT-C' },
      { name: 'フルーティ', code: 'FRT-C' },
      { name: 'フローラル', code: 'FLR-C' },
      { name: 'グルマン', code: 'GRM-C' },
    ],
  },
  {
    title: '内向（I）',
    sub: '肌の近くで完成し、遠くへは飛ばない',
    accords: [
      { name: 'グリーン', code: 'GRN-C' },
      { name: 'ウッディ', code: 'WDY-C' },
      { name: 'ムスク', code: 'MSK-C' },
      { name: 'アンバー', code: 'AMB-C' },
    ],
  },
];

export const LOVE_DISTANCE: [CompareSide, CompareSide] = [
  { title: 'オープン', sub: '集団の中でも存在が伝わる', accords: MBTI_DISTANCE[0].accords },
  { title: 'プライベート', sub: '気づいた人だけが気づく', accords: MBTI_DISTANCE[1].accords },
];

/* ---------- 場面別の量 ---------- */

export interface ScaleItem {
  scene: string;
  amount: string;
  bar: number; // 0〜1
}

export const LOVE_SCENES: ScaleItem[] = [
  { scene: 'レストラン・食事', amount: 'つけないか、腰より下に1', bar: 0.2 },
  { scene: '車・タクシー', amount: '乗る1時間前までに1', bar: 0.35 },
  { scene: '映画館・カフェ', amount: 'オードトワレを1', bar: 0.5 },
  { scene: '屋外・街歩き', amount: 'オードトワレを2', bar: 0.9 },
];

/** フォントサブセット生成用。図版に出る文字はすべてここから拾える */
export function figureStrings(): string[] {
  const out: string[] = ['外向', '内向', '香調', '香水タイプ', 'クール', 'ウォーム', '温度', '軸', '香りの設計'];
  for (const a of [...MBTI_AXES, ...LOVE_AXES]) out.push(a.axis, a.element, a.left, a.right);
  for (const a of [...MBTI_ACCORDS, ...LOVE_ACCORDS]) out.push(...a.keys, a.accord, a.note);
  for (const m of [...MBTI_MAP, ...LOVE_MAP]) out.push(m.key);
  for (const g of MBTI_GROUPS) out.push(g.name, g.note, ...g.keys);
  for (const s of [...MBTI_DISTANCE, ...LOVE_DISTANCE]) {
    out.push(s.title, s.sub);
    for (const a of s.accords) out.push(a.name);
  }
  for (const s of LOVE_SCENES) out.push(s.scene, s.amount);
  return out;
}
