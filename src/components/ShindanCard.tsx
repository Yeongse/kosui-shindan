import type { AccordCode, ScentType } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { Radar } from './Radar';
import { RakkanSeal } from './RakkanSeal';
import { BatchNo } from './BatchNo';
import styles from './ShindanCard.module.css';

/**
 * §8.4 調香箋カード（--c-paper の紙面。ページ内で唯一の明部）
 * 上辺ラベル / Batch No. / 縦書きタイプ名 + 読み + コード / キャッチ / 調香表 / 8軸レーダー / 落款印
 * §9.4: 0.5s で下から 12px 浮上＋フェード。落款印のみ 0.15s 遅れて押される。以降は一切動かさない。
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
  return (
    <article id={id} className={`${styles.card} ${animate ? styles.animate : ''}`} aria-label={`調香箋 ${type.name}`}>
      <header className={styles.head}>
        <p className={`${styles.mono} ${styles.pharmacy}`}>
          CHOKOSEN PHARMACY<span className={styles.pharmacySuffix}> — 香水診断・調香箋</span>
        </p>
        <p className={`${styles.mono} ${styles.batch}`}>
          Batch No. <BatchNo />
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.nameBlock}>
          <h2 className={styles.name} lang="ja">
            {type.name}
          </h2>
          <div className={styles.nameMeta}>
            <span className={styles.kana}>{type.kana}</span>
            <span className={`${styles.mono} ${styles.code}`}>{type.code}</span>
            <span className={`${styles.mono} ${styles.accord}`}>
              {ACCORD_NAME_JA[accord]} / {temp === 'C' ? 'COOL' : 'WARM'}
            </span>
          </div>
        </div>

        <div className={styles.main}>
          <p className={styles.catch}>{type.catch}</p>

          <table className={styles.notes}>
            <caption className="visually-hidden">調香ノート</caption>
            <tbody>
              <tr>
                <th scope="row" className={styles.mono}>
                  Top
                </th>
                <td>{type.notes.top.join('、')}</td>
              </tr>
              <tr>
                <th scope="row" className={styles.mono}>
                  Middle
                </th>
                <td>{type.notes.middle.join('、')}</td>
              </tr>
              <tr>
                <th scope="row" className={styles.mono}>
                  Last
                </th>
                <td>{type.notes.last.join('、')}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.bottom}>
            <div className={styles.radar}>
              <Radar scores={scores} color={type.liquidColor} size={150} />
            </div>
            <div className={styles.seal}>
              <RakkanSeal name={type.name} size={66} animate={animate} id={`${id}-rakkan`} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
