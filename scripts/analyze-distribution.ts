/* eslint-disable no-console */
/**
 * 分布分析（§3.3 / §13.1）
 *   npx tsx scripts/analyze-distribution.ts            … 一様ランダム + 人間モデル の両方を出力
 *   PATCHES='[{"q":1,"key":"A","temp":-1}]' …          … 重みパッチを当てて試算（questions.ts は変更しない）
 *
 * 人間モデル（HUMAN_PRIOR）: 各選択肢の「選ばれやすさ」の事前確率（ターゲット層を想定した主観推定）に、
 * 回答者ごとの潜在特性（温度嗜好 w・濃度嗜好 h、いずれも N(0,1)）による一貫性を掛け合わせて回答を生成する。
 *   logit(option) = log(prior) + A*w*temp(option) + B*h*int(option)
 * 実際の人間は選択肢が偏り、かつ回答に一貫性があるため、一様ランダムより特定タイプに集中しやすい。
 * この2条件の両方で全16タイプが極端に痩せない／太らないように重みを調整する。
 */
import { QUESTIONS } from '../src/data/questions';
import { ACCORD_CODES, ACCORD_TIEBREAK, type AccordCode, type OptionKey, type Question } from '../src/data/schema';
import { HUMAN_PRIOR, HUMAN_TRAIT_TEMP, HUMAN_TRAIT_INT } from '../src/data/human-prior';

type Patch = { q: number; key: OptionKey; accords?: Partial<Record<AccordCode, number>>; temp?: number; int?: number };
const PATCHES: Patch[] = JSON.parse(process.env.PATCHES ?? '[]');

function applyPatches(qs: readonly Question[]): Question[] {
  return qs.map((q) => ({
    ...q,
    options: q.options.map((o) => {
      const p = PATCHES.find((p) => p.q === q.no && p.key === o.key);
      if (!p) return o;
      const accords = { ...(o.weight.accords ?? {}) };
      if (p.accords)
        for (const [k, v] of Object.entries(p.accords)) {
          if (v === 0) delete (accords as Record<string, number>)[k];
          else (accords as Record<string, number>)[k] = v;
        }
      return { ...o, weight: { accords, temp: p.temp ?? o.weight.temp, int: p.int ?? o.weight.int } };
    }),
  }));
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rnd: () => number) {
  const u = 1 - rnd();
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const QS = applyPatches(QUESTIONS);
const K: OptionKey[] = ['A', 'B', 'C', 'D'];
const N = Number(process.env.N ?? 200_000);

function scoreAnswers(ans: OptionKey[]) {
  const scores: Record<AccordCode, number> = { CIT: 0, GRN: 0, FLR: 0, FRT: 0, GRM: 0, WDY: 0, AMB: 0, MSK: 0 };
  let temp = 0;
  let int = 0;
  ans.forEach((key, qi) => {
    const o = QS[qi]!.options.find((x) => x.key === key)!;
    for (const c of ACCORD_CODES) scores[c] += o.weight.accords?.[c] ?? 0;
    temp += o.weight.temp ?? 0;
    int += o.weight.int ?? 0;
  });
  const ranked = [...ACCORD_CODES].sort(
    (a, b) => scores[b] - scores[a] || ACCORD_TIEBREAK.indexOf(a) - ACCORD_TIEBREAK.indexOf(b),
  );
  return { code: `${ranked[0]}-${temp > 0 ? 'W' : 'C'}`, primary: ranked[0]!, temp, int };
}

function run(label: string, sampler: (rnd: () => number) => OptionKey[], lo: number, hi: number) {
  const rnd = mulberry32(20260818);
  const counts: Record<string, number> = {};
  const primary: Record<string, number> = {};
  const optCounts: number[][] = QS.map(() => [0, 0, 0, 0]);
  let warm = 0;
  let intSum = 0;
  for (let i = 0; i < N; i++) {
    const ans = sampler(rnd);
    ans.forEach((k, qi) => optCounts[qi]![K.indexOf(k)]!++);
    const r = scoreAnswers(ans);
    counts[r.code] = (counts[r.code] ?? 0) + 1;
    primary[r.primary] = (primary[r.primary] ?? 0) + 1;
    if (r.code.endsWith('W')) warm++;
    intSum += r.int;
  }
  const codes = ACCORD_CODES.flatMap((a) => [`${a}-C`, `${a}-W`]);
  let bad = 0;
  console.log(`\n===== ${label} (N=${N}) =====`);
  for (const c of codes) {
    const pct = (100 * (counts[c] ?? 0)) / N;
    const flag = pct < lo || pct > hi ? '  <-- OUT' : pct < lo + 1 || pct > hi - 3 ? '  (edge)' : '';
    if (pct < lo || pct > hi) bad++;
    console.log(c.padEnd(6), pct.toFixed(2).padStart(6) + '%', '#'.repeat(Math.round(pct)), flag);
  }
  console.log('primary:', ACCORD_CODES.map((a) => `${a} ${((100 * (primary[a] ?? 0)) / N).toFixed(1)}%`).join('  '));
  console.log(`warm ${((100 * warm) / N).toFixed(1)}%  mean INT ${(intSum / N).toFixed(1)}  OUT OF RANGE [${lo},${hi}]: ${bad}`);
  if (process.env.VERBOSE) {
    console.log('option shares:');
    optCounts.forEach((c, qi) => console.log(`  Q${qi + 1}`, c.map((n) => ((100 * n) / N).toFixed(0) + '%').join(' ')));
  }
  return bad;
}

// 一様ランダム
const uniform = (rnd: () => number) => Array.from({ length: 12 }, () => K[Math.floor(rnd() * 4)]!);

// 人間モデル
const human = (rnd: () => number) => {
  const w = gauss(rnd);
  const h = gauss(rnd);
  return QS.map((q, qi) => {
    const prior = HUMAN_PRIOR[qi]!;
    const logits = q.options.map(
      (o, oi) => Math.log(prior[oi]!) + HUMAN_TRAIT_TEMP * w * (o.weight.temp ?? 0) + HUMAN_TRAIT_INT * h * ((o.weight.int ?? 0) - 1),
    );
    const max = Math.max(...logits);
    const ps = logits.map((l) => Math.exp(l - max));
    const sum = ps.reduce((a, b) => a + b, 0);
    let r = rnd() * sum;
    for (let i = 0; i < ps.length; i++) {
      r -= ps[i]!;
      if (r <= 0) return K[i]!;
    }
    return 'D';
  });
};

const badU = run('UNIFORM (§13.1 基準 2〜22%)', uniform, 2, 22);
const badH = run('HUMAN PRIOR (目標 3〜16%)', human, 3, 16);

console.log('\n--- accord totals / temp-weighted ---');
for (const a of ACCORD_CODES) {
  let tot = 0;
  let tw = 0;
  for (const q of QS)
    for (const o of q.options) {
      const w = o.weight.accords?.[a] ?? 0;
      tot += w;
      tw += w * (o.weight.temp ?? 0);
    }
  console.log(a, 'total', tot, 'avg temp', (tw / tot).toFixed(2));
}
process.exitCode = badU + badH > 0 ? 1 : 0;
