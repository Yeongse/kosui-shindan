import Link from 'next/link';
import { TYPE_BY_SLUG } from '@/data/types';
import styles from './TypeOgCards.module.css';

/**
 * 香水タイプの横長カード。OG画像（1200×630）をそのまま記事中に差し込む。
 * 記事から { embed: 'types', slugs: ['gekko', 'setto'] } で呼ぶ。
 */
export function TypeOgCards({ slugs }: { slugs: string[] }) {
  const types = slugs.map((s) => TYPE_BY_SLUG[s]).filter((t) => t !== undefined);
  if (types.length === 0) return null;
  return (
    <div className={styles.wrap}>
      {types.map((t) => (
        <figure key={t.slug} className={styles.figure}>
          <Link href={`/type/${t.slug}`} className={styles.link}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/og/type-${t.slug}.png`}
              alt={`${t.name}（${t.kana}）タイプの調香箋。${t.catch}`}
              width={1200}
              height={630}
              loading="lazy"
              decoding="async"
              className={styles.img}
            />
          </Link>
          <figcaption className={styles.caption}>
            <Link href={`/type/${t.slug}`} className={styles.capLink}>
              {t.name}（{t.kana}）— {t.catch}
            </Link>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
