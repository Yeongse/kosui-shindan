import Link from 'next/link';
import type { ScentType } from '@/data/schema';
import { TYPE_BY_CODE } from '@/data/types';
import { NOTE_BY_SLUG } from '@/data/notes';
import { GUIDE_BY_SLUG } from '@/data/guides';
import { representativeScores } from '@/lib/scoring';
import { articleJsonLd, CONTENT_PUBLISHED_AT, CONTENT_UPDATED_AT } from '@/lib/seo';
import { isDefined } from '@/lib/util';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Breadcrumbs } from './Breadcrumbs';
import { JsonLd } from './JsonLd';
import { ResultModeProvider } from './ResultMode';
import { ResultBand } from './ResultBand';
import { ShindanCard } from './ShindanCard';
import { ConcentrationLine, ResultCtas } from './ResultCtas';
import { AffiliateBlock } from './AffiliateBlock';
import { ShareRow } from './ShareRow';
import { Faq } from './Faq';
import { TypeCard } from './TypeCard';
import styles from './TypePageView.module.css';

/**
 * 結果ページ 兼 タイプ解説記事。診断完了者には「結果」、検索流入者には「解説記事」。
 * 静的HTMLはタイプ代表値で描画し、`?d=`（個人スコア）はクライアントで差し替える。
 *
 * 並びの原則: 上半分が診断完了者の動線（自己認識 → 商品 → シェア → 回遊）、
 * 下半分が検索流入者の読み物（選び方 → 関連 → FAQ）。シェアは感情のピーク直後に置く。
 */
export function TypePageView({ type }: { type: ScentType }) {
  const scores = representativeScores(type.code);

  const best = TYPE_BY_CODE[type.affinity.best];
  const pair = TYPE_BY_CODE[type.affinity.pair];
  const relatedNotes = type.relatedNotes.map((s) => NOTE_BY_SLUG[s]).filter(isDefined);
  const relatedGuides = type.relatedGuides.map((s) => GUIDE_BY_SLUG[s]).filter(isDefined);
  const paragraphs = type.howToChoose.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0);

  return (
    <ResultModeProvider typeCode={type.code}>
      <SiteHeader />
      <main className={`container container--app ${styles.main}`}>
        <Breadcrumbs
          crumbs={[
            { name: '香水タイプ一覧', path: '/type' },
            { name: type.name, path: `/type/${type.slug}` },
          ]}
        />
        <ResultBand />

        {/* 1. 結果カード */}
        <ShindanCard type={type} scores={scores} />
        <ConcentrationLine />

        <h1 className={styles.h1}>{type.h1}</h1>

        {/* 2. あなたに合う香水（おすすめ3本） */}
        <AffiliateBlock type={type} />

        {/* 3. シェア — 結果カードと商品を見た直後、いちばん人に見せたくなる位置に置く */}
        <ShareRow type={type} scores={scores} />

        {/* 4. 相性 */}
        <section className={styles.section} aria-labelledby="affinity-heading">
          <h2 id="affinity-heading" className={`h2 h2--center ${styles.sectionHeading}`}>
            相性のいいタイプ
          </h2>
          <div className={styles.affinityGrid}>
            <div className={styles.affinityCol}>
              <p className={styles.affinityLabel}>良い相性</p>
              <TypeCard type={best} size="sm" />
              <p className={styles.affinityReason}>{type.affinity.bestReason}</p>
            </div>
            <div className={styles.affinityCol}>
              <p className={styles.affinityLabel}>引き立て合う</p>
              <TypeCard type={pair} size="sm" />
            </div>
          </div>
        </section>

        {/* 5. 選び方（SEO本文）— ここから下は検索流入者向けの読み物 */}
        <section className={`card ${styles.panel}`} aria-labelledby="how-heading">
          <h2 id="how-heading" className={`h2 ${styles.panelHeading}`}>
            {`${type.name}タイプに似合う香水の選び方`}
          </h2>
          <div className={styles.prose}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* 6. 関連（§12.1: ノート2本・ガイド2本へのリンクを維持したまま高さを詰める） */}
        <section className={`card ${styles.panel} ${styles.relatedPanel}`} aria-labelledby="related-heading">
          <h2 id="related-heading" className={styles.relatedHeading}>
            関連する香りノートとガイド
          </h2>
          <ul className={styles.relatedList}>
            {relatedNotes.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className={styles.relatedLink}>
                  {n.name}系の香水とは
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
          </ul>
        </section>

        {/* 7. FAQ（アコーディオン） */}
        <Faq heading={`${type.name}タイプの香水について、よくある質問`} items={type.faq} />

        {/* 8. CTA */}
        <ResultCtas />
      </main>
      <SiteFooter />
      <JsonLd
        data={articleJsonLd({
          headline: type.h1,
          description: type.seoDescription,
          path: `/type/${type.slug}`,
          image: `/og/type-${type.slug}.png`,
          publishedAt: CONTENT_PUBLISHED_AT,
          updatedAt: CONTENT_UPDATED_AT,
        })}
      />
    </ResultModeProvider>
  );
}
