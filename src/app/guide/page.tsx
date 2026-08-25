import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
import { GUIDES } from '@/data/guides';
import { buildMetadata, META } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.guideIndex.title,
  description: META.guideIndex.description,
  path: '/guide',
});

export default function GuideIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '香水の選び方ガイド', path: '/guide' }]} />
        <div className={styles.head}>
          <span className="eyebrow">Guide</span>
          <h1 className={styles.h1}>香水の選び方・つけ方ガイド</h1>
          <p className={styles.lead}>最初の1本の選び方、オードトワレとオードパルファンの違い、つける場所や適量、季節での使い分けまで。香水診断の結果を実際の1本につなげるための記事です。</p>
        </div>
        <ol className={styles.list}>
          {GUIDES.map((g, i) => (
            <li key={g.slug} className={`card ${styles.item}`}>
              <Link href={`/guide/${g.slug}`} className={styles.itemLink}>
                <span className={styles.no}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.itemBody}>
                  <span className={styles.title}>{g.title}</span>
                  <span className={styles.desc}>{g.seoDescription}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className={`card ${styles.ctaPanel}`}>
          <p className={styles.ctaLine}>読んで迷ったら、90秒の香水診断で自分の系統を先に知るのが近道です。</p>
          <ShindanCta size="lg" align="center" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
