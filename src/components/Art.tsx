'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 画像スロット。画像が未配置（404）のときは fallback を表示し、レイアウトを崩さない。
 * SSR 直後に失敗した画像（ハイドレーション前に error が発火したもの）も、マウント時に
 * naturalWidth === 0 を見て検出する。
 */
export function Art({
  src,
  alt,
  className,
  imgClassName,
  fallback,
  width,
  height,
  loading = 'lazy',
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: React.ReactNode;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth === 0) setFailed(true);
      else setLoaded(true);
    }
  }, [src]);

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {fallback && (
        <div aria-hidden={!failed} style={{ position: 'absolute', inset: 0 }}>
          {fallback}
        </div>
      )}
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          className={imgClassName}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            // 読み込み完了まで alt テキストを見せない
            opacity: loaded ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
        />
      )}
    </div>
  );
}
