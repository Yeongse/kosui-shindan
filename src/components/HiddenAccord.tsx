'use client';

import Link from 'next/link';
import type { AccordCode } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { rankAccords } from '@/lib/scoring';
import { useResultMode } from './ResultMode';

const NOTE_SLUG_BY_ACCORD: Record<AccordCode, string> = {
  CIT: 'citrus',
  GRN: 'green',
  FLR: 'floral',
  FRT: 'fruity',
  GRM: 'gourmand',
  WDY: 'woody',
  AMB: 'amber',
  MSK: 'musk',
};

/**
 * 隠し香調（secondary accord）。静的HTMLではタイプ代表値の値を出し、
 * `?d=` がある場合はマウント後に本人のスコアで差し替える。
 */
export function HiddenAccord({ primary, fallbackSecondary }: { primary: AccordCode; fallbackSecondary: AccordCode }) {
  const { scores } = useResultMode();
  const secondary = scores ? ((rankAccords(scores).find((c) => c !== primary) ?? fallbackSecondary) as AccordCode) : fallbackSecondary;
  return (
    <span suppressHydrationWarning>
      {`あなたの箋には${ACCORD_NAME_JA[secondary]}が一滴だけ混ざっています。`}{' '}
      <Link href={`/notes/${NOTE_SLUG_BY_ACCORD[secondary]}`} className="link">
        {`${ACCORD_NAME_JA[secondary]}系の香水とは`}
      </Link>
    </span>
  );
}
