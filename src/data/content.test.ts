import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { TYPES } from './types';
import { TYPE_CODES } from './types.base';
import { NOTES, NOTE_SLUGS } from './notes';
import { GUIDES, GUIDE_SLUGS } from './guides';
import { QUESTIONS } from './questions';
import { LP_FAQ, LP_PHILOSOPHY } from './site-copy';
import type { ArticleSection } from './schema';

/**
 * §13.3 コンテンツ検収
 * - 絵文字が全ソース・全コピーに1文字も存在しない
 * - 「！」全面禁止（付録A）
 * - howToChoose 700〜1000字 / FAQ 3問 / relatedNotes・relatedGuides が実在
 * - ノート 1200字以上 / ガイド 1600字以上
 * - タイプ16ページの howToChoose が相互に重複率30%未満（4-gram）
 * - 内部リンクのアンカーテキストに「こちら」「詳細」を使わない
 */

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (f === 'node_modules' || f === '.next' || f === 'fonts') continue;
      walk(p, out);
    } else if (/\.(tsx?|css|md)$/.test(f)) {
      out.push(p);
    }
  }
  return out;
}

function sectionText(sections: ArticleSection[]): string {
  return sections
    .map((s) => s.heading + s.blocks.map((b) => (typeof b === 'string' ? b : b.list.join(''))).join(''))
    .join('');
}

function ngrams(s: string, n = 4): Set<string> {
  const t = s.replace(/\s+/g, '');
  const set = new Set<string>();
  for (let i = 0; i + n <= t.length; i++) set.add(t.slice(i, i + n));
  return set;
}

function overlapRatio(a: string, b: string): number {
  const A = ngrams(a);
  const B = ngrams(b);
  let shared = 0;
  for (const g of A) if (B.has(g)) shared++;
  return shared / Math.min(A.size, B.size);
}

const SRC = path.resolve(__dirname, '..');

describe('禁止事項（§7.0 / 付録A）', () => {
  it('絵文字が src 配下のソースに存在しない', () => {
    const offenders: string[] = [];
    for (const f of walk(SRC)) {
      const text = readFileSync(f, 'utf8');
      const m = text.match(EMOJI);
      if (m) offenders.push(`${path.relative(SRC, f)}: ${m[0]}`);
    }
    expect(offenders).toEqual([]);
  });

  it('全角の感嘆符がデータ層・コピーに存在しない', () => {
    // ソース中の半角 `!` は非nullアサーション等で使うため、全角のみを厳密に禁止する
    const bang = String.fromCharCode(0xff01);
    const offenders: string[] = [];
    for (const f of walk(path.join(SRC, 'data')).concat(walk(path.join(SRC, 'app')), walk(path.join(SRC, 'components')))) {
      if (f.endsWith('.test.ts')) continue;
      const text = readFileSync(f, 'utf8');
      if (text.includes(bang)) offenders.push(path.relative(SRC, f));
    }
    expect(offenders).toEqual([]);
  });

  it('アンカーテキストに「こちら」「詳細」単体を使わない', () => {
    const offenders: string[] = [];
    for (const f of walk(path.join(SRC, 'app')).concat(walk(path.join(SRC, 'components')))) {
      const text = readFileSync(f, 'utf8');
      if (/>\s*(こちら|詳細|詳しくはこちら|more|read more)\s*</i.test(text)) offenders.push(path.relative(SRC, f));
    }
    expect(offenders).toEqual([]);
  });
});

