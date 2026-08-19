import type { AccordCode, ScentType } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { Radar } from './Radar';
import { RakkanSeal } from './RakkanSeal';
import { BatchNo } from './BatchNo';
import { Art } from './Art';
import styles from './ShindanCard.module.css';

/**
 * 調香箋カード — 色紙仕立て。
 * 上辺ラベル / 調合番号 / 縦書きタイプ名（筆）+ 読み + コード / キャッチ / 調香表 / 8軸レーダー / 丸窓の絵 / 落款印
 * 0.5s で下から 12px 浮上＋フェード。落款印のみ 0.15s 遅れて押される。以降は一切動かさない。
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
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.pharmacy}>
            <span className={styles.pharmacyMain}>香水診断 調香箋</span>
          </p>
          <p className={styles.batch}>
            調合番号 <BatchNo />
          </p>
        </header>

        <div className={styles.body}>
          <div className={styles.nameBlock}>
            <h2 className={`brush ${styles.name}`} lang="ja">
              {type.name}
            </h2>
            <div className={styles.nameMeta}>
              <span className={styles.kana}>{type.kana}</span>
              <span className={styles.code}>{type.code}</span>
              <span className={styles.accord}>
                {ACCORD_NAME_JA[accord]}・{temp === 'C' ? '冷' : '温'}
              </span>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.catchRow}>
              <p className={styles.catch}>{type.catch}</p>
              <div className={styles.window} aria-hidden="true">
                <Art
                  src={`/img/types/${type.slug}.png`}
                  alt=""
                  className={styles.windowArt}
                  fallback={<div className={styles.windowFallback} style={{ background: type.liquidColor }} />}
                />
              </div>
            </div>

            <table className={styles.notes}>
              <caption className="visually-hidden">調香ノート</caption>
              <tbody>
                <tr>
                  <th scope="row">トップ</th>
                  <td>{type.notes.top.join('、')}</td>
                </tr>
                <tr>
                  <th scope="row">ミドル</th>
                  <td>{type.notes.middle.join('、')}</td>
                </tr>
                <tr>
                  <th scope="row">ラスト</th>
                  <td>{type.notes.last.join('、')}</td>
                </tr>
              </tbody>
            </table>

            <div className={styles.bottom}>
              <div className={styles.radar}>
                <Radar scores={scores} color={type.liquidColor} size={150} ink="var(--c-sumi)" />
              </div>
              <div className={styles.seal}>
                <RakkanSeal name={type.name} size={70} animate={animate} id={`${id}-rakkan`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
