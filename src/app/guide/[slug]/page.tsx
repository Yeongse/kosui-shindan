import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleBody, ArticleMeta } from '@/components/ArticleBody';
import { ShindanCta } from '@/components/ShindanCta';
import { JsonLd } from '@/components/JsonLd';
import { getGuideBySlug, GUIDE_BY_SLUG, GUIDE_SLUGS } from '@/data/guides';
import { NOTE_BY_SLUG } from '@/data/notes';
import { articleJsonLd, guideMetadata } from '@/lib/seo';
import { isDefined } from '@/lib/util';
import styles from './page.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) return {};
  return guideMetadata(g);
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) notFound();
  const path = `/guide/${g.slug}`;
  const shortTitle = g.title.split('｜')[0] ?? g.title;
  const relatedNotes = g.relatedNotes.map((s) => NOTE_BY_SLUG[s]).filter(isDefined);
  const relatedGuides = g.relatedGuides.map((s) => GUIDE_BY_SLUG[s]).filter(isDefined);

  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs
          crumbs={[
            { name: '香水の選び方ガイド', path: '/guide' },
            { name: shortTitle, path },
          ]}
        />
        <div className={styles.head}>
          <span className="eyebrow">Guide</span>
          <h1 className={styles.h1}>{g.title}</h1>
          <ArticleMeta publishedAt={g.publishedAt} updatedAt={g.updatedAt} />
        </div>
        <p className={`card ${styles.lead}`}>{g.lead}</p>

        <ArticleBody sections={g.sections} />

        <section className={`card ${styles.ctaBox}`} aria-labelledby="guide-cta-heading">
          <h2 id="guide-cta-heading" className={styles.ctaHeading}>
            自分に似合う系統を、先に知る
          </h2>
          <p className={styles.ctaText}>読んで迷ったら、90秒の香水診断で自分の系統を先に知るのが近道です。12の質問で16タイプのどれかがわかり、具体的なノート名まで提示します。</p>
          <ShindanCta fromSlug={`guide/${g.slug}`} align="center" block />
        </section>

        <section className={`card ${styles.related}`} aria-labelledby="related-heading">
          <h2 id="related-heading" className={styles.relatedHeading}>
            関連する解説とガイド
          </h2>
          <ul className={styles.relatedList}>
            {relatedNotes.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className={styles.relatedLink}>
                  {n.name}系の香水とは — 特徴・代表ノート・似合う人
                </Link>
              </li>
            ))}
            {relatedGuides.map((r) => (
              <li key={r.slug}>
                <Link href={`/guide/${r.slug}`} className={styles.relatedLink}>
                  {r.title}
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
          headline: g.title,
          description: g.seoDescription,
          path,
          image: `/og/guide-${g.slug}.png`,
          publishedAt: g.publishedAt,
          updatedAt: g.updatedAt,
        })}
      />
    </>
  );
}
