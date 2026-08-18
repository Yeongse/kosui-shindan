'use client';

import Link from 'next/link';
import { useResultMode } from './ResultMode';
import { clearAnswers } from '@/lib/storage';
import { CONCENTRATION_LABEL, concentrationOf } from '@/lib/scoring';
import styles from './ResultCtas.module.css';

/**
 * §8.4 (10) CTA群
 * 未診断者 → 「自分のタイプを診断する（無料・90秒）」
 * 診断済み → 「香水タイプ一覧を見る」「もう一度診断する」
 */
export function ResultCtas() {
  const { mode } = useResultMode();
  const isResult = mode === 'result';
  return (
    <div className={styles.wrap} suppressHydrationWarning>
      {isResult ? (
        <>
          <Link href="/type" className="btn btn--ghost">
            香水タイプ一覧を見る
          </Link>
          <Link href="/shindan" className="btn" onClick={() => clearAnswers()}>
            もう一度診断する
          </Link>
        </>
      ) : (
        <>
          <Link href="/shindan" className="btn" onClick={() => clearAnswers()}>
            自分のタイプを診断する（無料・90秒）
          </Link>
          <Link href="/type" className="btn btn--ghost">
            香水タイプ一覧を見る
          </Link>
        </>
      )}
    </div>
  );
}

/** 診断済み本人にだけ見せる濃度提案（INT から算出）。直リンク閲覧時は描画しない。 */
export function ConcentrationLine() {
  const { mode, last } = useResultMode();
  if (mode !== 'result' || !last) return null;
  const c = concentrationOf(last.int);
  return (
    <p className={styles.concentration} suppressHydrationWarning>
      <span className={`data ${styles.k}`}>濃度の目安</span>
      <span>{CONCENTRATION_LABEL[c]}</span>
    </p>
  );
}
