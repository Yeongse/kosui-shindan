/**
 * §12.6 マネタイズ — ノート起点検索リンク（楽天市場 / Amazon）
 * ブランド固定をしない。検索クエリはタイプの searchQueries をそのまま使う。
 * アフィリエイトIDは環境変数から。未設定なら通常の検索URLとして動作する。
 */

const RAKUTEN_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? '';
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ?? '';

export type Marketplace = 'rakuten' | 'amazon';

export function rakutenSearchUrl(query: string): string {
  const target = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(query)}/`;
  if (!RAKUTEN_ID) return target;
  return `https://hb.afl.rakuten.co.jp/hgc/${encodeURIComponent(RAKUTEN_ID)}/?pc=${encodeURIComponent(target)}&m=${encodeURIComponent(target)}`;
}

export function amazonSearchUrl(query: string): string {
  const u = new URL('https://www.amazon.co.jp/s');
  u.searchParams.set('k', query);
  if (AMAZON_TAG) u.searchParams.set('tag', AMAZON_TAG);
  return u.toString();
}

export function searchUrl(m: Marketplace, query: string): string {
  return m === 'rakuten' ? rakutenSearchUrl(query) : amazonSearchUrl(query);
}

export const MARKETPLACE_LABEL: Record<Marketplace, string> = {
  rakuten: '楽天市場',
  amazon: 'Amazon',
};

/** 「ベルガモット ネロリ 香水」→ 「ベルガモット ネロリ」（リンク文言用） */
export function queryDisplay(query: string): string {
  return query.replace(/\s*香水\s*/g, ' ').replace(/\s+/g, ' ').trim();
}
