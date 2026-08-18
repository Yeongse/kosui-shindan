import Link from 'next/link';
import type { AccordCode, ScentType } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { TYPE_BY_CODE } from '@/data/types';
import { NOTE_BY_SLUG } from '@/data/notes';
import { GUIDE_BY_SLUG } from '@/data/guides';
import { decodeDigest, rankAccords, representativeScores } from '@/lib/scoring';
import { articleJsonLd, CONTENT_PUBLISHED_AT, CONTENT_UPDATED_AT } from '@/lib/seo';
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
import styles from './TypePageView.module.css';
import { isDefined } from '@/lib/util';

/**
 * §8.4 結果ページ 兼 タイプ解説記事。
 * 診断完了者には「結果」、検索流入者には「◯◯系の香水が似合う人の解説記事」。同一URLで受ける。
 * digest（?d=）があれば個人スコアでレーダーを描き、無ければタイプ代表値。
 */
export function TypePageView({ type, digest }: { type: ScentType; digest: string | null }) {
  const decoded = decodeDigest(digest);
  const scores = decoded ?? representativeScores(type.code);
  const validDigest = decoded ? (digest as string) : null;
  const ranked = rankAccords(scores);
  const primary = type.code.split('-')[0] as AccordCode;
  // 隠し香調: 主香調を除いた最上位（digest が主香調と一致しない改竄値でも破綻しないように）
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
      <main className={`container ${styles.main}`}>
        <Breadcrumbs
          crumbs={[
            { name: '香水タイプ一覧', path: '/type' },
            { name: type.name, path: `/type/${type.slug}` },
          ]}
        />

        <ResultBand />

        <h1 className={styles.h1}>{type.h1}</h1>

        {/* 1. 調香箋カード（唯一の明部） */}
        <div className={styles.cardWrap}>
          <ShindanCard type={type} scores={scores} />
        </div>
        <ConcentrationLine />

        {/* 2. 本文 */}
        <section className={styles.body} aria-label="タイプの解説">
          {bodyParas.map((p, i) => (
            <p key={i} className={styles.bodyText}>
              {p}
            </p>
          ))}
        </section>

        {/* 3. まとう場面 / 相性 */}
        <section className={styles.meta} aria-label="まとう場面と相性">
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt className={`data ${styles.dt}`}>まとう場面</dt>
              <dd className={styles.dd}>{type.scenes}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt className={`data ${styles.dt}`}>相性</dt>
              <dd className={styles.dd}>
                <p>
                  良い相性 —{' '}
                  <Link href={`/type/${best.slug}`} className="link">
                    {best.name}（{best.kana}）タイプ
                  </Link>
                  <span className={styles.reason}>（{type.affinity.bestReason}）</span>
                </p>
                <p>
                  引き立て合う —{' '}
                  <Link href={`/type/${pair.slug}`} className="link">
                    {pair.name}（{pair.kana}）タイプ
                  </Link>
                </p>
              </dd>
            </div>
            {/* 4. 隠し香調 */}
            <div className={styles.dlRow}>
              <dt className={`data ${styles.dt}`}>隠し香調</dt>
              <dd className={styles.dd}>
                {`あなたの箋には${ACCORD_NAME_JA[secondary]}が一滴だけ混ざっています。`}
                <span className={styles.reason}>
                  {' '}
                  <Link href={`/notes/${NOTE_BY_SLUG_ACCORD[secondary]}`} className="link">
                    {`${ACCORD_NAME_JA[secondary]}系の香水とは`}
                  </Link>
                </span>
              </dd>
            </div>
          </dl>
        </section>

        {/* 5. 似合う香水の選び方（SEO本文） */}
        <section className={styles.section} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles.h2}>
            {`${type.name}タイプに似合う香水の選び方`}
          </h2>
          <div className={styles.prose}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* 6. この香りを探す */}
        <AffiliateBlock type={type} />

        {/* 7. 関連リンク */}
        <section className={styles.section} aria-labelledby="related-heading">
          <h2 id="related-heading" className={styles.h2}>
            関連する香りノートとガイド
          </h2>
          <ul className={styles.relatedList}>
            {relatedNotes.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className="link">
                  {n.name}系の香水とは — 特徴・代表ノート・似合う人
                </Link>
              </li>
            ))}
            {relatedGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`} className="link">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 8. タイプ別FAQ */}
        <Faq heading={`${type.name}タイプの香水について、よくある質問`} items={type.faq} />

        {/* 9. シェア */}
        <ShareRow type={type} digest={validDigest} scores={scores} />

        {/* 10. CTA群 */}
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

const NOTE_BY_SLUG_ACCORD: Record<AccordCode, string> = {
  CIT: 'citrus',
  GRN: 'green',
  FLR: 'floral',
  FRT: 'fruity',
  GRM: 'gourmand',
  WDY: 'woody',
  AMB: 'amber',
  MSK: 'musk',
};
