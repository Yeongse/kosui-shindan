/**
 * データモデル（app-spec.md §11.3 準拠）
 * ここで定義した型を data/ 配下の全コンテンツと lib/ のロジックがそのまま使用する。
 */

export type AccordCode = 'CIT' | 'GRN' | 'FLR' | 'FRT' | 'GRM' | 'WDY' | 'AMB' | 'MSK';
export type Temperature = 'W' | 'C';
export type TypeCode = `${AccordCode}-${Temperature}`;
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export const ACCORD_CODES: readonly AccordCode[] = [
  'CIT',
  'GRN',
  'FLR',
  'FRT',
  'GRM',
  'WDY',
  'AMB',
  'MSK',
] as const;

/** 香調8軸の同点時優先順位（§3.2）: FLR > WDY > MSK > AMB > CIT > GRN > FRT > GRM */
export const ACCORD_TIEBREAK: readonly AccordCode[] = [
  'FLR',
  'WDY',
  'MSK',
  'AMB',
  'CIT',
  'GRN',
  'FRT',
  'GRM',
] as const;

export interface OptionWeight {
  accords?: Partial<Record<AccordCode, number>>; // +1..+3
  temp?: number; // -3..+3
  int?: number; // 0..+3
}

export interface QuestionOption {
  key: OptionKey;
  label: string;
  weight: OptionWeight;
}

export interface Question {
  no: number; // 1..12
  text: string;
  options: QuestionOption[];
}

export type NoteSlug =
  | 'citrus'
  | 'green'
  | 'floral'
  | 'fruity'
  | 'gourmand'
  | 'woody'
  | 'amber'
  | 'musk';

export interface ScentTypeBase {
  code: TypeCode;
  slug: string;
  name: string; // 例: '月虹'
  kana: string; // 例: 'げっこう'
  catch: string;
  notes: { top: string[]; middle: string[]; last: string[] };
  body: string;
  scenes: string;
  affinity: { best: TypeCode; bestReason: string; pair: TypeCode };
  searchQueries: string[]; // アフィリエイト検索クエリ(§12.6)
  liquidColor: string; // hex
}

/** v1.1 SEOフィールド（全タイプ固有の書き下ろし必須・テンプレ生成禁止） */
export interface ScentTypeSeo {
  seoTitle: string;
  seoDescription: string; // 110字前後。「香水診断」「無料」を含める
  h1: string; // §8.4の様式
  howToChoose: string; // 「似合う香水の選び方」本文 700-1000字。段落は空行区切り
  faq: { q: string; a: string }[]; // 3問
  relatedNotes: [NoteSlug, NoteSlug]; // /notes/ のslug 2本
  relatedGuides: [string, string]; // /guide/ のslug 2本
}

export type ScentType = ScentTypeBase & ScentTypeSeo;

export type Concentration = 'parfum' | 'edp' | 'edt';

export interface ScoreResult {
  scores: Record<AccordCode, number>;
  temp: number;
  int: number;
  primary: AccordCode;
  secondary: AccordCode;
  typeCode: TypeCode;
  concentration: Concentration;
  digest: string; // 16 hex chars
}

/* ---------- 記事コンテンツ（ノート解説 / ガイド） ---------- */

/** 文字列は段落、{ list } は箇条書き */
export type ContentBlock = string | { list: string[] };

export interface ArticleSection {
  heading: string;
  blocks: ContentBlock[];
}

export interface NoteArticle {
  slug: NoteSlug;
  accord: AccordCode;
  name: string; // 例: 'ムスク'
  nameEn: string; // 例: 'Musk'
  h1: string; // 例: 'ムスク系の香水とは — 特徴・代表ノート・似合う人'
  seoTitle: string;
  seoDescription: string; // 120字書き下ろし
  lead: string;
  sections: ArticleSection[];
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
}

export interface GuideArticle {
  slug: string;
  title: string; // = 主キーワード
  seoDescription: string;
  lead: string;
  sections: ArticleSection[];
  relatedNotes: NoteSlug[]; // 1〜3本
  relatedGuides: string[]; // 1〜3本
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
}
