import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleBody, ArticleMeta } from '@/components/ArticleBody';
import { ShindanCta } from '@/components/ShindanCta';
import { JsonLd } from '@/components/JsonLd';
import { getNoteBySlug, NOTE_SLUGS } from '@/data/notes';
import { GUIDES } from '@/data/guides';
import { typesByAccord } from '@/data/types';
import { articleJsonLd, noteMetadata } from '@/lib/seo';
import { Art } from '@/components/Art';
import { ACCORD_LIQUID } from '@/data/palette';
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

/**
 * §8.6 香りノート解説
 * 構成: 香調の説明 / 代表的なノート / どんな印象を与えるか / 診断CTA / この香調が主香調のタイプ（cool/warm）
 */
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
        <p className="data">
          香りの解説 — {n.name} / {n.nameEn}
        </p>
        <h1 className={styles.h1}>{n.h1}</h1>
        <ArticleMeta publishedAt={n.publishedAt} updatedAt={n.updatedAt} />
        <div className={styles.heroArt} aria-hidden="true">
          <Art
            src={`/img/notes/${n.slug}.jpg`}
            alt=""
            className={styles.heroArtInner}
            fallback={<div className={styles.heroArtFallback} style={{ background: `linear-gradient(120deg, ${ACCORD_LIQUID[n.accord]}22, transparent 70%)` }} />}
          />
        </div>
        <p className={styles.lead}>{n.lead}</p>

        <ArticleBody sections={n.sections} />

        {/* 診断CTA */}
        <section className={styles.ctaBox} aria-labelledby="note-cta-heading">
          <h2 id="note-cta-heading" className={styles.ctaHeading}>
            {`${n.name}系が似合うか、香水診断で確かめる`}
          </h2>
          <p className={styles.ctaText}>
            12の質問に答えると、あなたの主香調が8系統のどれかと、温かい／冷たいの温度がわかります。無料・登録不要・約90秒。
          </p>
          <ShindanCta fromSlug={`notes/${n.slug}`} />
        </section>

        {/* この香調が主香調のタイプ */}
        <section className={styles.types} aria-labelledby="types-heading">
          <h2 id="types-heading" className={styles.h2}>
            {`${n.name}系が主香調の香水タイプ`}
          </h2>
          <ul className={styles.typeList}>
            {[cool, warm].map((t) => (
              <li key={t.code} className={styles.typeItem}>
                <span className={styles.dot} style={{ background: t.liquidColor }} aria-hidden="true" />
                <div>
                  <Link href={`/type/${t.slug}`} className={styles.typeLink}>
                    <span className={`brush ${styles.typeName}`}>{t.name}</span>
                    <span className={styles.typeKana}>（{t.kana}）</span>
                    <span className={styles.typeCode}>{t.code}</span>
                  </Link>
                  <p className={styles.typeCatch}>{t.catch}</p>
                  <p className={styles.typeNotes}>
                    <Link href={`/type/${t.slug}`} className="link">
                      {n.name}系 — {t.notes.top.join('・')} / {t.notes.middle.join('・')} / {t.notes.last.join('・')}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {relatedGuides.length > 0 && (
          <section className={styles.related} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.h2}>
              関連するガイド記事
            </h2>
            <ul className={styles.relatedList}>
              {relatedGuides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guide/${g.slug}`} className="link">
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
