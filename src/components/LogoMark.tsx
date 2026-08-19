/** ロゴマーク: ローズ→ラベンダーの丸角に白い一滴 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF6B9A" />
          <stop offset="1" stopColor="#A48CFF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#logo-grad)" />
      <path
        d="M20 9.5 C20 9.5, 12 18.5, 12 23.5 C12 28 15.6 31 20 31 C24.4 31 28 28 28 23.5 C28 18.5 20 9.5 20 9.5 Z"
        fill="#fff"
      />
      <circle cx="16.8" cy="24" r="1.8" fill="#FFD1E0" />
    </svg>
  );
}
