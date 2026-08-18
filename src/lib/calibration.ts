import { QUESTIONS } from '@/data/questions';
import type { OptionKey } from '@/data/schema';
import { HUMAN_PRIOR, HUMAN_TRAIT_INT, HUMAN_TRAIT_TEMP } from '@/data/human-prior';

/**
 * 分布キャリブレーション用の回答サンプラー（テスト・分析スクリプトで共用。本番ロジックでは使わない）
 * すべて決定的（seed 付き PRNG）。
 */

export const OPTION_KEYS: readonly OptionKey[] = ['A', 'B', 'C', 'D'];

/** mulberry32 — 決定的な疑似乱数 */
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rnd: () => number): number {
  const u = 1 - rnd();
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** 一様ランダム回答（§13.1） */
export function sampleUniform(rnd: () => number): OptionKey[] {
  return QUESTIONS.map(() => OPTION_KEYS[Math.floor(rnd() * 4)]!);
}

/**
 * 人間モデル回答:
 *   logit(option) = log(prior) + A*w*temp(option) + B*h*(int(option)-1)
 *   w, h ~ N(0,1)（回答者ごとの温度嗜好・濃度嗜好）
 */
export function sampleHuman(rnd: () => number): OptionKey[] {
  const w = gauss(rnd);
  const h = gauss(rnd);
  return QUESTIONS.map((q, qi) => {
    const prior = HUMAN_PRIOR[qi]!;
    const logits = q.options.map(
      (o, oi) =>
        Math.log(prior[oi]!) +
        HUMAN_TRAIT_TEMP * w * (o.weight.temp ?? 0) +
        HUMAN_TRAIT_INT * h * ((o.weight.int ?? 0) - 1),
    );
    const max = Math.max(...logits);
    const ps = logits.map((l) => Math.exp(l - max));
    const sum = ps.reduce((a, b) => a + b, 0);
    let r = rnd() * sum;
    for (let i = 0; i < ps.length; i++) {
      r -= ps[i]!;
      if (r <= 0) return OPTION_KEYS[i]!;
    }
    return 'D';
  });
}
