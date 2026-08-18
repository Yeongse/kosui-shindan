'use client';

import { useEffect, useState } from 'react';
import styles from './Vial.module.css';

/**
 * §7.4 蒸留瓶プログレス（シグネチャー要素）
 * 画面右下に固定した小さな硝子瓶。1問回答するごとに上から一滴落ち、液面が 1/12 ずつ上がる。
 * 液体色は回答履歴の加重平均（呼び出し側で混色して渡す）。
 * - level: 0..total
 * - color: 現在の混色（hex）
 * - drop: { key, color } — key が変わるたびに一滴落とす（reduced-motion 時は省略）
 */
export interface VialProps {
  level: number;
  total: number;
  color: string;
  drop?: { key: number; color: string } | null;
  /** 演出用に大きく描画するとき */
  size?: number;
  className?: string;
  /** 固定配置をやめて通常フローに置く */
  inline?: boolean;
  id?: string;
}

const BODY_TOP = 34;
const BODY_BOTTOM = 94;
const BODY_H = BODY_BOTTOM - BODY_TOP;

export function Vial({ level, total, color, drop, size = 56, className, inline = false, id }: VialProps) {
  const ratio = Math.max(0, Math.min(1, total > 0 ? level / total : 0));
  const [activeDrop, setActiveDrop] = useState<{ key: number; color: string } | null>(null);

  useEffect(() => {
    if (!drop) return;
    setActiveDrop(drop);
    const t = window.setTimeout(() => setActiveDrop(null), 480);
    return () => window.clearTimeout(t);
  }, [drop]);

  // 液面のY座標（滴の着地点）
  const surfaceY = BODY_BOTTOM - BODY_H * ratio;

  return (
    <div
      id={id}
      className={`${styles.wrap} ${inline ? styles.inline : styles.fixed} ${className ?? ''}`}
      style={{ ['--vial-size' as string]: `${size}px`, ['--vial-level' as string]: ratio } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 60 100" className={styles.svg}>
        <defs>
          <clipPath id={`${id ?? 'vial'}-clip`}>
            <path d="M18 34 L42 34 L47 42 L47 90 Q47 94 43 94 L17 94 Q13 94 13 90 L13 42 Z" />
          </clipPath>
        </defs>

        {/* 瓶の内側 */}
        <path
          d="M18 34 L42 34 L47 42 L47 90 Q47 94 43 94 L17 94 Q13 94 13 90 L13 42 Z"
          fill="var(--c-glass)"
        />

        {/* 液体（scaleY で液面を制御） */}
        <g clipPath={`url(#${id ?? 'vial'}-clip)`}>
          <rect
            x="13"
            y={BODY_TOP}
            width="34"
            height={BODY_H}
            className={styles.liquid}
            style={{ fill: color }}
          />
          {/* 液面のハイライト */}
          <line
            x1="13"
            x2="47"
            y1={BODY_TOP}
            y2={BODY_TOP}
            className={styles.surface}
            style={{ transform: `translateY(${BODY_H * (1 - ratio)}px)` }}
          />
        </g>

        {/* 滴 */}
        {activeDrop && (
          <circle
            key={activeDrop.key}
            cx="30"
            cy="6"
            r="2.4"
            fill={activeDrop.color}
            className={styles.drop}
            style={{ ['--drop-to' as string]: `${surfaceY - 6}px` } as React.CSSProperties}
          />
        )}

        {/* 輪郭 */}
        <path
          d="M23 14 L37 14 L37 26 L42 34 L47 42 L47 90 Q47 94 43 94 L17 94 Q13 94 13 90 L13 42 L18 34 L23 26 Z"
          fill="none"
          stroke="var(--c-white)"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* 口 */}
        <rect x="21" y="9" width="18" height="5" rx="1" fill="var(--c-white)" fillOpacity="0.85" />
      </svg>
      <span className={`data ${styles.count}`}>
        {String(Math.min(level, total)).padStart(2, '0')}/{total}
      </span>
    </div>
  );
}
