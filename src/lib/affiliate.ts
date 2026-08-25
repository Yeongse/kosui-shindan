/**
 * §12.6 マネタイズ — 楽天市場 / Amazon への送客リンク
 *
 * 2系統ある。
 *   1. 商品リンク（productUrl）… data/picks.ts で名指しした銘品へ。ASIN・楽天商品URLがあれば
 *      商品ページへ直リンクし、無ければ商品名の完全一致検索に落とす。
 *   2. 検索リンク（searchUrl）  … タイプの searchQueries を使ったノート起点の検索。
 *      「他の候補も見たい人」向けの補助導線。
 * 商品ページURLは data/product-media.json（`npm run fetch:media` が楽天APIから取得）にも入る。
 * アフィリエイトIDは環境変数から。未設定なら通常のURLとして動作する。
 */

import { mediaFor } from '@/data/product-media';
import type { ProductPick } from '@/data/schema';

const RAKUTEN_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? '';
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ?? '';

export type Marketplace = 'rakuten' | 'amazon';

/** 任意の楽天URLをアフィリエイト経由に包む。IDが無ければ素通し。 */
function wrapRakuten(target: string): string {
  if (!RAKUTEN_ID) return target;
  return `https://hb.afl.rakuten.co.jp/hgc/${encodeURIComponent(RAKUTEN_ID)}/?pc=${encodeURIComponent(target)}&m=${encodeURIComponent(target)}`;
}

export function rakutenSearchUrl(query: string): string {
  return wrapRakuten(`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(query)}/`);
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

/** Amazon 商品ページ（ASIN 直リンク） */
export function amazonProductUrl(asin: string): string {
  const u = new URL(`https://www.amazon.co.jp/dp/${encodeURIComponent(asin)}`);
  if (AMAZON_TAG) u.searchParams.set('tag', AMAZON_TAG);
  return u.toString();
}

/**
 * 名指しした1本へのリンク。商品ページが分かっていれば直リンク、無ければ商品名の完全一致検索。
 * 楽天は `npm run fetch:media` が取得した affiliateUrl（商品ページ）を最優先で使う。
 */
export function productUrl(m: Marketplace, pick: ProductPick): string {
  if (m === 'amazon') {
    return pick.asin ? amazonProductUrl(pick.asin) : amazonSearchUrl(pick.query);
  }
  if (pick.rakutenItemUrl) return wrapRakuten(pick.rakutenItemUrl);
  const media = mediaFor(pick);
  // API が返す affiliateUrl は既にアフィリエイトIDを含むので包み直さない。
  // なお、そこに入るIDは NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID と一致しない。楽天は2011-12-01以降、
  // レポートを細分化するためAPI・店舗ごとにアフィリエイトIDを出し分けており、いずれも同じ楽天会員IDに
  // 紐づくので成果は正しく計上される（楽天ウェブサービス公式FAQ）。バグではないので書き換えないこと。
  if (media?.affiliateUrl) return media.affiliateUrl;
  return rakutenSearchUrl(pick.query);
}

export const MARKETPLACE_LABEL: Record<Marketplace, string> = {
  rakuten: '楽天市場',
  amazon: 'Amazon',
};

export const MARKETPLACES: readonly Marketplace[] = ['rakuten', 'amazon'];

/** 「ベルガモット ネロリ 香水」→ 「ベルガモット ネロリ」（リンク文言用） */
export function queryDisplay(query: string): string {
  return query.replace(/\s*香水\s*/g, ' ').replace(/\s+/g, ' ').trim();
}
