import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleBody, ArticleMeta } from '@/components/ArticleBody';
import { ShindanCta } from '@/components/ShindanCta';
import { JsonLd } from '@/components/JsonLd';
import { getCrossBySlug, CROSS_ARTICLES, CROSS_SLUGS } from '@/data/cross';
import { GUIDE_BY_SLUG } from '@/data/guides';
import { NOTE_BY_SLUG } from '@/data/notes';
import { articleJsonLd, crossMetadata } from '@/lib/seo';
import { isDefined } from '@/lib/util';
import styles from '../../guide/[slug]/page.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return CROSS_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCrossBySlug(slug);
  if (!c) return {};
  return crossMetadata(c);
}

/** §6 /personality/[slug] — 性格診断×香水のクロス考察 */
export default async function PersonalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCrossBySlug(slug);
  if (!c) notFound();
  const path = `/personality/${c.slug}`;
  const shortTitle = c.title.split('｜')[0] ?? c.title;
  const relatedNotes = c.relatedNotes.map((s) => NOTE_BY_SLUG[s]).filter(isDefined);
  const relatedGuides = c.relatedGuides.map((s) => GUIDE_BY_SLUG[s]).filter(isDefined);
  const others = CROSS_ARTICLES.filter((o) => o.slug !== c.slug);

  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs
          crumbs={[
            { name: '性格診断と香り', path: '/personality' },
            { name: shortTitle, path },
          ]}
        />
        <div className={styles.head}>
          <span className="eyebrow">{c.badge}</span>
          <h1 className={styles.h1}>{c.title}</h1>
          <ArticleMeta publishedAt={c.publishedAt} updatedAt={c.updatedAt} />
        </div>
        <p className={`card ${styles.lead}`}>{c.lead}</p>

        <ArticleBody sections={c.sections} />

        <section className={`card ${styles.ctaBox}`} aria-labelledby="cross-cta-heading">
          <h2 id="cross-cta-heading" className={styles.ctaHeading}>
            香りの側から、直接調べる
          </h2>
          <p className={styles.ctaText}>
            性格診断の結果を経由せずに、12の質問へ答えるだけで自分の系統がわかります。約90秒で、結果には具体的なノート名まで出ます。
          </p>
          <ShindanCta fromSlug={`personality/${c.slug}`} align="center" block />
        </section>

        <section className={`card ${styles.related}`} aria-labelledby="related-heading">
          <h2 id="related-heading" className={styles.relatedHeading}>
            関連する考察と解説
          </h2>
          <ul className={styles.relatedList}>
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/personality/${o.slug}`} className={styles.relatedLink}>
                  {o.title}
                </Link>
              </li>
            ))}
            {relatedNotes.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className={styles.relatedLink}>
                  {n.name}系の香水とは — 特徴・代表ノート・似合う人
                </Link>
              </li>
            ))}
            {relatedGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`} className={styles.relatedLink}>
                  {g.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/type" className={styles.relatedLink}>
                香水タイプ一覧（全16タイプの香りと似合う人）
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
      <JsonLd
        data={articleJsonLd({
          headline: c.title,
          description: c.seoDescription,
          path,
          image: `/og/cross-${c.slug}.png`,
          publishedAt: c.publishedAt,
          updatedAt: c.updatedAt,
        })}
      />
    </>
  );
}
