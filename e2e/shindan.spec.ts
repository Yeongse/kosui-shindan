import { expect, test } from '@playwright/test';

/**
 * §13.2: LP → 12問回答 → 結果表示 → Xシェア intent URL の検証 → 図鑑遷移（390px幅）
 */
test('LP → 12 answers → result → X share intent → type index', async ({ page }) => {
  // LP
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('あなたに似合う香水がわかる');
  await page.getByRole('link', { name: '香水診断をはじめる（無料・90秒）' }).first().click();
  await expect(page).toHaveURL(/\/shindan$/);

  // 12問（選択→350ms自動遷移）。回答は決定的な固定パターン。
  const pattern = ['A', 'D', 'D', 'B', 'D', 'D', 'D', 'C', 'A', 'A', 'D', 'D'];
  for (let i = 0; i < 12; i++) {
    await expect(page.locator(`[data-qno="${i + 1}"]`)).toBeVisible();
    await page.locator(`button[data-key="${pattern[i]}"]`).click();
    if (i < 11) {
      await expect(page.locator(`[data-qno="${i + 2}"]`)).toBeVisible({ timeout: 3000 });
    }
  }

  // 蒸留演出（2.8s）→ 結果ページ
  await expect(page.getByRole('status', { name: '結果を調合しています' })).toBeVisible();
  await page.waitForURL(/\/type\/gekko\?d=[0-9a-f]{16}$/, { timeout: 10_000 });

  // 結果モード（本人）
  await expect(page.getByText('あなたの調香箋ができました')).toBeVisible();
  await expect(page.locator('#shindan-card')).toBeVisible();
  await expect(page.locator('#shindan-card')).toContainText('あなたの香水タイプは');

  // タイプ名・調香ノート
  await expect(page.locator('#shindan-card h2')).toContainText('月虹');
  await expect(page.locator('#shindan-card')).toContainText('ペアー・アルデハイド');

  // X シェア intent URL
  const x = page.locator('a[data-share="x"]');
  const href = await x.getAttribute('href');
  expect(href).toBeTruthy();
  const u = new URL(href!);
  expect(u.hostname).toBe('x.com');
  const text = u.searchParams.get('text') ?? '';
  expect(text).toContain('私の調香箋は「月虹（げっこう）」でした。');
  expect(text).toContain('#調香箋 #香水診断');
  expect(text).toMatch(/\/type\/gekko\?d=[0-9a-f]{16}/);

  // 図鑑へ
  await page.getByRole('link', { name: '香水タイプ一覧を見る' }).click();
  await expect(page).toHaveURL(/\/type$/);
  await expect(page.locator('h1')).toHaveText('香水診断・全16タイプ一覧');
});

test('shared link (未診断者) shows SPECIMEN and swaps CTA', async ({ page }) => {
  await page.goto('/type/gekko?d=050f110003030203');
  await expect(page.getByText('この箋は誰かの調香箋です。')).toBeVisible();
  await expect(page.locator('#shindan-card')).toContainText('この香水タイプは');
  await expect(page.getByRole('link', { name: '自分のタイプを診断する（無料・90秒）' }).first()).toBeVisible();
  // canonical はクエリなし
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toMatch(/\/type\/gekko$/);
  // OG はビルド時生成の静的画像
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toContain('/og/type-gekko.png');

  // ?d= はクライアントで解決され、シェアURLに引き継がれる
  const href = await page.locator('a[data-share="x"]').getAttribute('href');
  expect(decodeURIComponent(href ?? '')).toContain('/type/gekko?d=050f110003030203');
});

test('静的出力: 404ページ・旧URLリダイレクト・sitemap/robots', async ({ page, request }) => {
  const notFound = await request.get('/type/does-not-exist', { maxRedirects: 0 });
  expect(notFound.status()).toBe(404);
  expect(await notFound.text()).toContain('ページが見つかりません');

  const old = await request.get('/q', { maxRedirects: 0 });
  expect(old.status()).toBe(301);
  expect(old.headers()['location']).toBe('/shindan');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('https://kosui-shindan.com/type/gekko');

  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://kosui-shindan.com/sitemap.xml');

  const og = await request.get('/og/type-gekko.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');

  await page.goto('/type/gekko');
  await expect(page.locator('#shindan-card')).toBeVisible();
});

test('選択肢の縦位置は設問の長さに関わらず一定', async ({ page }) => {
  await page.goto('/shindan');
  await expect(page.locator('[data-qno="1"]')).toBeVisible();
  const yOf = async () => {
    await page.waitForTimeout(400); // 切替アニメーション（220ms）の完了を待つ
    return (await page.locator('button[data-key="A"]').boundingBox())!.y;
  };
  const y1 = await yOf();
  // Q1 → Q2 → … Q9（大切な人に気持ちを伝えるとき…＝最長タイの2行）まで進めて比較
  for (let i = 1; i < 9; i++) {
    await page.locator('button[data-key="A"]').click();
    await expect(page.locator(`[data-qno="${i + 1}"]`)).toBeVisible({ timeout: 3000 });
  }
  const y9 = await yOf();
  expect(Math.abs(y9 - y1)).toBeLessThanOrEqual(1);
});
