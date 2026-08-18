import type { GuideArticle } from './schema';
import { GUIDES_1 } from './guides/part-1';
import { GUIDES_2 } from './guides/part-2';

/**
 * §12.3 — ガイド記事（ローンチ時10本。残り5本は part-3.ts を追加して配列に足すだけで公開できる）
 * 未公開の予定記事: long-lasting / similar-scent-search / perfume-terms / first-date-scent / nioi-kaori-difference
 */
export const GUIDES: readonly GuideArticle[] = [...GUIDES_1, ...GUIDES_2];

export const GUIDE_BY_SLUG: Record<string, GuideArticle> = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_BY_SLUG[slug];
}

export const GUIDE_SLUGS: readonly string[] = GUIDES.map((g) => g.slug);
