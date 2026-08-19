import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleBody, ArticleMeta } from '@/components/ArticleBody';
import { ShindanCta } from '@/components/ShindanCta';
import { JsonLd } from '@/components/JsonLd';
import { Art } from '@/components/Art';
import { TypeCard } from '@/components/TypeCard';
import { getNoteBySlug, NOTE_SLUGS } from '@/data/notes';
import { GUIDES } from '@/data/guides';
import { typesByAccord } from '@/data/types';
import { ACCORD_LIQUID } from '@/data/palette';
import { articleJsonLd, noteMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return NOTE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = getNoteBySlug(slug);
  if (!n) return {};
  return noteMetadata(n);
}

/** 香りノート解説: 説明 / 代表ノート / 印象 / 診断CTA / 該当タイプ2つ */
export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNoteBySlug(slug);
  if (!n) notFound();
  const { cool, warm } = typesByAccord(n.accord);
  const relatedGuides = GUIDES.filter((g) => g.relatedNotes.includes(n.slug)).slice(0, 3);
  const path = `/notes/${n.slug}`;

  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs
          crumbs={[
            { name: '香りノート解説', path: '/notes' },
            { name: `${n.name}系`, path },
          ]}
        />
        <div className={styles.head}>
          <span className="eyebrow">{n.nameEn}</span>
          <h1 className={styles.h1}>{n.h1}</h1>
          <ArticleMeta publishedAt={n.publishedAt} updatedAt={n.updatedAt} />
        </div>
        <div className={styles.heroArt} style={{ background: `${ACCORD_LIQUID[n.accord]}33` }} aria-hidden="true">
          <Art src={`/img/notes/${n.slug}.jpg`} alt="" className={styles.heroArtInner} fallback={<span className={styles.heroDot} style={{ background: ACCORD_LIQUID[n.accord] }} />} />
        </div>
        <p className={`card ${styles.lead}`}>{n.lead}</p>

        <ArticleBody sections={n.sections} />

        <section className={`card ${styles.ctaBox}`} aria-labelledby="note-cta-heading">
          <h2 id="note-cta-heading" className={styles.ctaHeading}>
            {`${n.name}系が似合うか、香水診断で確かめる`}
          </h2>
          <p className={styles.ctaText}>12の質問に答えると、あなたの主香調が8系統のどれかと、温かい／冷たいの温度がわかります。無料・登録不要・約90秒。</p>
          <ShindanCta fromSlug={`notes/${n.slug}`} align="center" block />
        </section>

        <section className={styles.types} aria-labelledby="types-heading">
          <h2 id="types-heading" className={`h2 h2--center ${styles.typesHeading}`}>
            {`${n.name}系が主香調の香水タイプ`}
          </h2>
          <div className={styles.typeGrid}>
            <TypeCard type={cool} />
            <TypeCard type={warm} />
          </div>
        </section>

        {relatedGuides.length > 0 && (
          <section className={`card ${styles.related}`} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.relatedHeading}>
              関連するガイド記事
            </h2>
            <ul className={styles.relatedList}>
              {relatedGuides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guide/${g.slug}`} className={styles.relatedLink}>
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
      <JsonLd
        data={articleJsonLd({
          headline: n.h1,
          description: n.seoDescription,
          path,
          image: `/api/og?type=${n.accord}-C&label=${encodeURIComponent(`${n.name}系の香水とは`)}`,
          publishedAt: n.publishedAt,
          updatedAt: n.updatedAt,
        })}
      />
    </>
  );
}
