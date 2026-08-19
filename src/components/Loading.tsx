'use client';

import { useEffect, useRef } from 'react';
import styles from './Loading.module.css';

/** 結果までのつなぎ（1.8s）。3つの丸がタイプの色に染まりながら揺れる。 */
export function Loading({ color, durationMs, onDone }: { color: string; durationMs: number; onDone: () => void }) {
  const doneRef = useRef(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(
      () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDone();
      },
      reduced ? 400 : durationMs,
    );
    return () => window.clearTimeout(t);
  }, [durationMs, onDone]);

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label="結果を調合しています" style={{ ['--type' as string]: color } as React.CSSProperties}>
      <div className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <p className={styles.text}>あなたに似合う香りを調合中</p>
    </div>
  );
}
