/**
 * §12.7 計測イベント（GA4）
 * start_shindan / answer(q_no, key) / complete / share(method, type) /
 * affiliate_click(type, query_index) / revisit_from_share / guide_to_shindan(slug)
 *
 * gtag が未ロード（GA4 未設定・同意なし）の場合は no-op。
 */

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? '';

type EventName =
  | 'start_shindan'
  | 'answer'
  | 'complete'
  | 'share'
  | 'affiliate_click'
  | 'revisit_from_share'
  | 'guide_to_shindan';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: EventName, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', name, params);
  } catch {
    /* no-op */
  }
}

export const CONSENT_KEY = 'chokosen:consent';

export function getConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: 'granted' | 'denied'): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* no-op */
  }
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: v,
    });
  }
}
