import type { CrossArticle } from './schema';
import { CROSS } from './cross/articles';

/**
 * §12.1 ロングテール — 性格診断×香水のクロス考察（/personality）
 * 追加するときは cross/articles.ts に足すだけで、一覧・sitemap・OG画像・ヘッダー導線に反映される。
 * 追加後は `npm run og:fonts` を実行すること（タイトルの未収録漢字はOG画像で描画されない）。
 */
export const CROSS_ARTICLES: readonly CrossArticle[] = CROSS;

export const CROSS_BY_SLUG: Record<string, CrossArticle> = Object.fromEntries(CROSS_ARTICLES.map((c) => [c.slug, c]));

export function getCrossBySlug(slug: string): CrossArticle | undefined {
  return CROSS_BY_SLUG[slug];
}

export const CROSS_SLUGS: readonly string[] = CROSS_ARTICLES.map((c) => c.slug);
