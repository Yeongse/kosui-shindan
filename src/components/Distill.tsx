'use client';

import { useEffect, useRef } from 'react';
import styles from './Distill.module.css';

/**
 * §9.3 蒸留演出（2.8s 固定シーケンス・スキップ不可・テキストなし）
 * 0.0-0.8s 満杯の瓶が中央へ移動・拡大
 * 0.8-2.0s 液体が下の空瓶へ細く注がれ、液色が最終タイプの液体色へ収束
 * 2.0-2.8s 新しい瓶にラベルが貼られる（白い矩形がスタンプされる）→ 結果ページへ
 * prefers-reduced-motion: 全体を 0.4s のフェードに置換。
 */
export const DISTILL_DURATION_MS = 2800;
export const DISTILL_REDUCED_MS = 400;

export function Distill({
  fromColor,
  toColor,
  typeName,
  typeCode,
  onDone,
}: {
  fromColor: string;
  toColor: string;
  typeName: string;
  typeCode: string;
  onDone: () => void;
}) {
  const doneRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(
      () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDone();
      },
      reduced ? DISTILL_REDUCED_MS : DISTILL_DURATION_MS,
    );
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-label="回答を蒸留しています"
      style={{ ['--from' as string]: fromColor, ['--to' as string]: toColor } as React.CSSProperties}
    >
      <svg viewBox="0 0 200 320" className={styles.svg} aria-hidden="true">
        <defs>
          <clipPath id="distill-top-clip">
            <path d="M84 40 L116 40 L124 52 L124 110 Q124 116 118 116 L82 116 Q76 116 76 110 L76 52 Z" />
          </clipPath>
          <clipPath id="distill-bottom-clip">
            <path d="M74 200 L126 200 L138 218 L138 298 Q138 306 130 306 L70 306 Q62 306 62 298 L62 218 Z" />
          </clipPath>
        </defs>

        {/* ---- 上の瓶（満杯・傾いて注ぐ） ---- */}
        <g className={styles.topVial}>
          <path
            d="M84 40 L116 40 L124 52 L124 110 Q124 116 118 116 L82 116 Q76 116 76 110 L76 52 Z"
            fill="var(--c-paper-3)"
          />
          <g clipPath="url(#distill-top-clip)">
            <rect x="76" y="40" width="48" height="76" className={styles.topLiquid} />
          </g>
          <path
            d="M92 22 L108 22 L108 34 L116 40 L124 52 L124 110 Q124 116 118 116 L82 116 Q76 116 76 110 L76 52 L84 40 L92 34 Z"
            fill="none"
            stroke="var(--c-sumi)"
            strokeOpacity="0.75"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </g>

        {/* ---- 注ぎ落ちる液体 ---- */}
        <rect x="99" y="120" width="2" height="82" className={styles.stream} />

        {/* ---- 下の瓶（空 → 満たされる） ---- */}
        <g className={styles.bottomVial}>
          <path
            d="M74 200 L126 200 L138 218 L138 298 Q138 306 130 306 L70 306 Q62 306 62 298 L62 218 Z"
            fill="var(--c-paper-3)"
          />
          <g clipPath="url(#distill-bottom-clip)">
            <rect x="62" y="200" width="76" height="106" className={styles.bottomLiquid} />
          </g>
          <path
            d="M86 176 L114 176 L114 190 L126 200 L138 218 L138 298 Q138 306 130 306 L70 306 Q62 306 62 298 L62 218 L74 200 L86 190 Z"
            fill="none"
            stroke="var(--c-sumi)"
            strokeOpacity="0.8"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* ラベル（スタンプ） */}
          <g className={styles.label}>
            <rect x="74" y="232" width="52" height="56" fill="var(--c-paper-3)" stroke="var(--c-kin)" strokeOpacity="0.5" strokeWidth="0.6" />
            <text
              x="100"
              y="252"
              textAnchor="middle"
              fontFamily="var(--ff-display)"
              fontSize="6"
              letterSpacing="1.5"
              fill="var(--c-sumi)"
            >
              調香箋
            </text>
            <text
              x="100"
              y="272"
              textAnchor="middle"
              fontFamily="var(--ff-brush)"
              fontSize="17"
              letterSpacing="3"
              fill="var(--c-sumi)"
            >
              {typeName}
            </text>
            <text
              x="100"
              y="283"
              textAnchor="middle"
              fontFamily="var(--ff-data)"
              fontSize="5.5"
              letterSpacing="1"
              fill="var(--c-sumi)"
              fillOpacity="0.7"
            >
              {typeCode}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
