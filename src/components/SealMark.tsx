/**
 * ロゴ用の小さな朱印（SVG）。正方形の朱に「箋」を白抜き。
 */
export function SealMark({ size = 30, char = '箋' }: { size?: number; char?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="36" height="36" rx="2" fill="var(--c-shu)" transform="rotate(-2 20 20)" />
      <rect x="5.5" y="5.5" width="29" height="29" fill="none" stroke="var(--c-paper-3)" strokeWidth="1" transform="rotate(-2 20 20)" />
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fontFamily="var(--ff-display)"
        fontWeight="700"
        fontSize="21"
        fill="var(--c-paper-3)"
        transform="rotate(-2 20 20)"
      >
        {char}
      </text>
    </svg>
  );
}
