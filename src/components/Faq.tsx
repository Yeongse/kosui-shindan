import { JsonLd } from './JsonLd';
import { faqJsonLd } from '@/lib/seo';
import styles from './Faq.module.css';

/**
 * FAQ（実テキスト + FAQPage 構造化データ）。画面表示と JSON-LD は同一配列から生成する。
 *
 * 各問を <details> で畳む。答えの本文は畳んだ状態でも DOM に存在するので、
 * FAQPage のリッチリザルトにも検索インデックスにも影響しない（Google は折りたたみ内の
 * テキストを通常どおり評価する）。展開しない状態の高さを抑えて、下部のセクションを近づけるのが狙い。
 */
export function Faq({
  items,
  heading,
  headingLevel = 'h2',
  withJsonLd = true,
}: {
  items: readonly { q: string; a: string }[];
  heading: string;
  headingLevel?: 'h2' | 'h3';
  withJsonLd?: boolean;
}) {
  const H = headingLevel;
  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <H id="faq-heading" className={`h2 h2--center ${styles.heading}`}>
        {heading}
      </H>
      <div className={styles.list}>
        {items.map((f, i) => (
          <details key={i} className={`card ${styles.item}`}>
            <summary className={styles.q}>
              <span className={styles.qMark} aria-hidden="true">
                Q
              </span>
              <span className={styles.qText}>{f.q}</span>
              <span className={styles.chevron} aria-hidden="true" />
            </summary>
            <p className={styles.a}>{f.a}</p>
          </details>
        ))}
      </div>
      {withJsonLd && <JsonLd data={faqJsonLd([...items])} />}
    </section>
  );
}
