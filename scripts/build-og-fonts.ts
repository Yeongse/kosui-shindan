/* eslint-disable no-console */
/**
 * OG画像用フォントのサブセット生成（ビルド時のOG画像生成に使う）
 *
 * 使い方:
 *   OG_FONT_SRC=<TTFのあるディレクトリ> PYFTSUBSET=<pyftsubsetのパス> npx tsx scripts/build-og-fonts.ts
 *
 * - 収録グリフ: ASCII + ひらがな + カタカナ + 記号少々 + データ層に現れる全ての漢字
 *   （タイプ名・読み・ノート名・ガイド題名・ノート題名・固定ラベル）
 * - 出力: assets/og-fonts/{display,body}.woff と og-glyphs.txt（現代明朝 + 角ゴ）
 * - データ層（ガイド追加など）を変更したら再実行すること。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { TYPES_BASE } from '../src/data/types.base';
import { NOTES } from '../src/data/notes';
import { GUIDES } from '../src/data/guides';
import { OG_FIXED_STRINGS } from '../src/lib/og-labels';

const SRC = process.env.OG_FONT_SRC ?? '';
const PYFTSUBSET = process.env.PYFTSUBSET ?? 'pyftsubset';
const OUT = path.resolve(__dirname, '../assets/og-fonts');

if (!SRC) {
  console.error('OG_FONT_SRC (directory containing the source TTFs) is required');
  process.exit(1);
}

const chars = new Set<string>();
const add = (s: string) => Array.from(s).forEach((c) => chars.add(c));

// ASCII printable
for (let i = 0x20; i <= 0x7e; i++) chars.add(String.fromCharCode(i));
// ひらがな・カタカナ
for (let i = 0x3041; i <= 0x309f; i++) chars.add(String.fromCharCode(i));
for (let i = 0x30a0; i <= 0x30ff; i++) chars.add(String.fromCharCode(i));
// 記号
add('、。・「」（）〜―—…※：／｜　！？＆％');
// データ層
for (const t of TYPES_BASE) {
  add(t.name);
  add(t.kana);
  add(t.catch);
  add(t.notes.top.join(''));
  add(t.notes.middle.join(''));
  add(t.notes.last.join(''));
}
for (const n of NOTES) {
  add(n.name);
  add(n.h1);
}
for (const g of GUIDES) add(g.title);
for (const s of OG_FIXED_STRINGS) add(s);

const text = Array.from(chars).join('');
mkdirSync(OUT, { recursive: true });
const textFile = path.join(OUT, 'og-glyphs.txt');
writeFileSync(textFile, text, 'utf8');
console.log(`glyphs: ${chars.size}`);

const jobs: [string, string, string][] = [
  ['ZenOldMincho-Black.ttf', 'display.woff', textFile],
  ['ZenKakuGothicNew-Regular.ttf', 'body.woff', textFile],
];

for (const [src, out, glyphFile] of jobs) {
  const from = path.join(SRC, src);
  if (!existsSync(from)) {
    console.error(`missing ${from}`);
    process.exit(1);
  }
  execFileSync(
    PYFTSUBSET,
    [
      from,
      `--text-file=${glyphFile}`,
      '--flavor=woff',
      '--layout-features=*',
      '--no-hinting',
      '--desubroutinize',
      `--output-file=${path.join(OUT, out)}`,
    ],
    { stdio: 'inherit' },
  );
  console.log(`wrote ${out}`);
}
