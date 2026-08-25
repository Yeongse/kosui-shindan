'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { AccordCode, TypeCode } from '@/data/schema';
import { decodeDigest } from '@/lib/scoring';
import { batchNoFrom, loadLastResult, type StoredResult } from '@/lib/storage';
import { track } from '@/lib/analytics';

/**
 * 結果ページ（/type/[slug]）の表示モードとスコア。
 * ページは静的HTMLなので、`?d=`（個人のスコア）はマウント後にURLから読み取って差し替える。
 * - result:   直前に診断を完了した本人（sessionStorage の最新結果と一致）
 * - specimen: シェアURL・検索流入などの直リンク閲覧
 * - pending:  ハイドレーション前（静的HTMLはタイプ代表値で描画されている）
 */
export type ResultMode = 'pending' | 'result' | 'specimen';

interface Ctx {
  mode: ResultMode;
  batchNo: string;
  last: StoredResult | null;
  /** URL の ?d= が正しいときだけ入る */
  digest: string | null;
  /** ?d= から復元したスコア。無ければ null（呼び出し側が代表値を使う） */
  scores: Record<AccordCode, number> | null;
}

const ResultCtx = createContext<Ctx>({ mode: 'pending', batchNo: 'SPECIMEN', last: null, digest: null, scores: null });

export function ResultModeProvider({ typeCode, children }: { typeCode: TypeCode; children: React.ReactNode }) {
  const [ctx, setCtx] = useState<Ctx>({ mode: 'pending', batchNo: 'SPECIMEN', last: null, digest: null, scores: null });

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('d');
    const decoded = decodeDigest(raw);
    const digest = decoded ? raw : null;
    const last = loadLastResult();
    if (last && last.typeCode === typeCode && (!digest || last.digest === digest)) {
      setCtx({ mode: 'result', batchNo: batchNoFrom(last.at), last, digest, scores: decoded });
    } else {
      setCtx({ mode: 'specimen', batchNo: 'SPECIMEN', last, digest, scores: decoded });
      if (digest) track('revisit_from_share', { type: typeCode });
    }
  }, [typeCode]);

  return <ResultCtx.Provider value={ctx}>{children}</ResultCtx.Provider>;
}

export function useResultMode(): Ctx {
  return useContext(ResultCtx);
}
