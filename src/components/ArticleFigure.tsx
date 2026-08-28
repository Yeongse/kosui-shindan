'use client';

import { useEffect, useRef, useState } from 'react';
import type { ArticleImage } from '@/data/schema';
import styles from './ArticleBody.module.css';

/**
 * 記事中の図版。画像が未配置（404）のときは figure ごと描画しない。
 * 空の枠とキャプションだけが残るより、無いほうが読みやすいため。
 */
export function ArticleFigure({ image }: { image: ArticleImage }) {
  const { src, alt, caption, ratio = '16/9' } = image;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) setFailed(true);
    else setLoaded(true);
  }, [src]);

  if (failed) return null;

  return (
    <figure className={styles.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={styles.figureImg}
        style={{ aspectRatio: ratio, opacity: loaded ? 1 : 0 }}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
      />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
