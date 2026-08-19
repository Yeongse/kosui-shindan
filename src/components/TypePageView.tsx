import Link from 'next/link';
import type { AccordCode, ScentType } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { TYPE_BY_CODE } from '@/data/types';
import { NOTE_BY_SLUG } from '@/data/notes';
import { GUIDE_BY_SLUG } from '@/data/guides';
import { decodeDigest, rankAccords, representativeScores } from '@/lib/scoring';
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

const NOTE_SLUG_BY_ACCORD: Record<AccordCode, string> = {
  CIT: 'citrus',
  GRN: 'green',
  FLR: 'floral',
  FRT: 'fruity',
  GRM: 'gourmand',
  WDY: 'woody',
  AMB: 'amber',
  MSK: 'musk',
};

/**
 * 結果ページ 兼 タイプ解説記事。診断完了者には「結果」、検索流入者には「解説記事」。
 * digest（?d=）があれば個人スコアでバランスを描き、無ければタイプ代表値。
 */
export function TypePageView({ type, digest }: { type: ScentType; digest: string | null }) {
  const decoded = decodeDigest(digest);
  const scores = decoded ?? representativeScores(type.code);
  const validDigest = decoded ? (digest as string) : null;
  const ranked = rankAccords(scores);
  const primary = type.code.split('-')[0] as AccordCode;
  const secondary = (ranked.find((c) => c !== primary) ?? ranked[1]) as AccordCode;

  const best = TYPE_BY_CODE[type.affinity.best];
  const pair = TYPE_BY_CODE[type.affinity.pair];
  const relatedNotes = type.relatedNotes.map((s) => NOTE_BY_SLUG[s]).filter(isDefined);
  const relatedGuides = type.relatedGuides.map((s) => GUIDE_BY_SLUG[s]).filter(isDefined);
  const paragraphs = type.howToChoose.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0);
  const bodyParas = type.body.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0);

  return (
    <ResultModeProvider typeCode={type.code} digest={validDigest}>
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

        {/* 2. 本文 */}
        <section className={`card ${styles.panel}`} aria-label="タイプの解説">
          {bodyParas.map((p, i) => (
            <p key={i} className={styles.bodyText}>
              {p}
            </p>
          ))}
        </section>

        {/* 3. まとう場面 / 隠し香調 */}
        <section className={`card ${styles.panel}`} aria-label="まとう場面と隠し香調">
          <div className={styles.kv}>
            <h2 className={styles.kvKey}>まとう場面</h2>
            <p className={styles.kvVal}>{type.scenes}</p>
          </div>
          <div className={styles.kv}>
            <h2 className={styles.kvKey}>隠し香調</h2>
            <p className={styles.kvVal}>
              {`あなたの箋には${ACCORD_NAME_JA[secondary]}が一滴だけ混ざっています。`}{' '}
              <Link href={`/notes/${NOTE_SLUG_BY_ACCORD[secondary]}`} className="link">
                {`${ACCORD_NAME_JA[secondary]}系の香水とは`}
              </Link>
            </p>
          </div>
        </section>

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

        {/* 5. 選び方（SEO本文） */}
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

        {/* 6. 探す */}
        <AffiliateBlock type={type} />

        {/* 7. 関連 */}
        <section className={`card ${styles.panel}`} aria-labelledby="related-heading">
          <h2 id="related-heading" className={`h2 ${styles.panelHeading}`}>
            関連する香りノートとガイド
          </h2>
          <ul className={styles.relatedList}>
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
          </ul>
        </section>

        {/* 8. FAQ */}
        <Faq heading={`${type.name}タイプの香水について、よくある質問`} items={type.faq} />

        {/* 9. シェア */}
        <ShareRow type={type} digest={validDigest} scores={scores} />

        {/* 10. CTA */}
        <ResultCtas />
      </main>
      <SiteFooter />
      <JsonLd
        data={articleJsonLd({
          headline: type.h1,
          description: type.seoDescription,
          path: `/type/${type.slug}`,
          image: `/api/og?type=${type.code}`,
          publishedAt: CONTENT_PUBLISHED_AT,
          updatedAt: CONTENT_UPDATED_AT,
        })}
      />
    </ResultModeProvider>
  );
}
