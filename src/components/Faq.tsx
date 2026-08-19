import { JsonLd } from './JsonLd';
import { faqJsonLd } from '@/lib/seo';
import { toKanji } from '@/lib/kanji';
import styles from './Faq.module.css';

/**
 * FAQ（実テキスト + FAQPage 構造化データ）。
 * 画面表示のテキストと JSON-LD は同一配列から生成し、不一致を構造的に防ぐ（§12.4）。
 * DOM には常に全文が存在する（アコーディオンで畳まない）。
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
      <H id="faq-heading" className={styles.heading}>
        {heading}
      </H>
      <dl className={styles.list}>
        {items.map((f, i) => (
          <div key={i} className={styles.item}>
            <dt className={styles.q}>
              <span className={styles.qNo}>問{toKanji(i + 1)}</span>
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
