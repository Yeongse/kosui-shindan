import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
import { TYPES } from '@/data/types';
import { NOTES } from '@/data/notes';
import { ACCORD_CODES, type AccordCode } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { buildMetadata, META } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.typeIndex.title,
  description: META.typeIndex.description,
  path: '/type',
});

/**
 * §8.5 香水タイプ一覧（香層図鑑）
 * 16タイプを 4×4 ではなく 2列の目録として。カードグリッドにしない。
 */
export default function TypeIndexPage() {
  const noteSlugByAccord = Object.fromEntries(NOTES.map((n) => [n.accord, n.slug])) as Record<AccordCode, string>;
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '香水タイプ一覧', path: '/type' }]} />
        <p className="data">香層図鑑 — INDEX OF 16 TYPES</p>
        <h1 className={styles.h1}>香水診断・全16タイプ一覧</h1>
        <p className={styles.lead}>
          8つの香調（系統）と、温かい／冷たいの温度で分かれる16の香水タイプ。タイプ名を選ぶと、代表ノート、似合う人、その系統の香水の選び方を読めます。自分のタイプは12問の無料診断でわかります。
        </p>

        <ol className={styles.catalog}>
          {ACCORD_CODES.map((accord) => {
            const pair = TYPES.filter((t) => t.code.startsWith(accord));
            return (
              <li key={accord} className={styles.group}>
                <h2 className={styles.groupHead}>
                  <span className={`data ${styles.groupCode}`}>{accord}</span>
                  <Link href={`/notes/${noteSlugByAccord[accord]}`} className={styles.groupLink}>
                    {ACCORD_NAME_JA[accord]}系
                  </Link>
                </h2>
                <ul className={styles.rows}>
                  {pair.map((t) => (
                    <li key={t.code} className={styles.row}>
                      <span className={styles.dot} style={{ background: t.liquidColor }} aria-hidden="true" />
                      <div className={styles.rowBody}>
                        <Link href={`/type/${t.slug}`} className={styles.rowLink}>
                          <span className={styles.name}>{t.name}</span>
                          <span className={styles.kana}>（{t.kana}）</span>
                          <span className={styles.temp}>{t.code.endsWith('-C') ? 'cool' : 'warm'}</span>
                        </Link>
                        <p className={styles.catch}>{t.catch}</p>
                        <p className={styles.notes}>
                          <Link href={`/type/${t.slug}`} className={styles.notesLink}>
                            {ACCORD_NAME_JA[accord]}系 — {t.notes.top[0]}・{t.notes.middle[0]}・{t.notes.last[0]}
                          </Link>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        <div className={styles.cta}>
          <ShindanCta note="12問・約90秒。あなたがどのタイプかを判定します。" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
