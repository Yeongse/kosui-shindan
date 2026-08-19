import type { GuideArticle } from './schema';
import { GUIDES_1 } from './guides/part-1';
import { GUIDES_2 } from './guides/part-2';
import { GUIDES_3 } from './guides/part-3';
import { GUIDES_4 } from './guides/part-4';

/**
 * §12.3 — ガイド記事（§12.3 の15本 + 「香水作り・調香体験とは」の計16本）
 * 追加するときは part-N.ts を作って配列に足すだけで公開される。追加後は `npm run og:fonts` を実行すること。
 */
export const GUIDES: readonly GuideArticle[] = [...GUIDES_1, ...GUIDES_2, ...GUIDES_3, ...GUIDES_4];

export const GUIDE_BY_SLUG: Record<string, GuideArticle> = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_BY_SLUG[slug];
}

export const GUIDE_SLUGS: readonly string[] = GUIDES.map((g) => g.slug);
