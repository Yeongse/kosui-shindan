import Script from 'next/script';

/**
 * Cloudflare Web Analytics（Cookie 不使用・同意バナー不要）。
 * NEXT_PUBLIC_CF_BEACON_TOKEN が未設定なら何も描画しない。
 */
export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
