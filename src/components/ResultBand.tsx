'use client';

import Link from 'next/link';
import { useResultMode } from './ResultMode';
import { clearAnswers } from '@/lib/storage';
import styles from './ResultBand.module.css';

/**
 * 結果ページ最上部の帯。
 * - 診断済み: 「診断結果」チップ
 * - 直リンク: 「このページは診断結果のサンプルです」+ 診断CTA
 */
export function ResultBand() {
  const { mode } = useResultMode();
  const isResult = mode === 'result';
  return (
    <div className={styles.band} suppressHydrationWarning>
      {isResult ? (
        <p className={styles.text}>
          <span className="chip chip--rose">診断結果</span>
          <span>あなたの調香箋ができました</span>
        </p>
      ) : (
        <>
          <p className={styles.text}>
            <span className="chip chip--lav">サンプル</span>
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
