'use client';

import Link from 'next/link';
import { track } from '@/lib/analytics';
import styles from './ShindanCta.module.css';

type Variant = 'primary' | 'ghost';

interface Props {
  label?: string;
  note?: string;
  variant?: Variant;
  fromSlug?: string;
  align?: 'left' | 'center';
  size?: 'md' | 'lg';
  block?: boolean;
}

export function ShindanCta({
  label = '香水診断をはじめる（無料・90秒）',
  note,
  variant = 'primary',
  fromSlug,
  align = 'left',
  size = 'md',
  block = false,
}: Props) {
  return (
    <div className={`${styles.wrap} ${align === 'center' ? styles.center : ''} ${block ? styles.block : ''}`}>
      <Link
        href="/shindan"
        className={`btn ${variant === 'ghost' ? 'btn--ghost' : ''} ${size === 'lg' ? styles.lg : ''} ${block ? 'btn--block' : ''}`}
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
