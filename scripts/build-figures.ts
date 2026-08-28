/* eslint-disable no-console */
/**
 * 記事の図版を PNG として書き出す（1200×675 / 16:9）
 *   npm run figures
 *
 * 記事本文の図版は HTML（src/components/Figures.tsx）で描いている。1200px の画像を
 * 390px の画面に貼ると文字が潰れて読めないため。このスクリプトは SNS に図を貼りたいときや
 * 資料に使いたいときのための書き出し用で、ビルドには含めない。
 * 出力: public/img/figure/*.png（gitignore 済み）
 * 文言は src/lib/figure-data.ts、見た目は src/lib/figures.tsx。
 * タイプのキャラ絵は assets/img/types の原本PNGを data URI で埋め込む（satori は WebP を読めない）。
 * 図版の文字を足したら `npm run og:fonts` を実行すること。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { TYPES } from '../src/data/types';
import {
  LOVE_ACCORDS,
  LOVE_AXES,
  LOVE_DISTANCE,
  LOVE_MAP,
  LOVE_SCENES,
  MBTI_ACCORDS,
  MBTI_AXES,
  MBTI_DISTANCE,
  MBTI_GROUPS,
  MBTI_MAP,
  WARM_PAIR,
} from '../src/lib/figure-data';
import {
  renderAccordFigure,
  renderAxisFigure,
  renderCompareFigure,
  renderGroupFigure,
  renderMapFigure,
  renderScaleFigure,
} from '../src/lib/figures';
import type { OgAssets } from '../src/lib/og';

const OUT = path.resolve('public/img/figure');

function toArrayBuffer(p: string): ArrayBuffer {
  const b = readFileSync(p);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

function dataUri(file: string): string | null {
  try {
    return `data:image/png;base64,${readFileSync(file).toString('base64')}`;
  } catch {
    return null;
  }
}

async function write(name: string, res: Response) {
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(path.join(OUT, name), buf);
  return buf.length;
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const assets: OgAssets = {
    display: toArrayBuffer(path.resolve('assets/og-fonts/display.woff')),
    body: toArrayBuffer(path.resolve('assets/og-fonts/body.woff')),
    logo: null,
  };

  const art: Record<string, string | null> = {};
  for (const t of TYPES) art[t.slug] = dataUri(path.resolve(`assets/img/types/${t.slug}.png`));

  // ラブタイプの一覧は「クール8種」を出し、対になるウォームも併記できるよう2列で見せる
  const loveMapCells = LOVE_MAP.map((c) => ({ key: c.key, slug: c.slug }));

  const jobs: [string, Response][] = [
    ['mbti-axes.png', renderAxisFigure('MBTIの4つの軸は、香水の何を決めるのか', MBTI_AXES, assets)],
    ['mbti-accords.png', renderAccordFigure('3つの軸の組み合わせで、8つの香調が決まる', MBTI_ACCORDS, assets)],
    ['mbti-map.png', renderMapFigure('MBTI 16タイプ × 香水タイプの対応', MBTI_MAP, assets, art)],
    ['mbti-distance.png', renderCompareFigure('E / I が決めるのは、香りが届く距離', MBTI_DISTANCE, assets)],
    ['mbti-groups.png', renderGroupFigure('4つのグループで見ると、傾向がはっきり分かれる', MBTI_GROUPS, assets)],
    ['love-axes.png', renderAxisFigure('ラブタイプの4つの軸は、香水の何を決めるのか', LOVE_AXES, assets)],
    ['love-accords.png', renderAccordFigure('3つの軸の組み合わせで、8つの香調が決まる', LOVE_ACCORDS, assets)],
    ['love-map.png', renderMapFigure('3つの軸 × 香水タイプの対応（クール側）', loveMapCells, assets, art, 2)],
    [
      'love-map-warm.png',
      renderMapFigure(
        '同じ組み合わせで、熱量がホットのとき',
        loveMapCells.map((c) => ({ key: c.key, slug: WARM_PAIR[c.slug] ?? c.slug })),
        assets,
        art,
        2,
      ),
    ],
    ['love-distance.png', renderCompareFigure('公開度が決めるのは、香りが届く距離', LOVE_DISTANCE, assets)],
    ['love-scenes.png', renderScaleFigure('場面によって、ちょうどいい量は変わる', LOVE_SCENES, assets)],
  ];

  let bytes = 0;
  for (const [name, res] of jobs) bytes += await write(name, res);
  console.log(`figures: ${jobs.length} images, ${(bytes / 1024 / 1024).toFixed(2)}MB → public/img/figure`);
})();
