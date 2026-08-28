import Link from 'next/link';
import { Art } from './Art';
import { TYPE_BY_SLUG } from '@/data/types';
import { TYPE_LIQUID } from '@/data/palette';
import type { FigureId } from '@/data/schema';
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
  type AccordRow,
  type AxisRow,
  type CompareSide,
  type Group,
  type MapCell,
  type ScaleItem,
} from '@/lib/figure-data';
import styles from './Figures.module.css';

/**
 * 記事に差し込む図版。画像ではなく HTML で組む。
 * 1200px の画像を390pxの画面に貼ると文字が潰れて読めないため、
 * 同じ内容を縦積みに折り返せる形で描画する。中身は src/lib/figure-data.ts。
 */

function AxisTable({ rows }: { rows: AxisRow[] }) {
  return (
    <div className={styles.rows}>
      {rows.map((r) => (
        <div key={r.axis} className={styles.axisRow}>
          <span className={styles.chip}>{r.axis}</span>
          <span className={styles.element}>{r.element}</span>
          <span className={styles.side}>{r.left}</span>
          <span className={styles.side}>{r.right}</span>
        </div>
      ))}
    </div>
  );
}

function AccordTable({ rows }: { rows: AccordRow[] }) {
  return (
    <div className={styles.rows}>
      {rows.map((r) => (
        <div key={r.accord} className={styles.accordRow}>
          <span className={styles.keys}>{r.keys.join(' × ')}</span>
          <span className={styles.accordName}>
            <span className={styles.dot} style={{ background: TYPE_LIQUID[r.code] }} aria-hidden="true" />
            {r.accord}
          </span>
          <span className={styles.note}>{r.note}</span>
        </div>
      ))}
    </div>
  );
}

/** 対応表。タイプ名からそのタイプの解説ページへ飛べるようにする */
function TypeMap({ cells, wide = false }: { cells: MapCell[]; wide?: boolean }) {
  return (
    <ul className={`${styles.map} ${wide ? styles.mapWide : ''}`}>
      {cells.map((c) => {
        const t = TYPE_BY_SLUG[c.slug];
        if (!t) return null;
        return (
          <li key={c.key}>
            <Link href={`/type/${t.slug}`} className={styles.cell}>
              <Art
                src={`/img/types/${t.slug}.webp`}
                alt=""
                className={styles.cellArt}
                imgClassName={styles.cellImg}
                fallback={<span className={styles.cellFallback} style={{ background: TYPE_LIQUID[t.code] }} />}
                style={{ background: TYPE_LIQUID[t.code] }}
              />
              <span className={styles.cellBody}>
                <span className={styles.cellKey}>{c.key}</span>
                <span className={styles.cellName}>{t.name}</span>
                <span className={styles.cellNote}>{t.notes.top.slice(0, 2).join('・')}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CompareCols({ sides }: { sides: [CompareSide, CompareSide] }) {
  return (
    <div className={styles.compare}>
      {sides.map((s, i) => (
        <div key={s.title} className={styles.compareCol}>
          <span className={`${styles.chip} ${i === 1 ? styles.chipLav : ''}`}>{s.title}</span>
          <span className={styles.compareSub}>{s.sub}</span>
          <ul className={styles.compareList}>
            {s.accords.map((a) => (
              <li key={a.name} className={styles.compareItem}>
                <span className={styles.dot} style={{ background: TYPE_LIQUID[a.code] }} aria-hidden="true" />
                {a.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function GroupTable({ groups }: { groups: Group[] }) {
  return (
    <div className={styles.rows}>
      {groups.map((g, i) => (
        <div key={g.name} className={styles.groupRow}>
          <span className={`${styles.chip} ${i % 2 === 1 ? styles.chipLav : ''}`}>{g.name}</span>
          <span className={styles.keys}>{g.keys.join('・')}</span>
          <span className={styles.note}>{g.note}</span>
        </div>
      ))}
    </div>
  );
}

function ScaleBars({ items }: { items: ScaleItem[] }) {
  return (
    <div className={styles.rows}>
      {items.map((it) => (
        <div key={it.scene} className={styles.scaleRow}>
          <span className={styles.scene}>{it.scene}</span>
          <span className={styles.bar} aria-hidden="true">
            <span className={styles.barFill} style={{ width: `${Math.round(it.bar * 100)}%` }} />
          </span>
          <span className={styles.note}>{it.amount}</span>
        </div>
      ))}
    </div>
  );
}

const LOVE_MAP_ALL: MapCell[] = [
  ...LOVE_MAP.map((c) => ({ key: `${c.key}・クール`, slug: c.slug })),
  ...LOVE_MAP.map((c) => ({ key: `${c.key}・ホット`, slug: WARM_PAIR[c.slug] ?? c.slug })),
];

function Body({ id }: { id: FigureId }) {
  switch (id) {
    case 'mbti-axes':
      return <AxisTable rows={MBTI_AXES} />;
    case 'mbti-accords':
      return <AccordTable rows={MBTI_ACCORDS} />;
    case 'mbti-map':
      return <TypeMap cells={MBTI_MAP} />;
    case 'mbti-distance':
      return <CompareCols sides={MBTI_DISTANCE} />;
    case 'mbti-groups':
      return <GroupTable groups={MBTI_GROUPS} />;
    case 'love-axes':
      return <AxisTable rows={LOVE_AXES} />;
    case 'love-accords':
      return <AccordTable rows={LOVE_ACCORDS} />;
    case 'love-map':
      return <TypeMap cells={LOVE_MAP_ALL} wide />;
    case 'love-distance':
      return <CompareCols sides={LOVE_DISTANCE} />;
    case 'love-scenes':
      return <ScaleBars items={LOVE_SCENES} />;
  }
}

export function Figure({ id, caption }: { id: FigureId; caption?: string }) {
  return (
    <figure className={styles.figure}>
      <Body id={id} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
