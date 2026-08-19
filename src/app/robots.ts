import type { MetadataRoute } from 'next';
import { absUrl, SITE_URL } from '@/lib/seo';

/** §12.5 robots.txt — sitemap 参照。/shindan は noindex メタで制御し、クロール自体は許可（follow）。 */
/** 静的書き出し（output: 'export'）のためビルド時に固定生成する */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: absUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
