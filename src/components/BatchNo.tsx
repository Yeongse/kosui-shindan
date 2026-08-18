'use client';

import { useResultMode } from './ResultMode';

/** 調香箋カードの Batch No.（診断日時から生成 / 直リンク閲覧時は SPECIMEN） */
export function BatchNo({ className }: { className?: string }) {
  const { batchNo } = useResultMode();
  return (
    <span className={className} suppressHydrationWarning>
      {batchNo}
    </span>
  );
}
