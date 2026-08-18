import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { TYPES } from '@/data/types';
import { NOTES } from '@/data/notes';
import { GUIDES } from '@/data/guides';
import { buildMetadata, META } from '@/lib/seo';
import styles from '../about/page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.sitemap.title,
  description: META.sitemap.description,
  path: '/sitemap',
});

/** HTML サイトマップ（§8.1 フッター）。孤立ページを作らないための内部リンクハブでもある。 */
export default function SitemapPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: 'サイトマップ', path: '/sitemap' }]} />
        <p className="data">SITEMAP</p>
        <h1 className={styles.h1}>サイトマップ</h1>

        <section className={styles.section}>
          <h2 className={styles.h2}>香水診断</h2>
          <ul className={listStyle}>
            <li>
              <Link href="/" className="link">
                香水診断 調香箋 トップ
              </Link>
            </li>
            <li>
              <Link href="/shindan" className="link">
                香水診断をはじめる（12問・無料）
              </Link>
            </li>
            <li>
              <Link href="/about" className="link">
                診断の考え方・運営者・免責
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="link">
                プライバシーポリシー
              </Link>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>
            <Link href="/type" className="link">
              香水タイプ一覧（全16タイプ）
            </Link>
          </h2>
          <ul className={listStyle}>
            {TYPES.map((t) => (
              <li key={t.code}>
                <Link href={`/type/${t.slug}`} className="link">
                  {t.name}（{t.kana}）タイプに似合う香水 — {t.code}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>
            <Link href="/notes" className="link">
              香りノート解説（8香調）
            </Link>
          </h2>
          <ul className={listStyle}>
            {NOTES.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className="link">
                  {n.name}系の香水とは — 特徴・代表ノート・似合う人
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>
            <Link href="/guide" className="link">
              香水の選び方・つけ方ガイド
            </Link>
          </h2>
          <ul className={listStyle}>
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`} className="link">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const listStyle = 'sitemap-list';
