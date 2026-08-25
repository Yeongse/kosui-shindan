'use client';

import type { ProductPick, ScentType } from '@/data/schema';
import { picksFor } from '@/data/picks';
import { mediaFor } from '@/data/product-media';
import {
  MARKETPLACE_LABEL,
  MARKETPLACES,
  productUrl,
  queryDisplay,
  searchUrl,
} from '@/lib/affiliate';
import { track } from '@/lib/analytics';
import styles from './AffiliateBlock.module.css';

const ORDINAL = ['壱', '弐', '参'] as const;

/**
 * あなたに合う香水 — PR ラベル付き。
 * まずタイプごとに名指しで選んだ銘品3本をブランドを立てて出し、
 * その下に「他の候補」としてノート起点の検索を置く。
 */
export function AffiliateBlock({ type }: { type: ScentType }) {
  const picks = picksFor(type.code);
  return (
    <section className={`card ${styles.section}`} aria-labelledby="find-heading">
      <div className={styles.headRow}>
        <h2 id="find-heading" className={`h2 ${styles.heading}`}>
          {type.name}タイプに似合う香水 3本
        </h2>
        <span className={styles.pr} title="アフィリエイトリンクを含みます">
          PR
        </span>
      </div>
      <p className={styles.lead}>
        {type.name}の輪郭にいちばん近い香りを、名前を知っているブランドの中から選びました。
        どれも手の届く価格で、あなたのタイプの設計図と重なる一本です。
      </p>

      <ol className={styles.picks}>
        {picks.map((p, i) => (
          <PickCard key={p.query} pick={p} rank={i} typeCode={type.code} />
        ))}
      </ol>

      <div className={styles.more}>
        <h3 className={styles.moreHeading}>他の候補も見るなら</h3>
        <p className={styles.moreLead}>
          ブランドを決めずに探すときは、ノート名の組み合わせで引くのが失敗の少ない方法です。
        </p>
        <ul className={styles.queryList}>
          {type.searchQueries.map((q, qi) => (
            <li key={q} className={styles.queryItem}>
              <span className={styles.queryText}>「{queryDisplay(q)}」で探す</span>
              <span className={styles.queryLinks}>
                {MARKETPLACES.map((m) => (
                  <a
                    key={m}
                    href={searchUrl(m, q)}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className={styles.queryLink}
                    onClick={() => track('affiliate_click', { type: type.code, query_index: qi, market: m })}
                  >
                    {MARKETPLACE_LABEL[m]}
                  </a>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.note}>
        商品画像と価格は楽天市場の出品情報によります。最新の価格・在庫は各モールの表示をご確認ください。
        掲載は編集部の選定によるもので、ブランドからの依頼ではありません。
        当サイトはリンク経由の購入で紹介料を受け取ることがあります。
      </p>
    </section>
  );
}

/**
 * 1本ぶんのカード。ブランド名を最上段に大きく置き、商品画像を左に添える。
 *
 * ブランドロゴ画像は使わない。掲載する20ブランドのうち少なくとも15ブランド
 * （CHANEL / エスティ ローダー系5 / LVMH系5 / ロレアル リュクス系3 / エルメス）が、
 * 商標・ロゴの第三者による複製を事前の書面許諾なしに禁じている（各社の利用規約）。
 * 代わりにブランド名を明朝・大きめ・字間広めのワードマークとして組む。
 */
function PickCard({ pick, rank, typeCode }: { pick: ProductPick; rank: number; typeCode: string }) {
  const media = mediaFor(pick);
  return (
    <li className={styles.pick}>
      <p className={styles.brandPlate}>
        <span className={styles.ordinal} aria-hidden="true">
          {ORDINAL[rank] ?? rank + 1}
        </span>
        <span className={styles.brandName}>{pick.brand}</span>
      </p>

      <div className={styles.pickBody}>
        <div className={styles.thumb}>
          {media ? (
            <img
              src={media.image}
              alt={`${pick.brandJa} ${pick.name}`}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className={styles.thumbImg}
            />
          ) : (
            <span className={styles.thumbFallback} aria-hidden="true">
              {pick.brand.slice(0, 1)}
            </span>
          )}
        </div>
        <div className={styles.pickTitle}>
          <p className={styles.brandJa}>{pick.brandJa}</p>
          <p className={styles.product}>{pick.name}</p>
          <p className={styles.kind}>{pick.kind}</p>
          {media ? <p className={styles.price}>楽天市場 {media.price.toLocaleString('ja-JP')}円〜</p> : null}
        </div>
      </div>

      <p className={styles.why}>{pick.why}</p>
      <div className={styles.links}>
        {MARKETPLACES.map((m) => (
          <a
            key={m}
            href={productUrl(m, pick)}
            target="_blank"
            rel="nofollow sponsored noopener"
            className={`${styles.link} ${m === 'rakuten' ? styles.rakuten : styles.amazon}`}
            onClick={() => track('affiliate_click', { type: typeCode, pick: pick.query, rank: rank + 1, market: m })}
          >
            {MARKETPLACE_LABEL[m]}で見る
          </a>
        ))}
      </div>
    </li>
  );
}
