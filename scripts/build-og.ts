/* eslint-disable no-console */
/**
 * OG画像のビルド時生成: public/og/*.png
 *   npm run og:build（build の前段で自動実行される）
 *
 * - public/og/type-{slug}.png   ×16（タイプの結果カード風）
 * - public/og/note-{slug}.png   ×8（香りノート解説）
 * - public/og/guide-{slug}.png  ×16（ガイド記事）
 * - public/og/default.png       （LP・その他）
 * フォントは assets/og-fonts/*.woff（npm run og:fonts で再生成）。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { TYPES } from '../src/data/types';
import { NOTES } from '../src/data/notes';
import { GUIDES } from '../src/data/guides';
import { TYPE_LIQUID } from '../src/data/palette';
import { renderTypeOg, renderLabelOg, type OgAssets } from '../src/lib/og';

const OUT = path.resolve('public/og');

function toArrayBuffer(p: string): ArrayBuffer {
  const b = readFileSync(p);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

async function write(name: string, res: Response) {
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(path.join(OUT, name), buf);
  return buf.length;
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  let logo: string | null = null;
  try {
    logo = `data:image/png;base64,${readFileSync(path.resolve('public/img/brand/logo-mark.png')).toString('base64')}`;
  } catch {
    logo = null;
  }
  const assets: OgAssets = {
    display: toArrayBuffer(path.resolve('assets/og-fonts/display.woff')),
    body: toArrayBuffer(path.resolve('assets/og-fonts/body.woff')),
    logo,
  };

  let count = 0;
  let bytes = 0;

  for (const t of TYPES) {
    bytes += await write(`type-${t.slug}.png`, renderTypeOg(t, assets));
    count++;
  }
  for (const n of NOTES) {
    bytes += await write(`note-${n.slug}.png`, renderLabelOg(assets, `${n.name}系の香水とは`, TYPE_LIQUID[`${n.accord}-C`]));
    count++;
  }
  for (const g of GUIDES) {
    const short = g.title.split('｜')[0] ?? g.title;
    bytes += await write(`guide-${g.slug}.png`, renderLabelOg(assets, short));
    count++;
  }
  bytes += await write('default.png', renderLabelOg(assets, null));
  count++;

  console.log(`og: ${count} images, ${(bytes / 1024 / 1024).toFixed(2)}MB → public/og`);
})();
