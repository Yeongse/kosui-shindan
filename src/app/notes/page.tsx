import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
import { Art } from '@/components/Art';
import { NOTES } from '@/data/notes';
import { typesByAccord } from '@/data/types';
import { ACCORD_LIQUID } from '@/data/palette';
import { buildMetadata, META } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.notesIndex.title,
  description: META.notesIndex.description,
  path: '/notes',
});

/** 香りノート解説のハブ（8香調） */
export default function NotesIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container container--wide ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '香りノート解説', path: '/notes' }]} />
        <div className={styles.head}>
          <span className="eyebrow">8 Accords</span>
          <h1 className={styles.h1}>香りノート解説 — 香水の8つの香調（系統）</h1>
          <p className={styles.lead}>
            「ムスク系の香水とは」「グルマン系はどんな匂いか」。香水診断の結果に出てくる8つの香調について、特徴・代表ノート・似合う人を系統ごとに解説します。
          </p>
        </div>
        <ul className={styles.grid}>
          {NOTES.map((n) => {
            const { cool, warm } = typesByAccord(n.accord);
            return (
              <li key={n.slug} className={`card ${styles.item}`}>
                <Link href={`/notes/${n.slug}`} className={styles.thumb} style={{ background: `${ACCORD_LIQUID[n.accord]}33` }}>
                  <Art src={`/img/notes/${n.slug}.jpg`} alt="" className={styles.thumbArt} fallback={<span className={styles.thumbDot} style={{ background: ACCORD_LIQUID[n.accord] }} />} />
                </Link>
                <div className={styles.body}>
                  <h2 className={styles.title}>
                    <Link href={`/notes/${n.slug}`} className={styles.titleLink}>
                      {n.name}系の香水とは
                    </Link>
                  </h2>
                  <p className={styles.desc}>{n.lead}</p>
                  <p className={styles.types}>
                    <Link href={`/type/${cool.slug}`} className="chip">
                      {cool.name}
                    </Link>
                    <Link href={`/type/${warm.slug}`} className="chip">
                      {warm.name}
                    </Link>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className={`card ${styles.ctaPanel}`}>
          <p className={styles.ctaLine}>どの香調が似合うかは、12問の無料診断で確かめられます。</p>
          <ShindanCta size="lg" align="center" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
