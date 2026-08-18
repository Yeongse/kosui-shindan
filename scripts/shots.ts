/* eslint-disable no-console */
/**
 * 開発用: 主要ページのフルページスクリーンショットを撮る（目視検収・§13.3）
 *   BASE=http://localhost:3123 OUT=/tmp/shots npx tsx scripts/shots.ts [width]
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:3123';
const OUT = process.env.OUT ?? path.resolve('scratch-shots');
const width = Number(process.argv[2] ?? 1280);
const pages = (process.env.PAGES ?? '/,/type,/type/gekko,/notes/musk,/guide/how-to-choose,/shindan,/about').split(',');

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const name = (p === '/' ? 'home' : p.replace(/^\//, '').replace(/[/?=&]/g, '_')) + `-${width}.png`;
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    console.log('shot', name);
  }
  await browser.close();
})();
