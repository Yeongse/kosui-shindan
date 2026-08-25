/**
 * 落款印（判子）: 朱の角印にタイプ名2文字を白抜きで縦に。結果カード・一覧で使う。
 */
export function Stamp({ name, size = 56, className }: { name: string; size?: number; className?: string }) {
  const chars = Array.from(name).slice(0, 2);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={`印 ${name}`}>
      <rect x="3" y="3" width="94" height="94" rx="8" fill="#E0492F" />
      <rect x="9" y="9" width="82" height="82" rx="4" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
      <text x="50" y="45" textAnchor="middle" fontFamily="var(--ff-display)" fontWeight="700" fontSize="36" fill="#fff">
        {chars[0] ?? ''}
      </text>
      <text x="50" y="84" textAnchor="middle" fontFamily="var(--ff-display)" fontWeight="700" fontSize="36" fill="#fff">
        {chars[1] ?? ''}
      </text>
    </svg>
  );
}
