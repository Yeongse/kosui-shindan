'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { TypeCode } from '@/data/schema';
import { batchNoFrom, loadLastResult, type StoredResult } from '@/lib/storage';
import { track } from '@/lib/analytics';

/**
 * 結果ページ（/type/[slug]）の表示モード。
 * - result:   直前に診断を完了した本人（sessionStorage の最新結果と一致）
 * - specimen: シェアURL・検索流入などの直リンク閲覧（Batch No. は SPECIMEN、CTAを差し替え）
 * - pending:  ハイドレーション前（SSR HTML は specimen と同じ見た目で描画される）
 */
export type ResultMode = 'pending' | 'result' | 'specimen';

interface Ctx {
  mode: ResultMode;
  batchNo: string;
  last: StoredResult | null;
}

const ResultCtx = createContext<Ctx>({ mode: 'pending', batchNo: 'SPECIMEN', last: null });

export function ResultModeProvider({
  typeCode,
  digest,
  children,
}: {
  typeCode: TypeCode;
  digest: string | null;
  children: React.ReactNode;
}) {
  const [ctx, setCtx] = useState<Ctx>({ mode: 'pending', batchNo: 'SPECIMEN', last: null });

  useEffect(() => {
    const last = loadLastResult();
    if (last && last.typeCode === typeCode && (!digest || last.digest === digest)) {
      setCtx({ mode: 'result', batchNo: batchNoFrom(last.at), last });
    } else {
      setCtx({ mode: 'specimen', batchNo: 'SPECIMEN', last });
      if (digest) track('revisit_from_share', { type: typeCode });
    }
  }, [typeCode, digest]);

  return <ResultCtx.Provider value={ctx}>{children}</ResultCtx.Provider>;
}

export function useResultMode(): Ctx {
  return useContext(ResultCtx);
}
