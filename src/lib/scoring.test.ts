import { describe, expect, it } from 'vitest';
import {
  accumulate,
  decodeDigest,
  dominantAccordOfOption,
  encodeDigest,
  representativeScores,
  score,
} from './scoring';
import { QUESTIONS } from '@/data/questions';
import { TYPES_BASE, TYPE_CODES } from '@/data/types.base';
import { ACCORD_CODES, type OptionKey, type TypeCode } from '@/data/schema';
import { HUMAN_PRIOR } from '@/data/human-prior';
import { mulberry32, sampleHuman, sampleUniform } from './calibration';

const K: OptionKey[] = ['A', 'B', 'C', 'D'];

function distribution(sampler: (rnd: () => number) => OptionKey[], n: number, seed: number) {
  const rnd = mulberry32(seed);
  const counts: Record<string, number> = {};
  for (const c of TYPE_CODES) counts[c] = 0;
  for (let i = 0; i < n; i++) {
    const r = score(sampler(rnd));
    counts[r.typeCode] = (counts[r.typeCode] ?? 0) + 1;
  }
  const pct: Record<string, number> = {};
  for (const c of TYPE_CODES) pct[c] = (100 * (counts[c] ?? 0)) / n;
  const report = TYPE_CODES.map((c) => `${c}:${pct[c]!.toFixed(2)}%`).join(' ');
  return { pct, report };
}

describe('data integrity (§4)', () => {
  it('has 12 questions with 4 options each, keys A-D', () => {
    expect(QUESTIONS).toHaveLength(12);
    QUESTIONS.forEach((q, i) => {
      expect(q.no).toBe(i + 1);
      expect(q.options.map((o) => o.key)).toEqual(K);
    });
  });

  it('every option weights 2-3 accords within +1..+3, temp -3..+3, int 0..+3', () => {
    for (const q of QUESTIONS) {
      for (const o of q.options) {
        const entries = Object.entries(o.weight.accords ?? {});
        expect(entries.length, `Q${q.no}${o.key}`).toBeGreaterThanOrEqual(2);
        expect(entries.length, `Q${q.no}${o.key}`).toBeLessThanOrEqual(3);
        for (const [, v] of entries) {
          expect(v).toBeGreaterThanOrEqual(1);
          expect(v).toBeLessThanOrEqual(3);
        }
        expect(o.weight.temp ?? 0).toBeGreaterThanOrEqual(-3);
        expect(o.weight.temp ?? 0).toBeLessThanOrEqual(3);
        expect(o.weight.int ?? 0).toBeGreaterThanOrEqual(0);
        expect(o.weight.int ?? 0).toBeLessThanOrEqual(3);
      }
    }
  });

  it('16 types with unique codes/slugs and valid affinity references', () => {
    expect(TYPES_BASE).toHaveLength(16);
    const codes = new Set(TYPES_BASE.map((t) => t.code));
    const slugs = new Set(TYPES_BASE.map((t) => t.slug));
    expect(codes.size).toBe(16);
    expect(slugs.size).toBe(16);
    for (const t of TYPES_BASE) {
      expect(codes.has(t.affinity.best)).toBe(true);
      expect(codes.has(t.affinity.pair)).toBe(true);
      expect(t.affinity.best).not.toBe(t.code);
      expect(t.searchQueries).toHaveLength(2);
    }
  });
});

