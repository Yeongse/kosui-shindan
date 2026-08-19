import { Art } from './Art';

/**
 * ロゴマーク。public/img/brand/logo-mark.png があればそれを使い、無ければ既定のSVG（朱の角印に白い一滴）。
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <Art
      src="/img/brand/logo-mark.png"
      alt=""
      width={size}
      height={size}
      loading="eager"
      style={{ width: size, height: size, flexShrink: 0 }}
      imgClassName="logo-mark-img"
      fallback={
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <rect x="2" y="2" width="36" height="36" rx="6" fill="#E0492F" />
          <rect x="5.5" y="5.5" width="29" height="29" rx="3" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
          <path
            d="M20 10.5 C20 10.5, 12.5 18.8, 12.5 23.6 C12.5 27.9 15.9 30.8 20 30.8 C24.1 30.8 27.5 27.9 27.5 23.6 C27.5 18.8 20 10.5 20 10.5 Z"
            fill="#fff"
          />
        </svg>
      }
    />
  );
}
