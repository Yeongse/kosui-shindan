import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
import { CrossTabs } from '@/components/CrossTabs';
import { CROSS_ARTICLES } from '@/data/cross';
import { buildMetadata, META } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.personality.title,
  description: META.personality.description,
  path: '/personality',
});

/** §6 /personality — 性格診断×香水のクロス考察の入口 */
export default function PersonalityIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '性格診断と香り', path: '/personality' }]} />
        <div className={styles.head}>
          <span className="eyebrow">Personality</span>
          <h1 className={styles.h1}>性格診断から香りを探す</h1>
          <p className={styles.lead}>
            MBTIやラブタイプ診断の結果を、香水の香調に翻訳する試みです。性格と香りは直接つながりませんが、「他人との距離をどう設計するか」という中間項を挟むとつながります。どちらの記事も、4つの軸から16タイプすべてに対応させました。
          </p>
        </div>

        <CrossTabs />

        <ul className={styles.list}>
          {CROSS_ARTICLES.map((c) => (
            <li key={c.slug}>
              <Link href={`/personality/${c.slug}`} className={`card ${styles.card}`}>
                <span className={styles.badge}>{c.badge}</span>
                <span className={styles.cardTitle}>{c.cardTitle}</span>
                <span className={styles.cardBody}>{c.cardBody}</span>
                <span className={styles.cardMore}>{c.cardMore}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={`card ${styles.ctaPanel}`}>
          <p className={styles.ctaLine}>自分のタイプが曖昧なら、香りの側から直接調べるほうが早く決まります。</p>
          <ShindanCta size="lg" align="center" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
