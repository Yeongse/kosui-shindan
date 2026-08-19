/** 1〜99 を漢数字に（一、二、…、十、十一、…、二十、二十一…） */
export function toKanji(n: number): string {
  const d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n <= 0 || n >= 100 || !Number.isInteger(n)) return String(n);
  if (n < 10) return d[n]!;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens === 1 ? '' : d[tens]}十${ones ? d[ones] : ''}`;
}
