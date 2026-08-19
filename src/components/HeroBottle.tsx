import styles from './HeroBottle.module.css';

/**
 * §8.1 / §9.1 LPヒーローの硝子瓶。琥珀の液体が ±2px / 6s で揺れる ambient ループ（液体だけが動く）。
 * 遮光瓶のシルエット + 液面 + 一枚のラベル。装飾は足さない。
 */
export function HeroBottle() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 160 260"
      role="img"
      aria-label="琥珀色の液体が入った硝子瓶"
    >
      <defs>
        <clipPath id="hero-bottle-body">
          <path d="M52 78 L108 78 L120 96 L120 232 Q120 244 108 244 L52 244 Q40 244 40 232 L40 96 Z" />
        </clipPath>
        <linearGradient id="hero-glass-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 瓶の内側の暗さ */}
      <path
        d="M52 78 L108 78 L120 96 L120 232 Q120 244 108 244 L52 244 Q40 244 40 232 L40 96 Z"
        fill="var(--c-paper-2)"
      />

      {/* 液体（揺れる） */}
      <g clipPath="url(#hero-bottle-body)">
        <g className={styles.liquid}>
          <path
            d="M20 150 Q50 144 80 150 T140 150 L140 260 L20 260 Z"
            fill="var(--c-kin-pale)"
            opacity="0.9"
          />
          {/* 液面のハイライト */}
          <path d="M20 150 Q50 144 80 150 T140 150" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" />
        </g>
      </g>

      {/* 硝子の照り */}
      <path
        d="M52 78 L108 78 L120 96 L120 232 Q120 244 108 244 L52 244 Q40 244 40 232 L40 96 Z"
        fill="url(#hero-glass-sheen)"
      />

      {/* 輪郭 */}
      <path
        d="M62 30 L98 30 L98 62 L108 78 L120 96 L120 232 Q120 244 108 244 L52 244 Q40 244 40 232 L40 96 L52 78 L62 62 Z"
        fill="none"
        stroke="var(--c-sumi)"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* 栓 */}
      <rect x="58" y="16" width="44" height="14" rx="2" fill="var(--c-sumi)" fillOpacity="0.8" />
      <rect x="62" y="30" width="36" height="6" fill="var(--c-sumi)" fillOpacity="0.25" />

      {/* ラベル（薬包紙） */}
      <rect x="54" y="118" width="52" height="60" fill="var(--c-paper-3)" fillOpacity="1" />
      <text
        x="80"
        y="140"
        textAnchor="middle"
        fontFamily="var(--ff-data)"
        fontSize="6.5"
        letterSpacing="1.2"
        fill="var(--c-sumi)"
      >
        CHOKOSEN
      </text>
      <text
        x="80"
        y="158"
        textAnchor="middle"
        fontFamily="var(--ff-display)"
        fontSize="13"
        letterSpacing="2"
        fill="var(--c-sumi)"
      >
        調香箋
      </text>
      <line x1="60" y1="166" x2="100" y2="166" stroke="var(--c-sumi)" strokeOpacity="0.35" strokeWidth="0.6" />
      <text
        x="80"
        y="174"
        textAnchor="middle"
        fontFamily="var(--ff-data)"
        fontSize="5"
        letterSpacing="0.6"
        fill="var(--c-sumi)"
        fillOpacity="0.7"
      >
        12 Q · 90 SEC
      </text>
    </svg>
  );
}
