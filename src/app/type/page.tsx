import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
import { TypeCard } from '@/components/TypeCard';
import { TYPES } from '@/data/types';
import { NOTES } from '@/data/notes';
import { ACCORD_CODES, type AccordCode } from '@/data/schema';
import { ACCORD_LIQUID, ACCORD_NAME_JA } from '@/data/palette';
import { buildMetadata, META } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.typeIndex.title,
  description: META.typeIndex.description,
  path: '/type',
});

/** 香水タイプ一覧 — 香調ごとに2枚（クール／ウォーム）のカード */
export default function TypeIndexPage() {
  const noteSlugByAccord = Object.fromEntries(NOTES.map((n) => [n.accord, n.slug])) as Record<AccordCode, string>;
  return (
    <>
      <SiteHeader />
      <main className={`container container--wide ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '香水タイプ一覧', path: '/type' }]} />
        <div className={styles.head}>
          <span className="eyebrow">16 Types</span>
          <h1 className={styles.h1}>香水診断・全16タイプ一覧</h1>
          <p className={styles.lead}>
            8つの香調（系統）と、温かい／冷たいの温度で分かれる16の香水タイプ。気になるタイプを選ぶと、代表ノート、似合う人、その系統の香水の選び方が読めます。自分のタイプは12問の無料診断でわかります。
          </p>
        </div>

        <div className={styles.groups}>
          {ACCORD_CODES.map((accord) => {
            const pair = TYPES.filter((t) => t.code.startsWith(accord));
            return (
              <section key={accord} className={styles.group} aria-labelledby={`g-${accord}`}>
                <h2 id={`g-${accord}`} className={styles.groupHead}>
                  <span className={styles.groupDot} style={{ background: ACCORD_LIQUID[accord] }} aria-hidden="true" />
                  <Link href={`/notes/${noteSlugByAccord[accord]}`} className={styles.groupLink}>
                    {ACCORD_NAME_JA[accord]}系
                  </Link>
                </h2>
                <div className={styles.pair}>
                  {pair.map((t) => (
                    <TypeCard key={t.code} type={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className={`card ${styles.ctaPanel}`}>
          <p className={styles.ctaLine}>あなたはどのタイプ？</p>
          <ShindanCta size="lg" align="center" note="12問・約90秒・登録不要" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
