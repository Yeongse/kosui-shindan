'use client';

import Link from 'next/link';
import { track } from '@/lib/analytics';
import styles from './ShindanCta.module.css';

type Variant = 'primary' | 'ghost';

interface Props {
  /** ボタン文言（§1.1 語彙の二層ルール: 機能は直訳） */
  label?: string;
  /** ボタン下の一行注釈 */
  note?: string;
  variant?: Variant;
  /** GA4 guide_to_shindan(slug) 用。記事からの遷移時に渡す */
  fromSlug?: string;
  align?: 'left' | 'center';
  size?: 'md' | 'lg';
}

export function ShindanCta({
  label = '香水診断をはじめる（無料・90秒）',
  note,
  variant = 'primary',
  fromSlug,
  align = 'left',
  size = 'md',
}: Props) {
  return (
    <div className={`${styles.wrap} ${align === 'center' ? styles.center : ''}`}>
      <Link
        href="/shindan"
        className={`btn ${variant === 'ghost' ? 'btn--ghost' : ''} ${size === 'lg' ? styles.lg : ''}`}
        onClick={() => {
          if (fromSlug) track('guide_to_shindan', { slug: fromSlug });
        }}
      >
        {label}
      </Link>
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
