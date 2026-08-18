'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { GA4_ID, getConsent, setConsent } from '@/lib/analytics';
import styles from './Analytics.module.css';

/**
 * GA4（同意バナー最小構成・§11.4）。
 * - NEXT_PUBLIC_GA4_ID 未設定なら何も描画しない。
 * - Consent Mode: 既定 denied。同意時のみ analytics_storage を granted に更新。
 */
export function Analytics() {
  const [consent, setLocalConsent] = useState<'granted' | 'denied' | null | 'loading'>('loading');

  useEffect(() => {
    setLocalConsent(getConsent());
  }, []);

  if (!GA4_ID) return null;

  const decide = (v: 'granted' | 'denied') => {
    setConsent(v);
    setLocalConsent(v);
  };

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { analytics_storage: '${consent === 'granted' ? 'granted' : 'denied'}', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('js', new Date());
gtag('config', '${GA4_ID}', { anonymize_ip: true });`}
      </Script>
      {consent === null && (
        <div className={styles.banner} role="region" aria-label="アクセス解析の同意">
          <p className={styles.text}>
            サイト改善のため、匿名のアクセス解析（Google Analytics）を利用します。個人を特定する情報は取得しません。
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.deny} onClick={() => decide('denied')}>
              利用しない
            </button>
            <button type="button" className={styles.allow} onClick={() => decide('granted')}>
              同意する
            </button>
          </div>
        </div>
      )}
    </>
  );
}
