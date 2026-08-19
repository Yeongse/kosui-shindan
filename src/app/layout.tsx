import type { Metadata, Viewport } from 'next';
import { Zen_Kaku_Gothic_New, Zen_Maru_Gothic } from 'next/font/google';
import { JsonLd } from '@/components/JsonLd';
import { CloudflareAnalytics } from '@/components/CloudflareAnalytics';
import { META, SITE_NAME, SITE_URL, websiteJsonLd } from '@/lib/seo';
import './globals.css';

/**
 * 書体: 見出し = Zen Maru Gothic（丸ゴ・太）/ 本文 = Zen Kaku Gothic New。
 * next/font でセルフホスト（display: swap）。
 */
const display = Zen_Maru_Gothic({
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
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#FBF8FC',
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
