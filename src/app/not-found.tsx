import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ShindanCta } from '@/components/ShindanCta';
import { LogoMark } from '@/components/LogoMark';

export const metadata: Metadata = {
  title: { absolute: 'ページが見つかりません｜香水診断 調香箋' },
  robots: { index: false, follow: true },
};

/** §12.5 404 は独自ページ（診断CTA付き） */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container container--app" style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <LogoMark size={44} />
        </div>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: 'clamp(22px, 3.6vw, 30px)', marginTop: 12 }}>ページが見つかりません</h1>
        <p style={{ marginTop: 18, color: 'var(--c-text-2)', maxWidth: '52ch', marginInline: 'auto' }}>
          お探しのページは移動したか、削除された可能性があります。URLをご確認いただくか、以下から目的のページへお進みください。
        </p>
        <ul style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, alignItems: 'center' }}>
          <li>
            <Link href="/" className="link">
              香水診断 調香箋 トップ
            </Link>
          </li>
          <li>
            <Link href="/type" className="link">
              香水タイプ一覧（全16タイプ）
            </Link>
          </li>
          <li>
            <Link href="/notes" className="link">
              香りノート解説（8香調）
            </Link>
          </li>
          <li>
            <Link href="/guide" className="link">
              香水の選び方ガイド
            </Link>
          </li>
        </ul>
        <div style={{ marginTop: 40 }}>
          <ShindanCta align="center" note="12問・約90秒。自分の香水タイプを調べる。" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