describe('タイプ16ページ（§8.4 / §11.3）', () => {
  it('全16コードにSEOフィールドが揃っている', () => {
    for (const t of TYPES) {
      expect(TYPE_CODES).toContain(t.code);
      expect(t.seoTitle, t.code).toMatch(/香水/);
      expect(t.seoDescription, t.code).toMatch(/香水診断/);
      expect(t.seoDescription, t.code).toMatch(/無料/);
      expect(t.seoDescription.length, `${t.code} seoDescription length`).toBeGreaterThanOrEqual(80);
      expect(t.seoDescription.length, `${t.code} seoDescription length`).toBeLessThanOrEqual(140);
      expect(t.h1, t.code).toContain(t.name);
      expect(t.h1, t.code).toContain('香水診断結果');
      expect(t.faq, t.code).toHaveLength(3);
      for (const f of t.faq) {
        expect(f.q.length).toBeGreaterThan(8);
        expect(f.a.length).toBeGreaterThan(40);
      }
      expect(NOTE_SLUGS).toContain(t.relatedNotes[0]);
      expect(NOTE_SLUGS).toContain(t.relatedNotes[1]);
      expect(GUIDE_SLUGS, `${t.code} relatedGuides[0]`).toContain(t.relatedGuides[0]);
      expect(GUIDE_SLUGS, `${t.code} relatedGuides[1]`).toContain(t.relatedGuides[1]);
    }
  });

  it('howToChoose は 700〜1000字', () => {
    for (const t of TYPES) {
      const len = t.howToChoose.replace(/\n/g, '').length;
      expect(len, `${t.code}: ${len}`).toBeGreaterThanOrEqual(700);
      expect(len, `${t.code}: ${len}`).toBeLessThanOrEqual(1000);
    }
  });

  it('howToChoose の相互重複率（4-gram）が 30% 未満', () => {
    const report: string[] = [];
    for (let i = 0; i < TYPES.length; i++) {
      for (let j = i + 1; j < TYPES.length; j++) {
        const r = overlapRatio(TYPES[i]!.howToChoose, TYPES[j]!.howToChoose);
        if (r >= 0.3) report.push(`${TYPES[i]!.code} x ${TYPES[j]!.code}: ${(r * 100).toFixed(1)}%`);
      }
    }
    expect(report).toEqual([]);
  });

  it('結果コピーに「かもしれません」を使わない（付録A 断定）', () => {
    for (const t of TYPES) {
      expect(t.body).not.toContain('かもしれません');
      expect(t.catch).not.toContain('かもしれません');
    }
  });
});

describe('ノート解説 8本（§8.6）', () => {
  it('8香調が揃い、本文 1200字以上', () => {
    expect(NOTES).toHaveLength(8);
    for (const n of NOTES) {
      const len = (n.lead + sectionText(n.sections)).length;
      expect(len, `${n.slug}: ${len}`).toBeGreaterThanOrEqual(1200);
      expect(n.h1).toContain(`${n.name}系の香水とは`);
      expect(n.seoTitle).toContain('【香水診断 調香箋】');
      expect(n.sections.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('ガイド記事（§12.3）', () => {
  it('ローンチ時10本、本文 1600字以上、関連リンクが実在', () => {
    expect(GUIDES.length).toBeGreaterThanOrEqual(10);
    for (const g of GUIDES) {
      const len = (g.lead + sectionText(g.sections)).length;
      expect(len, `${g.slug}: ${len}`).toBeGreaterThanOrEqual(1600);
      for (const s of g.relatedNotes) expect(NOTE_SLUGS, `${g.slug} relatedNotes`).toContain(s);
      for (const s of g.relatedGuides) {
        expect(GUIDE_SLUGS, `${g.slug} relatedGuides -> ${s}`).toContain(s);
        expect(s).not.toBe(g.slug);
      }
      expect(g.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('LP コピー（§8.1）', () => {
  it('FAQ 5問、考え方 600字前後', () => {
    expect(LP_FAQ).toHaveLength(5);
    const len = LP_PHILOSOPHY.join('').length;
    expect(len).toBeGreaterThanOrEqual(500);
  });

  it('設問に香りの直接質問（柑橘/香水/ノート名）を含まない（§3.3）', () => {
    for (const q of QUESTIONS.slice(0, 11)) {
      expect(q.text).not.toMatch(/柑橘|シトラス|ムスク|バニラ|ウッディ|フローラル/);
    }
  });
});
