import { defineConfig, devices } from '@playwright/test';

/**
 * §13.2 E2E — 390px 幅で LP→12問→結果→Xシェア intent 検証→図鑑遷移 の1本。
 * 事前に `npm run build` 済みであること（webServer が out/ を静的配信する）。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3199',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  },
  // 静的出力（out/）を Cloudflare と同じ URL 解決で配信して検証する
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'PORT=3199 npx tsx scripts/serve-out.ts',
        url: 'http://localhost:3199',
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
