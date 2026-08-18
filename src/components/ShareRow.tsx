'use client';

import { useState } from 'react';
import type { AccordCode, ScentType } from '@/data/schema';
import { track } from '@/lib/analytics';
import { downloadBlob, generateStoryImage, lineShareUrl, shareUrlFor, xIntentUrl } from '@/lib/share';
import { useResultMode } from './ResultMode';
import styles from './ShareRow.module.css';

/**
 * §10.1 シェア手段（この順で横並び）: X / LINE / 画像を保存 / リンクをコピー
 */
export function ShareRow({
  type,
  digest,
  scores,
}: {
  type: ScentType;
  digest: string | null;
  scores: Record<AccordCode, number>;
}) {
  const { batchNo } = useResultMode();
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
      showToast('写しました');
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
      <h2 id="share-heading" className={styles.heading}>
        この調香箋をシェアする
      </h2>
      <div className={styles.row}>
        <a
          href={xIntentUrl(type, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
          data-share="x"
          onClick={() => track('share', { method: 'x', type: type.code })}
        >
          <span className={`data ${styles.k}`}>X</span>
          <span>ポストする</span>
        </a>
        <a
          href={lineShareUrl(type, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
          data-share="line"
          onClick={() => track('share', { method: 'line', type: type.code })}
        >
          <span className={`data ${styles.k}`}>LINE</span>
          <span>送る</span>
        </a>
        <button type="button" className={styles.btn} onClick={onImage} disabled={busy} data-share="image">
          <span className={`data ${styles.k}`}>IMG</span>
          <span>{busy ? '作成中' : '画像を保存'}</span>
        </button>
        <button type="button" className={styles.btn} onClick={onCopy} data-share="copy">
          <span className={`data ${styles.k}`}>URL</span>
          <span>リンクをコピー</span>
        </button>
      </div>
      <p className={styles.note}>保存した縦長の画像は、Instagramストーリーズにそのまま貼れます。</p>
      <div className={styles.toastWrap} aria-live="polite">
        {toast && <span className={styles.toast}>{toast}</span>}
      </div>
    </section>
  );
}
