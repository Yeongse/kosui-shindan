import { ACCORD_CODES, type AccordCode } from '@/data/schema';
import { ACCORD_LIQUID, ACCORD_NAME_JA } from '@/data/palette';
import styles from './AccordBars.module.css';

/** 香りのバランス: 8香調を横バー（%）で。合計に対する割合。主香調を強調。 */
export function AccordBars({ scores, primary }: { scores: Record<AccordCode, number>; primary: AccordCode }) {
  const total = Math.max(1, ACCORD_CODES.reduce((a, c) => a + Math.max(0, scores[c]), 0));
  const rows = [...ACCORD_CODES]
    .map((c) => ({ c, pct: Math.round((Math.max(0, scores[c]) / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
  const max = Math.max(1, ...rows.map((r) => r.pct));
  return (
    <ul className={styles.list} aria-label="香りのバランス">
      {rows.map(({ c, pct }) => (
        <li key={c} className={`${styles.row} ${c === primary ? styles.primary : ''}`}>
          <span className={styles.name}>
            <span className={styles.dot} style={{ background: ACCORD_LIQUID[c] }} aria-hidden="true" />
            {ACCORD_NAME_JA[c]}
          </span>
          <span className={styles.track}>
            <span className={styles.bar} style={{ width: `${(pct / max) * 100}%`, background: ACCORD_LIQUID[c] }} />
          </span>
          <span className={styles.pct}>{pct}%</span>
        </li>
      ))}
    </ul>
  );
}
