import type { ArticleSection } from '@/data/schema';
import styles from './ArticleBody.module.css';

/**
 * ノート解説・ガイド記事の本文描画。結果ページの本文様式を流用（§8.6）。
 * すべての本文は初回HTMLに含まれる（クライアント遅延描画にしない・§12.5）。
 */
export function ArticleBody({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className={styles.article}>
      {sections.map((s, i) => (
        <section key={i} className={styles.section}>
          <h2 className={styles.h2}>{s.heading}</h2>
          {s.blocks.map((b, j) =>
            typeof b === 'string' ? (
              <p key={j} className={styles.p}>
                {b}
              </p>
            ) : (
              <ul key={j} className={styles.ul}>
                {b.list.map((item, k) => (
                  <li key={k} className={styles.li}>
                    {item}
                  </li>
                ))}
              </ul>
            ),
          )}
        </section>
      ))}
    </div>
  );
}

export function ArticleMeta({ publishedAt, updatedAt }: { publishedAt: string; updatedAt: string }) {
  return (
    <p className={`data ${styles.meta}`}>
      <span>公開 {publishedAt.replace(/-/g, '.')}</span>
      {updatedAt !== publishedAt && <span>更新 {updatedAt.replace(/-/g, '.')}</span>}
    </p>
  );
}
