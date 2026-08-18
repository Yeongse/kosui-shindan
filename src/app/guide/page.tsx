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

/** ガイド記事ハブ（§12.3） */
export default function GuideIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '香水の選び方ガイド', path: '/guide' }]} />
        <p className="data">GUIDE — HOW TO CHOOSE & WEAR</p>
        <h1 className={styles.h1}>香水の選び方・つけ方ガイド</h1>
        <p className={styles.lead}>
          最初の1本の選び方、オードトワレとオードパルファンの違い、つける場所や適量、季節での使い分けまで。香水診断の結果を実際の1本につなげるための記事です。
        </p>
        <ol className={styles.list}>
          {GUIDES.map((g, i) => (
            <li key={g.slug} className={styles.item}>
              <span className={`data ${styles.no}`}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className={styles.title}>
                  <Link href={`/guide/${g.slug}`} className={styles.titleLink}>
                    {g.title}
                  </Link>
                </h2>
                <p className={styles.desc}>{g.seoDescription}</p>
                <p className={`data ${styles.date}`}>公開 {g.publishedAt.replace(/-/g, '.')}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.cta}>
          <ShindanCta note="読んで迷ったら、90秒の香水診断で自分の系統を先に知るのが近道です。" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
