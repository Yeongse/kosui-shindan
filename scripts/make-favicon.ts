/* eslint-disable no-console */
/**
 * ロゴ画像（public/img/brand/logo-mark.png）から favicon / apple-touch-icon を生成する。
 *   npm run favicon
 * - src/app/icon.png                     512×512（白地の角丸の上にロゴ。透過の外周）
 * - src/app/apple-icon.png               180×180（白地・角丸なし。iOS側で丸められる）
 * - public/img/brand/logo-mark-trim.png  透明余白を切り詰めた版（ヘッダー用。高さ 512、透過）
 * ロゴの透明余白を自動で切り詰め、内側 78% に収める。
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('public/img/brand/logo-mark.png');
const OUT_ICON = path.resolve('src/app/icon.png');
const OUT_APPLE = path.resolve('src/app/apple-icon.png');
const OUT_TRIM = path.resolve('public/img/brand/logo-mark-trim.png');

(async () => {
  const b64 = readFileSync(SRC).toString('base64');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<canvas id="c"></canvas>');
  const render = async (size: number, radius: number, bg: string, trimOnly = false) =>
    page.evaluate(
      async ({ b64, size, radius, bg, trimOnly }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        // 透明余白を検出
        const probe = document.createElement('canvas');
        probe.width = img.naturalWidth;
        probe.height = img.naturalHeight;
        const pc = probe.getContext('2d')!;
        pc.drawImage(img, 0, 0);
        const d = pc.getImageData(0, 0, probe.width, probe.height).data;
        let minX = probe.width, minY = probe.height, maxX = 0, maxY = 0;
        for (let y = 0; y < probe.height; y++) {
          for (let x = 0; x < probe.width; x++) {
            const a = d[(y * probe.width + x) * 4 + 3]!;
            const r = d[(y * probe.width + x) * 4]!;
            const g = d[(y * probe.width + x) * 4 + 1]!;
            const bl = d[(y * probe.width + x) * 4 + 2]!;
            // 透明、またはほぼ白は余白扱い
            if (a > 16 && !(r > 245 && g > 245 && bl > 245)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const c = document.getElementById('c') as HTMLCanvasElement;
        if (trimOnly) {
          // 余白を 6% 残してトリム（高さ = size）
          const pad = Math.round(size * 0.06);
          const sc = (size - pad * 2) / bh;
          c.width = Math.round(bw * sc + pad * 2);
          c.height = size;
          const tctx = c.getContext('2d')!;
          tctx.clearRect(0, 0, c.width, c.height);
          tctx.drawImage(img, minX, minY, bw, bh, pad, pad, bw * sc, bh * sc);
          return c.toDataURL('image/png');
        }
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d')!;
        ctx.clearRect(0, 0, size, size);
        if (bg) {
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.arcTo(size, 0, size, size, radius);
          ctx.arcTo(size, size, 0, size, radius);
          ctx.arcTo(0, size, 0, 0, radius);
          ctx.arcTo(0, 0, size, 0, radius);
          ctx.closePath();
          ctx.fill();
        }
        const inner = size * 0.78;
        const scale = Math.min(inner / bw, inner / bh);
        const dw = bw * scale;
        const dh = bh * scale;
        ctx.drawImage(img, minX, minY, bw, bh, (size - dw) / 2, (size - dh) / 2, dw, dh);
        return c.toDataURL('image/png');
      },
      { b64, size, radius, bg, trimOnly },
    );
  const icon = await render(512, 96, '#ffffff');
  writeFileSync(OUT_ICON, Buffer.from(icon.split(',')[1]!, 'base64'));
  const apple = await render(180, 0, '#ffffff');
  writeFileSync(OUT_APPLE, Buffer.from(apple.split(',')[1]!, 'base64'));
  const trim = await render(512, 0, '', true);
  writeFileSync(OUT_TRIM, Buffer.from(trim.split(',')[1]!, 'base64'));
  await browser.close();
  console.log('wrote', OUT_ICON, OUT_APPLE, OUT_TRIM);
})();
