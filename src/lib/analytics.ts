/**
 * 計測イベントの薄いフック。
 * 現在はページ解析を Cloudflare Web Analytics に任せているため no-op。
 * 将来イベント計測を入れる場合はここ1箇所を差し替える（呼び出し側は変更不要）。
 *   start_shindan / answer(q_no, key) / complete / share(method, type) /
 *   affiliate_click(type, query_index) / revisit_from_share / guide_to_shindan(slug)
 */
export type EventName =
  | 'start_shindan'
  | 'answer'
  | 'complete'
  | 'share'
  | 'affiliate_click'
  | 'revisit_from_share'
  | 'guide_to_shindan';

export function track(_name: EventName, _params: Record<string, string | number | boolean> = {}): void {
  /* no-op */
}
