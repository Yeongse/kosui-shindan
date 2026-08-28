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

/* ---------- おすすめ香水（§12.6 プロモーション枠） ---------- */

/**
 * タイプごとに手で選んだ実在の1本。検索クエリではなく「この商品」を出すための最小データ。
 * asin / rakutenItemUrl を入れると商品ページへ直リンクし、無ければ商品名の完全一致検索に落ちる。
 */
export interface ProductPick {
  brand: string; // ラテン表記（見出しの上に小さく出す） 例: 'Jo Malone London'
  brandJa: string; // 日本語表記。検索クエリの構成にも使う 例: 'ジョー マローン ロンドン'
  name: string; // 商品名（ブランド名を含めない） 例: 'ウッド セージ & シー ソルト コロン'
  kind: string; // 賦香濃度・種別 例: 'オードゥ パルファム'
  notes: string; // 主要ノートの並び。選定根拠として残す編集メモで、ページには出さない
  why: string; // このタイプに薦める理由（1文・60字前後）
  query: string; // 商品名の完全一致検索に使う語（ブランド + 商品名）
  /**
   * 同ブランドの紛らわしい別商品を弾くための語（`npm run fetch:media` の突き合わせ用）。
   * 例: コロニア に「プーラ」、ザ・ワン に「フォーメン」。商品名に1つでも含まれたらその出品は候補から外す。
   */
  exclude?: string[];
  asin?: string; // Amazon 商品ページ直リンク用（任意）
  rakutenItemUrl?: string; // 楽天の商品ページURL（任意）
}

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
/** 記事中に差し込む画像（未配置でもレイアウトが崩れないよう Art で描画する） */
export interface ArticleImage {
  src: string; // 配信パス（例: /img/article/mbti-matrix.webp）
  alt: string;
  caption?: string;
  /** 表示比率。省略時は 16:9 */
  ratio?: '16/9' | '4/3' | '1/1';
}

export type ContentBlock = string | { list: string[] } | { image: ArticleImage };

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
