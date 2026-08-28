// 調香箋（kosui-shindan.com）UIスクショ取得スクリプト v2
// 変更点:
//   - fullPage をやめ、ページ上部から一定の高さで切り出す clip 方式に変更
//   - 高さは下の CLIP で調整可能（単位: CSSピクセル。出力は3倍の解像度）
//   - 結果ページの待機を5秒に延長（「調合中」で止まる問題の修正）
//   - ローディング画面「調合中」も動画素材として保存
// 使い方:
//   cd ~/dev/kosui-shindan/sns
//   node capture-ui.mjs
// 出力先: ~/dev/kosui-shindan/sns/images/

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://kosui-shindan.com';
const OUT = join(homedir(), 'dev/kosui-shindan/sns/images');
mkdirSync(OUT, { recursive: true });

// ▼ 切り出す高さ（CSSピクセル）。長すぎ/短すぎたらここだけ変えて再実行
const CLIP = {
  top: 2300,    // トップ: ヒーロー〜「この診断でわかること」あたりまで
  types: 3600,  // タイプ一覧: 16タイプのカードグリッドが収まるまで
  type: 2100,   // 各タイプページ: ヘッダー〜調香ノート〜香りのバランスまで
  result: 2600, // 結果ページ: スタンプ〜調香ノート3段まで
};

const W = 390; // モバイル幅

const shot = (page, name, opts = {}) =>
  page.screenshot({ path: join(OUT, `${name}.png`), ...opts });

const clipShot = (page, name, height) =>
  shot(page, name, { clip: { x: 0, y: 0, width: W, height } });

const settle = async (page, ms = 700) => {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
};

const browser = await chromium.launch();
const mobile = await browser.newContext({
  viewport: { width: W, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'ja-JP',
});
const m = await mobile.newPage();

// トップ
await m.goto(BASE + '/');
await settle(m);
await shot(m, 'm01-top-hero');            // ファーストビュー（844px分）
await clipShot(m, 'm02-top-main', CLIP.top);

// 16タイプ一覧
await m.goto(BASE + '/type');
await settle(m);
await clipShot(m, 'm03-types-grid', CLIP.types);

// 代表タイプページ
for (const t of ['gekko', 'kohaku', 'shinkan', 'hakuji']) {
  await m.goto(`${BASE}/type/${t}`);
  await settle(m);
  await clipShot(m, `m04-type-${t}`, CLIP.type);
}

// 診断フロー Q1→Q12（毎回 A を選択）
await m.goto(BASE + '/shindan');
await settle(m);
const OPTION = 'button[class*="option"]';
for (let q = 1; q <= 12; q++) {
  await shot(m, `m10-quiz-q${String(q).padStart(2, '0')}`);
  const first = m.locator(OPTION).first();
  if ((await first.count()) === 0) break;
  await first.click();
  await m.waitForTimeout(900);
}

// ローディング「調合中」（動画のカット⑥用）
await shot(m, 'm19-loading');

// 結果 = 調香箋（アニメーション完了を待つ）
await m.waitForTimeout(5000);
await settle(m);
await shot(m, 'm20-result-viewport');
await clipShot(m, 'm21-result-main', CLIP.result);

await mobile.close();
await browser.close();
console.log('✅ 保存先:', OUT);