import Link from 'next/link';
import type { AccordCode, ScentType } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { Art } from './Art';
import styles from './TypeCard.module.css';

/** タイプカード（LP・一覧・相性で共用）: 丸い絵 + 名前 + 読み + 香調チップ */
export function TypeCard({ type, size = 'md' }: { type: ScentType; size?: 'sm' | 'md' }) {
  const accord = type.code.split('-')[0] as AccordCode;
  const temp = type.code.endsWith('-C') ? 'クール' : 'ウォーム';
  return (
    <Link href={`/type/${type.slug}`} className={`${styles.card} ${size === 'sm' ? styles.sm : ''}`}>
      <div className={styles.avatar} style={{ background: `${type.liquidColor}33` }}>
        <Art
          src={`/img/types/${type.slug}.png`}
          alt=""
          className={styles.avatarArt}
          fallback={<span className={styles.avatarFallback} style={{ background: type.liquidColor }} aria-hidden="true" />}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.name}>
          {type.name}
          <span className={styles.kana}>{type.kana}</span>
        </p>
        <p className={styles.catch}>{type.catch}</p>
        <p className={styles.meta}>
          <span className={styles.tag}>{ACCORD_NAME_JA[accord]}系</span>
          <span className={styles.tag}>{temp}</span>
        </p>
      </div>
    </Link>
  );
}
