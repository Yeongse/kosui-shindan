/**
 * ロゴ用の小さな硝子瓶（SVG）。琥珀の液体が半分入った遮光瓶。
 * 装飾は足さない。線は1本、液体は1色。
 */
export function BottleMark({ size = 28, liquid = 'var(--c-amber)' }: { size?: number; liquid?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {/* 液体 */}
      <path d="M8 16 H20 V22.5 Q20 25 17.5 25 H10.5 Q8 25 8 22.5 Z" fill={liquid} />
      {/* 瓶の輪郭 */}
      <path
        d="M11.5 3 H16.5 V7.5 L20 10.5 V22.5 Q20 25 17.5 25 H10.5 Q8 25 8 22.5 V10.5 L11.5 7.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* 栓 */}
      <rect x="10.5" y="1.5" width="7" height="2.2" rx="0.5" fill="currentColor" />
    </svg>
  );
}