describe('score() snapshots (§13.1)', () => {
  const cases: { name: string; answers: OptionKey[]; expect: TypeCode }[] = [
    { name: 'all A', answers: Array(12).fill('A'), expect: 'CIT-C' },
    { name: 'all B', answers: Array(12).fill('B'), expect: 'FRT-W' },
    { name: 'all C', answers: Array(12).fill('C'), expect: 'AMB-W' },
    { name: 'all D', answers: Array(12).fill('D'), expect: 'FLR-C' },
    { name: 'ABCD cycle', answers: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'], expect: 'FRT-C' },
    { name: 'DCBA cycle', answers: ['D', 'C', 'B', 'A', 'D', 'C', 'B', 'A', 'D', 'C', 'B', 'A'], expect: 'AMB-W' },
    { name: 'floral leaning', answers: ['A', 'D', 'D', 'B', 'D', 'D', 'D', 'C', 'A', 'A', 'D', 'D'], expect: 'FLR-C' },
    { name: 'musk cool', answers: ['C', 'A', 'A', 'B', 'A', 'A', 'A', 'B', 'C', 'D', 'A', 'B'], expect: 'MSK-C' },
    { name: 'woody', answers: ['B', 'C', 'C', 'C', 'C', 'C', 'B', 'B', 'C', 'C', 'B', 'C'], expect: 'WDY-W' },
    { name: 'gourmand cool', answers: ['B', 'B', 'C', 'B', 'A', 'B', 'A', 'D', 'B', 'D', 'C', 'A'], expect: 'GRM-C' },
    { name: 'green cool', answers: ['A', 'D', 'A', 'B', 'D', 'D', 'D', 'A', 'C', 'A', 'A', 'A'], expect: 'GRN-C' },
    { name: 'fruity warm', answers: ['D', 'B', 'B', 'A', 'B', 'B', 'C', 'D', 'B', 'B', 'C', 'B'], expect: 'FRT-W' },
    { name: 'citrus warm', answers: ['C', 'A', 'B', 'A', 'B', 'A', 'A', 'A', 'A', 'B', 'C', 'A'], expect: 'CIT-W' },
    { name: 'amber cool', answers: ['C', 'C', 'A', 'D', 'A', 'C', 'A', 'C', 'D', 'C', 'A', 'C'], expect: 'AMB-C' },
  ];

  for (const c of cases) {
    it(`${c.name} → ${c.expect}`, () => {
      const r = score(c.answers);
      expect(r.typeCode).toBe(c.expect);
      expect(r.digest).toHaveLength(16);
      expect(r.primary).not.toBe(r.secondary);
    });
  }

  it('is deterministic', () => {
    const a: OptionKey[] = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'];
    expect(score(a)).toEqual(score(a));
  });

  it('throws on wrong answer count', () => {
    expect(() => score(['A'])).toThrow();
  });

  it('TEMP == 0 falls to cool', () => {
    // 累積 temp が 0 になる組合せを探索して検証
    const rnd = mulberry32(7);
    let found = false;
    for (let i = 0; i < 20000 && !found; i++) {
      const ans = Array.from({ length: 12 }, () => K[Math.floor(rnd() * 4)] as OptionKey);
      const acc = accumulate(ans);
      if (acc.temp === 0) {
        expect(score(ans).typeCode.endsWith('-C')).toBe(true);
        found = true;
      }
    }
    expect(found).toBe(true);
  });
});

describe('digest', () => {
  it('encode/decode round-trips', () => {
    const rnd = mulberry32(42);
    for (let i = 0; i < 500; i++) {
      const ans = Array.from({ length: 12 }, () => K[Math.floor(rnd() * 4)] as OptionKey);
      const r = score(ans);
      expect(decodeDigest(r.digest)).toEqual(r.scores);
    }
  });

  it('rejects non-hex / wrong-length digests', () => {
    expect(decodeDigest('zz')).toBeNull();
    expect(decodeDigest('0102030405060708zz')).toBeNull();
    expect(decodeDigest('010203040506070')).toBeNull();
    expect(decodeDigest(null)).toBeNull();
    expect(decodeDigest('0102030405060708')).toEqual({
      CIT: 1,
      GRN: 2,
      FLR: 3,
      FRT: 4,
      GRM: 5,
      WDY: 6,
      AMB: 7,
      MSK: 8,
    });
  });

  it('encode clamps to 0..255', () => {
    expect(encodeDigest({ CIT: 300, GRN: -4, FLR: 0, FRT: 0, GRM: 0, WDY: 0, AMB: 0, MSK: 0 })).toBe(
      'ff00000000000000',
    );
  });

  it('representativeScores peaks on primary accord', () => {
    for (const code of TYPE_CODES) {
      const s = representativeScores(code);
      const primary = code.split('-')[0];
      const max = Math.max(...ACCORD_CODES.map((c) => s[c]));
      expect(s[primary as (typeof ACCORD_CODES)[number]]).toBe(max);
    }
  });
});

describe('distribution (§13.1 モンテカルロ)', () => {
  it('uniform random 100,000 trials → each of 16 types within 2%..22%', () => {
    const { pct, report } = distribution(sampleUniform, 100_000, 20260818);
    for (const c of TYPE_CODES) {
      expect(pct[c], `${c} out of range — ${report}`).toBeGreaterThanOrEqual(2);
      expect(pct[c], `${c} out of range — ${report}`).toBeLessThanOrEqual(22);
    }
  });

  it('human-prior model 100,000 trials → each of 16 types within 3%..16%（選択の偏り・一貫性を考慮）', () => {
    // 事前分布は各問で合計1
    for (const p of HUMAN_PRIOR) expect(Math.abs(p.reduce((a, b) => a + b, 0) - 1)).toBeLessThan(1e-9);
    const { pct, report } = distribution(sampleHuman, 100_000, 20260819);
    for (const c of TYPE_CODES) {
      expect(pct[c], `${c} out of range — ${report}`).toBeGreaterThanOrEqual(3);
      expect(pct[c], `${c} out of range — ${report}`).toBeLessThanOrEqual(16);
    }
  });

  it('warm/cool は両モデルとも 40〜60% に収まる', () => {
    for (const [sampler, seed] of [
      [sampleUniform, 1],
      [sampleHuman, 2],
    ] as const) {
      const { pct } = distribution(sampler, 50_000, seed);
      const warm = TYPE_CODES.filter((c) => c.endsWith('-W')).reduce((a, c) => a + (pct[c] ?? 0), 0);
      expect(warm).toBeGreaterThanOrEqual(40);
      expect(warm).toBeLessThanOrEqual(60);
    }
  });
});

describe('dominantAccordOfOption', () => {
  it('returns the max-weight accord with tiebreak', () => {
    const q1 = QUESTIONS[0]!;
    expect(dominantAccordOfOption(q1.options[0]!)).toBe('GRN');
    expect(dominantAccordOfOption(q1.options[1]!)).toBe('GRM');
    expect(dominantAccordOfOption(q1.options[2]!)).toBe('MSK');
    expect(dominantAccordOfOption(q1.options[3]!)).toBe('FRT');
    // Q2-C: WDY+2, AMB+2 → tiebreak WDY > AMB
    expect(dominantAccordOfOption(QUESTIONS[1]!.options[2]!)).toBe('WDY');
  });
});
