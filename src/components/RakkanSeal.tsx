import styles from './RakkanSeal.module.css';

/**
 * §7.5 落款印
 * タイプ名2文字を刻んだ正方形の朱印。白抜き、二文字を縦に組む。
 * かすれ表現として feTurbulence フィルタをこの1箇所だけ使用。--c-rakkan は印影専用。
 */
export function RakkanSeal({
  name,
  size = 64,
  animate = false,
  className,
  id = 'rakkan',
}: {
  name: string; // 2文字
  size?: number;
  animate?: boolean;
  className?: string;
  id?: string;
}) {
  const chars = Array.from(name).slice(0, 2);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${styles.seal} ${animate ? styles.animate : ''} ${className ?? ''}`}
      role="img"
      aria-label={`落款印 ${name}`}
    >
      <defs>
        <filter id={`${id}-kasure`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25"
            result="alpha"
          />
          <feComposite in="SourceGraphic" in2="alpha" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-kasure)`}>
        <rect x="4" y="4" width="92" height="92" rx="3" fill="var(--c-rakkan)" />
        {/* 内枠（白抜きの細線） */}
        <rect x="10" y="10" width="80" height="80" rx="1" fill="none" stroke="var(--c-paper)" strokeWidth="1.6" />
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fontFamily="var(--ff-display)"
          fontWeight="700"
          fontSize="34"
          fill="var(--c-paper)"
        >
          {chars[0] ?? ''}
        </text>
        <text
          x="50"
          y="83"
          textAnchor="middle"
          fontFamily="var(--ff-display)"
          fontWeight="700"
          fontSize="34"
          fill="var(--c-paper)"
        >
          {chars[1] ?? ''}
        </text>
      </g>
    </svg>
  );
}
