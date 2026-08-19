'use client';

import type { ScentType } from '@/data/schema';
import { MARKETPLACE_LABEL, queryDisplay, searchUrl, type Marketplace } from '@/lib/affiliate';
import { track } from '@/lib/analytics';
import styles from './AffiliateBlock.module.css';

/** この香りを探す — PR ラベル付き。ノート起点の検索リンクを2クエリ × 2モール。 */
export function AffiliateBlock({ type }: { type: ScentType }) {
  const markets: Marketplace[] = ['rakuten', 'amazon'];
  return (
    <section className={`card ${styles.section}`} aria-labelledby="find-heading">
      <div className={styles.headRow}>
        <h2 id="find-heading" className={`h2 ${styles.heading}`}>
          この香りを探す
        </h2>
        <span className={styles.pr} title="アフィリエイトリンクを含みます">
          PR
        </span>
      </div>
      <p className={styles.lead}>ブランドを決め打ちせず、ノート名の組み合わせで探すのが失敗の少ない方法です。下の言葉でそのまま検索できます。</p>
      <ul className={styles.list}>
        {type.searchQueries.map((q, qi) => (
          <li key={q} className={styles.item}>
            <p className={styles.query}>「{queryDisplay(q)}」で探す</p>
            <div className={styles.links}>
              {markets.map((m) => (
                <a
                  key={m}
                  href={searchUrl(m, q)}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className={`${styles.link} ${m === 'rakuten' ? styles.rakuten : styles.amazon}`}
                  onClick={() => track('affiliate_click', { type: type.code, query_index: qi, market: m })}
                >
                  {MARKETPLACE_LABEL[m]}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.note}>検索結果は各モールの在庫・流行に自動で追従します。当サイトはリンク経由の購入で紹介料を受け取ることがあります。</p>
    </section>
  );
}
