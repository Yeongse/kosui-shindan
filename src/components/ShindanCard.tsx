import type { AccordCode, ScentType } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { Art } from './Art';
import { AccordBars } from './AccordBars';
import { ResultLabel } from './ResultLabel';
import styles from './ShindanCard.module.css';

/**
 * 結果カード（調香箋）
 * 丸い絵 → 「あなたの香水タイプは」→ タイプ名 + 読み → キャッチ → タグ → 調香ノート3カード → 香りのバランス
 */
export function ShindanCard({
  type,
  scores,
  animate = true,
  id = 'shindan-card',
}: {
  type: ScentType;
  scores: Record<AccordCode, number>;
  animate?: boolean;
  id?: string;
}) {
  const [accord, temp] = type.code.split('-') as [AccordCode, 'W' | 'C'];
  const tags = [
    `${ACCORD_NAME_JA[accord]}系`,
    temp === 'C' ? 'クール' : 'ウォーム',
    ...type.notes.last.slice(0, 1),
    ...type.notes.middle.slice(0, 1),
  ];
  return (
    <article
      id={id}
      className={`card ${styles.card} ${animate ? styles.animate : ''}`}
      aria-label={`調香箋 ${type.name}`}
      style={{ ['--type' as string]: type.liquidColor } as React.CSSProperties}
    >
      <div className={styles.top}>
        <div className={styles.avatar}>
          <Art
            src={`/img/types/${type.slug}.png`}
            alt=""
            className={styles.avatarArt}
            loading="eager"
            fallback={<span className={styles.avatarFallback} aria-hidden="true" />}
          />
        </div>
        <ResultLabel className={styles.label} />
        <h2 className={styles.name} lang="ja">
          {type.name}
          <span className={styles.kana}>{type.kana}</span>
        </h2>
        <p className={styles.catch}>{type.catch}</p>
        <ul className={styles.tags} aria-label="タグ">
          {tags.map((t) => (
            <li key={t} className={styles.tag}>
              #{t}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.notes}>
        <h3 className={styles.sectionTitle}>調香ノート</h3>
        <div className={styles.noteGrid}>
          {(
            [
              ['トップ', '最初の10分', type.notes.top],
              ['ミドル', '30分〜2時間', type.notes.middle],
              ['ラスト', '2時間〜', type.notes.last],
            ] as const
          ).map(([k, when, list]) => (
            <div key={k} className={styles.noteCard}>
              <p className={styles.noteKey}>
                {k}
                <span className={styles.noteWhen}>{when}</span>
              </p>
              <p className={styles.noteList}>{list.join('・')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.balance}>
        <h3 className={styles.sectionTitle}>香りのバランス</h3>
        <AccordBars scores={scores} primary={accord} />
      </div>
    </article>
  );
}
