import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
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
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '香りノート解説', path: '/notes' }]} />
        <p className="data">香りの解説 — 八つの香調</p>
        <h1 className={styles.h1}>香りノート解説 — 香水の8つの香調（系統）</h1>
        <p className={styles.lead}>
          「ムスク系の香水とは」「グルマン系はどんな匂いか」。香水診断の結果に出てくる8つの香調について、特徴・代表ノート・似合う人を系統ごとに解説します。自分の系統は12問の無料診断でわかります。
        </p>
        <ol className={styles.list}>
          {NOTES.map((n) => {
            const { cool, warm } = typesByAccord(n.accord);
            return (
              <li key={n.slug} className={styles.item}>
                <span className={styles.dot} style={{ background: ACCORD_LIQUID[n.accord] }} aria-hidden="true" />
                <div>
                  <h2 className={styles.title}>
                    <Link href={`/notes/${n.slug}`} className={styles.titleLink}>
                      {n.name}系の香水とは — 特徴・代表ノート・似合う人
                    </Link>
                  </h2>
                  <p className={styles.desc}>{n.lead}</p>
                  <p className={styles.types}>
                    <span className="data">該当タイプ</span>{' '}
                    <Link href={`/type/${cool.slug}`} className="link">
                      {cool.name}（{cool.kana}）
                    </Link>
                    <span className={styles.sep}>/</span>
                    <Link href={`/type/${warm.slug}`} className="link">
                      {warm.name}（{warm.kana}）
                    </Link>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className={styles.cta}>
          <ShindanCta note="どの香調が似合うかは、12問の無料診断で確かめられます。" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
