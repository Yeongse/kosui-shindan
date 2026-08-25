import mediaJson from './product-media.json';
import type { ProductPick } from './schema';

/**
 * §12.6 — おすすめ香水3本の商品画像・商品ページURL。
 *
 * 実体は product-media.json で、`npm run fetch:media`（scripts/fetch-product-media.ts）が
 * 楽天ウェブサービスの商品検索APIから引いて書き出す。ビルド時にAPIは叩かない。
 * 未取得の商品は画像なしで描画され、リンクは商品名の完全一致検索にフォールバックする。
 */
export interface ProductMedia {
  image: string;
  affiliateUrl: string;
  itemUrl: string;
  itemName: string;
  shopName: string;
  price: number;
  fetchedAt: string;
}

const MEDIA = mediaJson as Record<string, ProductMedia | undefined>;

export function mediaFor(pick: ProductPick): ProductMedia | undefined {
  return MEDIA[pick.query];
}

export const MEDIA_COUNT = Object.keys(MEDIA).length;
