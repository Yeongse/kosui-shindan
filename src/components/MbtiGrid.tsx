import Link from 'next/link';
import { Art } from './Art';
import { MBTI_MAP } from '@/data/mbti';
import { TYPE_BY_SLUG } from '@/data/types';
import { TYPE_LIQUID } from '@/data/palette';
import styles from './MbtiGrid.module.css';

/** MBTI 16タイプ × 香水タイプの対応表。記事中に { embed: 'mbti-grid' } で差し込む。
 * リンク先は各タイプの解説ページ。 */
export function MbtiGrid() {
  return (
    <ul className={styles.grid}>
      {MBTI_MAP.map((m) => {
        const t = TYPE_BY_SLUG[m.typeSlug];
        if (!t) return null;
        const liquid = TYPE_LIQUID[t.code];
        return (
          <li key={m.code}>
            <Link href={`/type/${t.slug}`} className={styles.cell}>
              <Art
                src={`/img/types/${t.slug}.webp`}
                alt=""
                className={styles.art}
                imgClassName={styles.artImg}
                style={{ background: liquid }}
                fallback={<div style={{ width: '100%', height: '100%', background: liquid, borderRadius: '50%' }} />}
              />
              <span className={styles.code}>{m.code}</span>
              <span className={styles.name}>{t.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
