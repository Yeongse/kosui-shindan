'use client';

import Link from 'next/link';
import { useResultMode } from './ResultMode';
import { clearAnswers } from '@/lib/storage';
import styles from './ResultBand.module.css';

/**
 * 結果ページ最上部の帯。
 * - 診断済み: 「診断結果 — あなたの調香箋」
 * - 直リンク: 「この箋は誰かの調香箋です」+ CTA「自分のタイプを診断する（無料・90秒）」
 * SSR は specimen と同じ見た目で描画し、CLS を出さないよう高さを揃える。
 */
export function ResultBand() {
  const { mode } = useResultMode();
  const isResult = mode === 'result';
  return (
    <div className={`${styles.band} ${isResult ? styles.result : ''}`} suppressHydrationWarning>
      {isResult ? (
        <p className={styles.text}>
          <span className={`data ${styles.k}`}>RESULT</span>
          <span>診断結果 — あなたの調香箋</span>
        </p>
      ) : (
        <>
          <p className={styles.text}>
            <span className={`data ${styles.k}`}>SPECIMEN</span>
            <span>この箋は誰かの調香箋です。</span>
          </p>
          <Link href="/shindan" className={styles.cta} onClick={() => clearAnswers()}>
            自分のタイプを診断する（無料・90秒）
          </Link>
        </>
      )}
    </div>
  );
}
