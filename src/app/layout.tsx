import type { Metadata, Viewport } from 'next';
import { Zen_Kaku_Gothic_New, Zen_Old_Mincho } from 'next/font/google';
import { JsonLd } from '@/components/JsonLd';
import { CloudflareAnalytics } from '@/components/CloudflareAnalytics';
import { META, SITE_NAME, SITE_URL, websiteJsonLd } from '@/lib/seo';
import './globals.css';

/**
 * 書体: 見出し = Zen Old Mincho（現代的な明朝）/ 本文・UI = Zen Kaku Gothic New。
 * next/font でセルフホスト（display: swap）。
 */
const display = Zen_Old_Mincho({
  weight: ['700', '900'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-display',
});

const body = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: META.home.title },
  description: META.home.description,
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#FCFAF7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <JsonLd data={websiteJsonLd()} />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
