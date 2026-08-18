import { ACCORD_CODES, type AccordCode } from '@/data/schema';

/**
 * 8軸ミニレーダー（SVG）。液体色で塗る。`?d=` から復元、無い場合はタイプ代表値。
 * 最大値で正規化し、主香調が外周に届く形にする。
 */
export function Radar({
  scores,
  color,
  size = 160,
  ink = 'var(--c-sumi)',
  labels = true,
  className,
}: {
  scores: Record<AccordCode, number>;
  color: string;
  size?: number;
  ink?: string;
  labels?: boolean;
  className?: string;
}) {
  const cx = 100;
  const cy = 100;
  const R = 62;
  const max = Math.max(1, ...ACCORD_CODES.map((c) => scores[c]));
  const pts = ACCORD_CODES.map((c, i) => {
    const angle = (Math.PI * 2 * i) / ACCORD_CODES.length - Math.PI / 2;
    const r = (Math.max(0, scores[c]) / max) * R;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
  const rings = [0.33, 0.66, 1];

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label="香調8軸のバランス">
      {rings.map((k) => (
        <polygon
          key={k}
          points={ACCORD_CODES.map((_, i) => {
            const a = (Math.PI * 2 * i) / ACCORD_CODES.length - Math.PI / 2;
            return `${(cx + Math.cos(a) * R * k).toFixed(1)},${(cy + Math.sin(a) * R * k).toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke={ink}
          strokeOpacity={k === 1 ? 0.45 : 0.18}
          strokeWidth="0.8"
        />
      ))}
      {ACCORD_CODES.map((c, i) => {
        const a = (Math.PI * 2 * i) / ACCORD_CODES.length - Math.PI / 2;
        return (
          <line
            key={c}
            x1={cx}
            y1={cy}
            x2={(cx + Math.cos(a) * R).toFixed(1)}
            y2={(cy + Math.sin(a) * R).toFixed(1)}
            stroke={ink}
            strokeOpacity="0.15"
            strokeWidth="0.8"
          />
        );
      })}
      <path d={path} fill={color} fillOpacity="0.55" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      {labels &&
        ACCORD_CODES.map((c, i) => {
          const a = (Math.PI * 2 * i) / ACCORD_CODES.length - Math.PI / 2;
          const lx = cx + Math.cos(a) * (R + 22);
          const ly = cy + Math.sin(a) * (R + 22);
          return (
            <text
              key={c}
              x={lx.toFixed(1)}
              y={(ly + 3.5).toFixed(1)}
              textAnchor="middle"
              fontFamily="var(--ff-data)"
              fontSize="9.5"
              letterSpacing="0.8"
              fill={ink}
              fillOpacity="0.7"
            >
              {c}
            </text>
          );
        })}
    </svg>
  );
}
