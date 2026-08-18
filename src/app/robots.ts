import type { MetadataRoute } from 'next';
import { absUrl, SITE_URL } from '@/lib/seo';

/** §12.5 robots.txt — sitemap 参照。/shindan は noindex メタで制御し、クロール自体は許可（follow）。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: absUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
