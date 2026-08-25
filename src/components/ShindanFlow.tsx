'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { QUESTIONS, QUESTION_COUNT } from '@/data/questions';
import type { OptionKey } from '@/data/schema';
import { TYPE_BY_CODE } from '@/data/types';
import { score } from '@/lib/scoring';
import { clearAnswers, loadAnswers, saveAnswers, saveLastResult } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { Loading } from './Loading';
import styles from './ShindanFlow.module.css';

/**
 * 診断フロー
 * - 1画面1問。選択と同時に 350ms 後に次問へ自動遷移。戻る可。
 * - 上部に「3 / 12」と細いプログレスバー。
 * - 設問文の長さに関わらず選択肢の位置が動かないよう、設問見出しは2行分の高さを確保。
 * - キーボードショートカットは意図的に持たない（自分で選ぶ体験を優先）。Tab/Enter の標準操作のみ。
 * - 回答状態は sessionStorage。回答済みが12件なら新規開始。
 */

const ADVANCE_DELAY_MS = 350;
const LOADING_MS = 1800;
const KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

interface State {
  answers: OptionKey[];
  index: number;
  phase: 'question' | 'loading';
  hydrated: boolean;
  pending: OptionKey | null;
}

type Action =
  | { type: 'hydrate'; answers: OptionKey[] }
  | { type: 'select'; key: OptionKey }
  | { type: 'advance' }
  | { type: 'back' }
  | { type: 'loading' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate': {
      const answers = a.answers.length >= QUESTION_COUNT ? [] : a.answers;
      return { ...s, answers, index: answers.length, hydrated: true };
    }
    case 'select':
      return { ...s, answers: [...s.answers.slice(0, s.index), a.key], pending: a.key };
    case 'advance':
      if (s.index + 1 >= QUESTION_COUNT) return { ...s, pending: null };
      return { ...s, index: s.index + 1, pending: null };
    case 'back':
      return { ...s, index: Math.max(0, s.index - 1), pending: null };
    case 'loading':
      return { ...s, phase: 'loading', pending: null };
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
    pending: null,
  });
  const [target, setTarget] = useState<{ href: string; color: string } | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const startedRef = useRef(false);

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

  const select = useCallback(
    (key: OptionKey) => {
      if (state.phase !== 'question' || state.pending) return;
      dispatch({ type: 'select', key });
      track('answer', { q_no: question.no, key });

      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        if (state.index + 1 >= QUESTION_COUNT) {
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
          setTarget({ href, color: t.liquidColor });
          dispatch({ type: 'loading' });
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

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [state.index, state.hydrated]);

  const onLoadingDone = useCallback(() => {
    if (target) router.push(target.href);
  }, [target, router]);

  const progress = ((state.index + (state.pending ? 1 : 0)) / QUESTION_COUNT) * 100;

  return (
    <div className={styles.root}>
      {state.phase === 'loading' && target && <Loading color={target.color} durationMs={LOADING_MS} onDone={onLoadingDone} />}

      <div className={styles.top}>
        {state.index > 0 ? (
          <button type="button" className={styles.back} onClick={() => dispatch({ type: 'back' })}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            前の質問
          </button>
        ) : (
          <Link href="/" className={styles.back}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            トップ
          </Link>
        )}
        <p className={styles.counter} aria-live="polite" data-qno={question.no}>
          <span className={styles.counterNow}>{question.no}</span>
          <span className={styles.counterSep}>/</span>
          <span className={styles.counterTotal}>{QUESTION_COUNT}</span>
        </p>
      </div>

      <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={QUESTION_COUNT} aria-valuenow={state.index} aria-label="進捗">
        <span className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <div key={question.no} className={`card ${styles.question}`}>
        <p className={styles.qLabel}>Q{question.no}</p>
        <h1 ref={headingRef} tabIndex={-1} className={styles.text}>
          {question.text}
        </h1>

        <div className={styles.options} role="group" aria-label="選択肢">
          {question.options.map((o, i) => {
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
                <span className={styles.key} aria-hidden="true">
                  {KEYS[i]}
                </span>
                <span className={styles.label}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
