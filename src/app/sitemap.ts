import type { MetadataRoute } from 'next';
import { TYPES } from '@/data/types';
import { NOTES } from '@/data/notes';
import { GUIDES } from '@/data/guides';
import { CROSS_ARTICLES } from '@/data/cross';
import { absUrl, CONTENT_UPDATED_AT } from '@/lib/seo';

/**
 * §12.5 sitemap.xml — 全SSGページ・絶対URL。/shindan は除外。
 */
/** 静的書き出し（output: 'export'）のためビルド時に固定生成する */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(CONTENT_UPDATED_AT);
  const statics: MetadataRoute.Sitemap = [
    { url: absUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absUrl('/type'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absUrl('/notes'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absUrl('/guide'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absUrl('/personality'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absUrl('/about'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: absUrl('/sitemap'), lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ];
  const types: MetadataRoute.Sitemap = TYPES.map((t) => ({
    url: absUrl(`/type/${t.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));
  const notes: MetadataRoute.Sitemap = NOTES.map((n) => ({
    url: absUrl(`/notes/${n.slug}`),
    lastModified: new Date(n.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  const guides: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: absUrl(`/guide/${g.slug}`),
    lastModified: new Date(g.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const cross: MetadataRoute.Sitemap = CROSS_ARTICLES.map((c) => ({
    url: absUrl(`/personality/${c.slug}`),
    lastModified: new Date(c.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  return [...statics, ...types, ...notes, ...guides, ...cross];
}
