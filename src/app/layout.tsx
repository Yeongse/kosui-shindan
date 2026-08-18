import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from 'next/font/google';
import { JsonLd } from '@/components/JsonLd';
import { Analytics } from '@/components/Analytics';
import { META, SITE_NAME, SITE_URL, websiteJsonLd } from '@/lib/seo';
import './globals.css';

/**
 * §7.3 タイポグラフィ: Display=Shippori Mincho B1 / Body=Zen Kaku Gothic New / Data=IBM Plex Mono
 * next/font でセルフホスト（サブセット化 + display: swap）。
 */
const display = Shippori_Mincho_B1({
  weight: ['400', '700'],
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

const data = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-data',
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
  themeColor: '#101B16',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable} ${data.variable}`}>
      <body>
        {children}
        <JsonLd data={websiteJsonLd()} />
        <Analytics />
      </body>
    </html>
  );
}
