import {
  ACCORD_CODES,
  ACCORD_TIEBREAK,
  type AccordCode,
  type Concentration,
  type OptionKey,
  type OptionWeight,
  type QuestionOption,
  type ScoreResult,
  type Temperature,
  type TypeCode,
} from '@/data/schema';
import { QUESTIONS } from '@/data/questions';

/**
 * §3 診断ロジック — 純粋関数のみ。
 * 乱数・時刻・環境依存を一切含めない。同じ回答は常に同じ結果になる。
 */

export type Answers = ReadonlyArray<OptionKey>;

export interface Accumulated {
  scores: Record<AccordCode, number>;
  temp: number;
  int: number;
}

export function emptyScores(): Record<AccordCode, number> {
  return { CIT: 0, GRN: 0, FLR: 0, FRT: 0, GRM: 0, WDY: 0, AMB: 0, MSK: 0 };
}

export function addWeight(acc: Accumulated, w: OptionWeight): Accumulated {
  const scores = { ...acc.scores };
  if (w.accords) {
    for (const code of ACCORD_CODES) {
      const v = w.accords[code];
      if (v) scores[code] += v;
    }
  }
  return {
    scores,
    temp: acc.temp + (w.temp ?? 0),
    int: acc.int + (w.int ?? 0),
  };
}

/** 回答途中でも呼べる累積計算（Vialの混色・液面用） */
export function accumulate(answers: Answers): Accumulated {
  let acc: Accumulated = { scores: emptyScores(), temp: 0, int: 0 };
  answers.forEach((key, i) => {
    const q = QUESTIONS[i];
    if (!q) return;
    const opt = q.options.find((o) => o.key === key);
    if (!opt) return;
    acc = addWeight(acc, opt.weight);
  });
  return acc;
}

/** 香調8軸を同点優先順位つきで降順ソート */
export function rankAccords(scores: Record<AccordCode, number>): AccordCode[] {
  return [...ACCORD_CODES].sort((a, b) => {
    const d = scores[b] - scores[a];
    if (d !== 0) return d;
    return ACCORD_TIEBREAK.indexOf(a) - ACCORD_TIEBREAK.indexOf(b);
  });
}

export function temperatureOf(temp: number): Temperature {
  // TEMP == 0 は 'C' に倒す（§3.2）
  return temp > 0 ? 'W' : 'C';
}

export function concentrationOf(int: number): Concentration {
  if (int >= 15) return 'parfum';
  if (int >= 8) return 'edp';
  return 'edt';
}

export const CONCENTRATION_LABEL: Record<Concentration, string> = {
  parfum: 'パルファン想定（濃く長く）',
  edp: 'オードパルファン想定（標準）',
  edt: 'オードトワレ想定（軽く近く）',
};

/** 選択肢の最大重み香調（滴の色に使用）。同点は §3.2 の優先順位。 */
export function dominantAccordOfOption(opt: QuestionOption): AccordCode {
  const scores = emptyScores();
  for (const code of ACCORD_CODES) {
    scores[code] = opt.weight.accords?.[code] ?? 0;
  }
  return rankAccords(scores)[0] ?? 'MSK';
}

/* ---------- digest ---------- */

const HEX16 = /^[0-9a-fA-F]{16}$/;

/** 8軸の値を各2桁hexで連結した16文字 */
export function encodeDigest(scores: Record<AccordCode, number>): string {
  return ACCORD_CODES.map((c) => {
    const v = Math.max(0, Math.min(255, Math.round(scores[c])));
    return v.toString(16).padStart(2, '0');
  }).join('');
}

/** hex以外の文字・長さ不一致は null（呼び出し側でタイプ代表値へフォールバック） */
export function decodeDigest(digest: string | null | undefined): Record<AccordCode, number> | null {
  if (!digest || !HEX16.test(digest)) return null;
  const scores = emptyScores();
  ACCORD_CODES.forEach((c, i) => {
    scores[c] = parseInt(digest.slice(i * 2, i * 2 + 2), 16);
  });
  return scores;
}

export function isValidDigest(digest: string | null | undefined): digest is string {
  return !!digest && HEX16.test(digest);
}

/* ---------- main ---------- */

export function score(answers: Answers): ScoreResult {
  if (answers.length !== QUESTIONS.length) {
    throw new Error(`score(): expected ${QUESTIONS.length} answers, got ${answers.length}`);
  }
  const acc = accumulate(answers);
  const ranked = rankAccords(acc.scores);
  const primary = ranked[0] as AccordCode;
  const secondary = ranked[1] as AccordCode;
  const temperature = temperatureOf(acc.temp);
  const typeCode: TypeCode = `${primary}-${temperature}`;
  return {
    scores: acc.scores,
    temp: acc.temp,
    int: acc.int,
    primary,
    secondary,
    typeCode,
    concentration: concentrationOf(acc.int),
    digest: encodeDigest(acc.scores),
  };
}

/** タイプ代表値（?d= が無い / 不正なときのレーダー描画用）。primary を最大、他は控えめに。 */
export function representativeScores(typeCode: TypeCode): Record<AccordCode, number> {
  const [primary] = typeCode.split('-') as [AccordCode, Temperature];
  const s = emptyScores();
  for (const c of ACCORD_CODES) s[c] = 6;
  s[primary] = 22;
  // 隣接する香調（車輪状の並び順で両隣）を少し上げ、レーダーに輪郭を出す
  const idx = ACCORD_CODES.indexOf(primary);
  const prev = ACCORD_CODES[(idx + ACCORD_CODES.length - 1) % ACCORD_CODES.length] as AccordCode;
  const next = ACCORD_CODES[(idx + 1) % ACCORD_CODES.length] as AccordCode;
  s[prev] = 11;
  s[next] = 11;
  return s;
}

/** 理論最大（レーダーの正規化に使用）: 1問あたり最大+3 × 12問 = 36 */
export const MAX_AXIS_SCORE = QUESTIONS.length * 3;

/** 回答配列が完全か */
export function isCompleteAnswers(a: ReadonlyArray<OptionKey | null | undefined>): a is OptionKey[] {
  return a.length === QUESTIONS.length && a.every((k) => k === 'A' || k === 'B' || k === 'C' || k === 'D');
}
