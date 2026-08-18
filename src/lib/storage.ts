import type { OptionKey, TypeCode } from '@/data/schema';

/**
 * §2 回答状態は sessionStorage、診断履歴（最新3件）は localStorage。
 * すべて try/catch で包み、プライベートモード等で例外を出さない。
 */

const ANSWERS_KEY = 'chokosen:answers';
const LAST_RESULT_KEY = 'chokosen:last-result';
const HISTORY_KEY = 'chokosen:history';

export interface StoredResult {
  typeCode: TypeCode;
  slug: string;
  digest: string;
  at: string; // ISO
  int: number;
  secondary: string;
}

const isBrowser = () => typeof window !== 'undefined';

export function loadAnswers(): OptionKey[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(ANSWERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((k): k is OptionKey => k === 'A' || k === 'B' || k === 'C' || k === 'D');
  } catch {
    return [];
  }
}

export function saveAnswers(answers: readonly OptionKey[]): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch {
    /* no-op */
  }
}

export function clearAnswers(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(ANSWERS_KEY);
  } catch {
    /* no-op */
  }
}

export function saveLastResult(r: StoredResult): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(r));
  } catch {
    /* no-op */
  }
  pushHistory(r);
}

export function loadLastResult(): StoredResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as StoredResult;
    if (!r || typeof r.digest !== 'string' || typeof r.typeCode !== 'string') return null;
    return r;
  } catch {
    return null;
  }
}

export function loadHistory(): StoredResult[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as StoredResult[]).slice(0, 3) : [];
  } catch {
    return [];
  }
}

function pushHistory(r: StoredResult): void {
  try {
    const prev = loadHistory().filter((h) => h.digest !== r.digest);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([r, ...prev].slice(0, 3)));
  } catch {
    /* no-op */
  }
}

/** Batch No. `YYMMDD-HHMM`（§8.4）。ローカル時刻。 */
export function batchNoFrom(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'SPECIMEN';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
