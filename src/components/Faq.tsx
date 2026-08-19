import { JsonLd } from './JsonLd';
import { faqJsonLd } from '@/lib/seo';
import styles from './Faq.module.css';

/**
 * FAQ（実テキスト + FAQPage 構造化データ）。画面表示と JSON-LD は同一配列から生成する。
 * DOM には常に全文が存在する（畳まない）。
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
      <dl className={styles.list}>
        {items.map((f, i) => (
          <div key={i} className={`card ${styles.item}`}>
            <dt className={styles.q}>
              <span className={styles.qMark} aria-hidden="true">
                Q
              </span>
              <span>{f.q}</span>
            </dt>
            <dd className={styles.a}>{f.a}</dd>
          </div>
        ))}
      </dl>
      {withJsonLd && <JsonLd data={faqJsonLd([...items])} />}
    </section>
  );
}
