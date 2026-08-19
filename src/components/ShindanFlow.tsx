'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { QUESTIONS, QUESTION_COUNT } from '@/data/questions';
import { ACCORD_CODES, type OptionKey } from '@/data/schema';
import { ACCORD_LIQUID, COLORS, mixHex, TYPE_LIQUID } from '@/data/palette';
import { TYPE_BY_CODE } from '@/data/types';
import { accumulate, dominantAccordOfOption, score } from '@/lib/scoring';
import { clearAnswers, loadAnswers, saveAnswers, saveLastResult } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { Vial } from './Vial';
import { toKanji } from '@/lib/kanji';
import { Distill } from './Distill';
import styles from './ShindanFlow.module.css';

/**
 * §8.2 設問画面 / §9.2 設問モーション
 * - 1画面1問。選択と同時に 350ms 後に次問へ自動遷移。戻る可。
 * - キーボード: 1-4 / A-D で選択、矢印キーでフォーカス移動。
 * - 回答状態は sessionStorage。回答済みが12件なら新規開始（もう一度診断）。
 */

const ADVANCE_DELAY_MS = 350;
const KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

interface State {
  answers: OptionKey[]; // 常に先頭からの連続した回答
  index: number; // 表示中の設問 0..11
  phase: 'question' | 'distill';
  hydrated: boolean;
  drop: { key: number; color: string } | null;
  pending: OptionKey | null; // 選択直後〜遷移までの間の選択肢
}

type Action =
  | { type: 'hydrate'; answers: OptionKey[] }
  | { type: 'select'; key: OptionKey; color: string }
  | { type: 'advance' }
  | { type: 'back' }
  | { type: 'distill' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate': {
      const answers = a.answers.length >= QUESTION_COUNT ? [] : a.answers;
      return { ...s, answers, index: answers.length, hydrated: true };
    }
    case 'select': {
      const answers = [...s.answers.slice(0, s.index), a.key];
      return {
        ...s,
        answers,
        pending: a.key,
        drop: { key: (s.drop?.key ?? 0) + 1, color: a.color },
      };
    }
    case 'advance': {
      if (s.index + 1 >= QUESTION_COUNT) return { ...s, pending: null };
      return { ...s, index: s.index + 1, pending: null };
    }
    case 'back':
      return { ...s, index: Math.max(0, s.index - 1), pending: null };
    case 'distill':
      return { ...s, phase: 'distill', pending: null };
    default:
      return s;
  }
}

