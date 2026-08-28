/* eslint-disable no-console */
/**
 * 画像最適化: assets/img（原本・高解像度PNG）→ public/img（配信用 WebP）
 *   npm run img:optimize
 *
 * - assets/img/types/*.png  → public/img/types/*.webp  （512×512）
 * - assets/img/notes/*.png  → public/img/notes/*.webp  （幅 1200、比率維持）
 * - assets/img/hero/*.png   → public/img/hero/*.webp   （幅 1200、比率維持）
 * 原本は assets/ に残す。画像を差し替えたら再実行する。
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const JOBS: { src: string; out: string; width: number; height?: number; quality: number }[] = [
  { src: 'assets/img/types', out: 'public/img/types', width: 512, height: 512, quality: 0.84 },
  { src: 'assets/img/notes', out: 'public/img/notes', width: 1200, quality: 0.82 },
  { src: 'assets/img/hero', out: 'public/img/hero', width: 1200, quality: 0.82 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<canvas id="c"></canvas>');
  let total = 0;
  let totalSrc = 0;
  for (const job of JOBS) {
    const dir = path.resolve(job.src);
    mkdirSync(path.resolve(job.out), { recursive: true });
    const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));
    for (const f of files) {
      const srcPath = path.join(dir, f);
      const b64 = readFileSync(srcPath).toString('base64');
      const mime = /\.png$/i.test(f) ? 'image/png' : 'image/jpeg';
      const dataUrl = await page.evaluate(
        async ({ b64, mime, width, height, quality }) => {
          const img = new Image();
          img.src = `data:${mime};base64,${b64}`;
          await img.decode();
          const w = width;
          const h = height ?? Math.round((img.naturalHeight / img.naturalWidth) * width);
          const c = document.getElementById('c') as HTMLCanvasElement;
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d')!;
          ctx.clearRect(0, 0, w, h);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          return c.toDataURL('image/webp', quality);
        },
        { b64, mime, width: job.width, height: job.height, quality: job.quality },
      );
      const outPath = path.resolve(job.out, f.replace(/\.(png|jpe?g)$/i, '.webp'));
      const buf = Buffer.from(dataUrl.split(',')[1]!, 'base64');
      writeFileSync(outPath, buf);
      const srcSize = statSync(srcPath).size;
      total += buf.length;
      totalSrc += srcSize;
      console.log(`${path.relative(process.cwd(), outPath)}  ${(srcSize / 1024 / 1024).toFixed(2)}MB → ${(buf.length / 1024).toFixed(0)}KB`);
    }
  }
  await browser.close();
  console.log(`\ntotal ${(totalSrc / 1024 / 1024).toFixed(1)}MB → ${(total / 1024 / 1024).toFixed(2)}MB`);
})();
