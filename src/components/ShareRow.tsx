'use client';

import { useState } from 'react';
import type { AccordCode, ScentType } from '@/data/schema';
import { track } from '@/lib/analytics';
import { downloadBlob, generateStoryImage, shareUrlFor, xIntentUrl } from '@/lib/share';
import { useResultMode } from './ResultMode';
import styles from './ShareRow.module.css';

const IconX = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
    <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L1.5 3h6.4l4.4 5.9L17.5 3zm-1.1 16.2h1.7L7.1 4.7H5.3l11.1 14.5z" />
  </svg>
);
const IconImage = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="9" cy="9" r="2" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
  </svg>
);

/** シェア: X / 画像を保存 / リンクをコピー */
export function ShareRow({
  type,
  scores: fallbackScores,
}: {
  type: ScentType;
  /** 静的HTML用のタイプ代表値。`?d=` があれば本人のスコアで共有画像を作る */
  scores: Record<AccordCode, number>;
}) {
  const { batchNo, digest, scores: personal } = useResultMode();
  const scores = personal ?? fallbackScores;
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const url = shareUrlFor(type, digest);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('リンクをコピーしました');
      track('share', { method: 'copy', type: type.code });
    } catch {
      showToast('コピーできませんでした');
    }
  };

  const onImage = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await generateStoryImage({ type, scores, batchNo });
      downloadBlob(blob, `chokosen-${type.slug}.png`);
      track('share', { method: 'image', type: type.code });
      showToast('画像を保存しました');
    } catch {
      showToast('画像を作れませんでした');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="share-heading">
      <h2 id="share-heading" className={`h2 h2--center ${styles.heading}`}>
        結果をシェアする
      </h2>
      <div className={styles.row}>
        <a
          href={xIntentUrl(type, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btn} ${styles.x}`}
          data-share="x"
          onClick={() => track('share', { method: 'x', type: type.code })}
        >
          <span className={styles.icon}>
            <IconX />
          </span>
          <span>X</span>
        </a>
        <button type="button" className={`${styles.btn} ${styles.image}`} onClick={onImage} disabled={busy} data-share="image">
          <span className={styles.icon}>
            <IconImage />
          </span>
          <span>{busy ? '作成中' : '画像を保存'}</span>
        </button>
        <button type="button" className={`${styles.btn} ${styles.copy}`} onClick={onCopy} data-share="copy">
          <span className={styles.icon}>
            <IconLink />
          </span>
          <span>リンク</span>
        </button>
      </div>
      <p className={styles.note}>保存した縦長の画像は、Instagramのストーリーズにそのまま貼れます。</p>
      <div className={styles.toastWrap} aria-live="polite">
        {toast && <span className={styles.toast}>{toast}</span>}
      </div>
    </section>
  );
}
