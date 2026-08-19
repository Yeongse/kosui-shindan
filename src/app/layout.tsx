import type { Metadata, Viewport } from 'next';
import { Shippori_Mincho_B1, Yuji_Syuku } from 'next/font/google';
import { JsonLd } from '@/components/JsonLd';
import { CloudflareAnalytics } from '@/components/CloudflareAnalytics';
import { META, SITE_NAME, SITE_URL, websiteJsonLd } from '@/lib/seo';
import './globals.css';

/**
 * 書体: 明朝（Shippori Mincho B1）を本文・見出しに、筆文字（Yuji Syuku）をタイプ名などの一点に。
 * next/font でセルフホスト（display: swap）。
 */
const display = Shippori_Mincho_B1({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-display',
});

const brush = Yuji_Syuku({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-brush',
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
  themeColor: '#13203A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${brush.variable}`}>
      <body>
        {children}
        <JsonLd data={websiteJsonLd()} />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
