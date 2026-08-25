'use client';

import { useResultMode } from './ResultMode';

/** 結果カードの見出しラベル: 本人なら「あなたの香水タイプは」、直リンクなら「この香水タイプは」 */
export function ResultLabel({ className }: { className?: string }) {
  const { mode } = useResultMode();
  return (
    <p className={className} suppressHydrationWarning>
      {mode === 'result' ? 'あなたの香水タイプは' : 'この香水タイプは'}
    </p>
  );
}
