import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ShindanCta } from '@/components/ShindanCta';
import { SealMark } from '@/components/SealMark';

export const metadata: Metadata = {
  title: { absolute: 'ページが見つかりません｜香水診断 調香箋' },
  robots: { index: false, follow: true },
};

/** §12.5 404 は独自ページ（診断CTA付き） */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={{ marginBottom: 20 }}>
          <SealMark size={44} char="無" />
        </div>
        <p className="data">404 — 見つかりません</p>
        <h1
          className="display"
          style={{ fontSize: 'clamp(22px, 3.6vw, 30px)', letterSpacing: '0.06em', marginTop: 10, lineHeight: 1.5 }}
        >
          この箋は、棚にありません。
        </h1>
        <p style={{ marginTop: 18, color: 'var(--c-usuzumi)', maxWidth: '52ch' }}>
          お探しのページは移動したか、削除された可能性があります。URLをご確認いただくか、以下から目的のページへお進みください。
        </p>
        <ul style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
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
          <ShindanCta note="12問・約90秒。自分の香水タイプを調べる。" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
