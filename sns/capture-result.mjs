// 診断結果画面だけ撮り直すミニスクリプト
// （デザイン更新後の m19-loading / m20-result-viewport / m21-result-main を上書き）
//
// 使い方:
//   cd ~/dev/kosui-shindan/sns
//   node capture-result.mjs
//
// 診断は全問 A で回答（本編と同じ晨光タイプの結果になります）

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://kosui-shindan.com';
const OUT = join(homedir(), 'dev/kosui-shindan/sns/images');
mkdirSync(OUT, { recursive: true });

const RESULT_CLIP_HEIGHT = 2600; // m21の切り出し高さ（CSSピクセル）。必要なら調整

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'ja-JP',
});
const m = await ctx.newPage();

await m.goto(BASE + '/shindan');
await m.waitForLoadState('networkidle').catch(() => {});
await m.waitForTimeout(700);

const OPTION = 'button[class*="option"]';
for (let q = 1; q <= 12; q++) {
  const first = m.locator(OPTION).first();
  if ((await first.count()) === 0) break;
  await first.click();
  await m.waitForTimeout(900);
}

// ローディング「調合中」
await m.screenshot({ path: join(OUT, 'm19-loading.png') });

// 結果表示を待つ
await m.waitForTimeout(5000);
await m.waitForLoadState('networkidle').catch(() => {});
await m.waitForTimeout(500);

await m.screenshot({ path: join(OUT, 'm20-result-viewport.png') });
await m.screenshot({
  path: join(OUT, 'm21-result-main.png'),
  clip: { x: 0, y: 0, width: 390, height: RESULT_CLIP_HEIGHT },
});

await ctx.close();
await browser.close();
console.log('✅ m19 / m20 / m21 を更新:', OUT);