export function ShindanFlow() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    answers: [],
    index: 0,
    phase: 'question',
    hydrated: false,
    drop: null,
    pending: null,
  });
  const [distillTarget, setDistillTarget] = useState<{
    fromColor: string;
    toColor: string;
    typeName: string;
    typeCode: string;
    href: string;
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number | null>(null);
  const startedRef = useRef(false);

  // ---- hydrate from sessionStorage ----
  useEffect(() => {
    dispatch({ type: 'hydrate', answers: loadAnswers() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    saveAnswers(state.answers);
  }, [state.answers, state.hydrated]);

  useEffect(() => {
    if (state.hydrated && !startedRef.current) {
      startedRef.current = true;
      track('start_shindan');
    }
  }, [state.hydrated]);

  const question = QUESTIONS[state.index]!;
  const currentAnswer = state.answers[state.index] ?? null;

  // ---- 混色（回答履歴の加重平均） ----
  const mixedColor = useMemo(() => {
    const acc = accumulate(state.answers);
    const parts = ACCORD_CODES.map((c) => ({ hex: ACCORD_LIQUID[c], weight: acc.scores[c] }));
    const total = parts.reduce((a, p) => a + p.weight, 0);
    return total > 0 ? mixHex(parts) : COLORS.amber;
  }, [state.answers]);

  // ---- 選択 ----
  const select = useCallback(
    (key: OptionKey) => {
      if (state.phase !== 'question' || state.pending) return;
      const opt = question.options.find((o) => o.key === key);
      if (!opt) return;
      const dominant = dominantAccordOfOption(opt);
      dispatch({ type: 'select', key, color: ACCORD_LIQUID[dominant] });
      track('answer', { q_no: question.no, key });

      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        if (state.index + 1 >= QUESTION_COUNT) {
          // 12問目 → 蒸留演出へ
          const answers = [...state.answers.slice(0, state.index), key];
          const result = score(answers);
          const t = TYPE_BY_CODE[result.typeCode];
          const href = `/type/${t.slug}?d=${result.digest}`;
          saveLastResult({
            typeCode: result.typeCode,
            slug: t.slug,
            digest: result.digest,
            at: new Date().toISOString(),
            int: result.int,
            secondary: result.secondary,
          });
          clearAnswers();
          track('complete', { type: result.typeCode });
          router.prefetch(href);
          const acc = accumulate(answers);
          const parts = ACCORD_CODES.map((c) => ({ hex: ACCORD_LIQUID[c], weight: acc.scores[c] }));
          setDistillTarget({
            fromColor: mixHex(parts),
            toColor: TYPE_LIQUID[result.typeCode],
            typeName: t.name,
            typeCode: t.code,
            href,
          });
          dispatch({ type: 'distill' });
        } else {
          dispatch({ type: 'advance' });
        }
      }, ADVANCE_DELAY_MS);
    },
    [question, router, state.answers, state.index, state.pending, state.phase],
  );

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  // ---- キーボード ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.phase !== 'question') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toUpperCase();
      if (['1', '2', '3', '4'].includes(k)) {
        e.preventDefault();
        select(KEYS[Number(k) - 1]!);
        return;
      }
      if (KEYS.includes(k as OptionKey)) {
        e.preventDefault();
        select(k as OptionKey);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-key]') ?? []);
        if (!buttons.length) return;
        e.preventDefault();
        const i = buttons.findIndex((b) => b === document.activeElement);
        const next = e.key === 'ArrowDown' ? (i + 1) % buttons.length : (i - 1 + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select, state.phase]);

  // 設問が変わったら見出しにフォーカスを移す（スクリーンリーダー・キーボード操作用）
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [state.index, state.hydrated]);

  const onDistillDone = useCallback(() => {
    if (distillTarget) router.push(distillTarget.href);
  }, [distillTarget, router]);

  return (
    <div className={styles.root}>
      {state.phase === 'distill' && distillTarget && (
        <Distill
          fromColor={distillTarget.fromColor}
          toColor={distillTarget.toColor}
          typeName={distillTarget.typeName}
          typeCode={distillTarget.typeCode}
          onDone={onDistillDone}
        />
      )}

      <div className={styles.top}>
        {state.index > 0 ? (
          <button type="button" className={styles.back} onClick={() => dispatch({ type: 'back' })}>
            <span aria-hidden="true">←</span> 前の問いへ
          </button>
        ) : (
          <Link href="/" className={styles.back}>
            <span aria-hidden="true">←</span> トップへ戻る
          </Link>
        )}
        <p className={styles.counter} aria-live="polite" data-qno={question.no}>
          <span className={`brush ${styles.counterMain}`}>其の{toKanji(question.no)}</span>
          <span className={styles.counterSub}>／ 全{toKanji(QUESTION_COUNT)}問</span>
        </p>
      </div>

      <div key={question.no} className={styles.question}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.text}>
          {question.text}
        </h1>

        <div ref={listRef} className={styles.options} role="group" aria-label="選択肢">
          {question.options.map((o) => {
            const selected = (state.pending ?? currentAnswer) === o.key;
            return (
              <button
                key={o.key}
                type="button"
                data-key={o.key}
                className={`${styles.option} ${selected ? styles.selected : ''}`}
                onClick={() => select(o.key)}
                aria-pressed={selected}
                disabled={!!state.pending}
              >
                <span className={`brush ${styles.key}`} aria-hidden="true">
                  {toKanji(KEYS.indexOf(o.key) + 1)}
                </span>
                <span className="visually-hidden">{o.key}.</span>
                <span className={styles.label}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className={styles.hint}>
        <kbd>1</kbd>〜<kbd>4</kbd> または <kbd>A</kbd>〜<kbd>D</kbd> の鍵でも選べます
      </p>

      <Vial id="shindan-vial" level={state.answers.length} total={QUESTION_COUNT} color={mixedColor} drop={state.drop} />
    </div>
  );
}
