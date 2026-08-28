import { ImageResponse } from 'next/og';
import { TYPE_LIQUID } from '@/data/palette';
import { TYPE_BY_SLUG } from '@/data/types';
import type { AxisRow, AccordRow, CompareSide, Group, MapCell, ScaleItem } from '@/lib/figure-data';
import type { OgAssets } from '@/lib/og';

/**
 * 記事に差し込む図版のレンダリング（1200×675 / 16:9）。
 * ビルド時に scripts/build-figures.ts から呼ばれ、public/img/figure/*.png に書き出される。
 * 文言は src/lib/figure-data.ts に集約してあり、フォントサブセットもそこから生成する。
 */

export const FIG_W = 1200;
export const FIG_H = 675;

const C = {
  bg: '#FCFAF7',
  card: '#FFFFFF',
  border: '#EBE6E0',
  border2: '#DCD5CC',
  rose: '#E0492F',
  roseSoft: '#FCE6E0',
  lav: '#2D4F8A',
  lavSoft: '#E7ECF5',
  text: '#27262B',
  text2: '#6B6A70',
  text3: '#9D9BA2',
  panel: '#F8F5F1',
};

function fonts(a: OgAssets) {
  return [
    { name: 'Display', data: a.display, weight: 700 as const, style: 'normal' as const },
    { name: 'Body', data: a.body, weight: 400 as const, style: 'normal' as const },
  ];
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: FIG_W,
        height: FIG_H,
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        padding: '34px 40px 30px',
        fontFamily: 'Body',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: C.rose, display: 'flex' }} />
        <span style={{ fontFamily: 'Display', fontSize: 27, color: C.text }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{children}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <span style={{ fontSize: 15, color: C.text3 }}>kosui-shindan.com</span>
      </div>
    </div>
  );
}

function Chip({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 14px',
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 19,
        fontFamily: 'Display',
      }}
    >
      {text}
    </div>
  );
}

/** 軸 → 香水の設計要素（4行） */
export function renderAxisFigure(title: string, rows: AxisRow[], assets: OgAssets): ImageResponse {
  return new ImageResponse(
    (
      <Frame title={title}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {rows.map((r) => (
            <div
              key={r.axis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flex: 1,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '0 22px',
              }}
            >
              <div style={{ display: 'flex', width: 132 }}>
                <Chip text={r.axis} bg={C.roseSoft} color={C.rose} />
              </div>
              <span style={{ fontSize: 22, color: C.text3, display: 'flex' }}>→</span>
              <span style={{ fontFamily: 'Display', fontSize: 26, color: C.text, width: 250, display: 'flex' }}>{r.element}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                <span style={{ fontSize: 19, color: C.text2 }}>{r.left}</span>
                <span style={{ fontSize: 19, color: C.text2 }}>{r.right}</span>
              </div>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { width: FIG_W, height: FIG_H, fonts: fonts(assets) },
  );
}

/** 3つの軸の組み合わせ → 8香調 */
export function renderAccordFigure(title: string, rows: AccordRow[], assets: OgAssets): ImageResponse {
  return new ImageResponse(
    (
      <Frame title={title}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1 }}>
          {rows.map((r) => (
            <div
              key={r.accord}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 8,
                width: 550,
                height: 122,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '0 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {r.keys.map((k, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {i > 0 && <span style={{ fontSize: 16, color: C.text3, display: 'flex' }}>×</span>}
                    <span style={{ fontSize: 17, color: C.text2, display: 'flex' }}>{k}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: TYPE_LIQUID[r.code], display: 'flex' }} />
                <span style={{ fontFamily: 'Display', fontSize: 25, color: C.text, display: 'flex' }}>{r.accord}</span>
                <span style={{ fontSize: 17, color: C.text3, display: 'flex' }}>{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { width: FIG_W, height: FIG_H, fonts: fonts(assets) },
  );
}

/** 16タイプの対応マトリクス。art は slug → data URI */
export function renderMapFigure(
  title: string,
  cells: MapCell[],
  assets: OgAssets,
  art: Record<string, string | null>,
  cols = 4,
): ImageResponse {
  const w = cols === 4 ? 270 : 550;
  const h = cols === 4 ? 112 : 118;
  return new ImageResponse(
    (
      <Frame title={title}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, alignContent: 'flex-start' }}>
          {cells.map((c) => {
            const t = TYPE_BY_SLUG[c.slug];
            const liquid = t ? TYPE_LIQUID[t.code] : C.border2;
            const src = art[c.slug] ?? null;
            return (
              <div
                key={c.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: w,
                  height: h,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: '0 16px',
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    background: liquid,
                    display: 'flex',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src ? <img src={src} width={62} height={62} alt="" style={{ borderRadius: 31, objectFit: 'cover' }} /> : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                  <span style={{ fontFamily: 'Display', fontSize: cols === 4 ? 23 : 21, color: C.rose }}>{c.key}</span>
                  <span style={{ fontFamily: 'Display', fontSize: 24, color: C.text }}>{t ? t.name : ''}</span>
                  <span style={{ fontSize: 15, color: C.text3 }}>{t ? (t.notes.top[0] ?? '') : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Frame>
    ),
    { width: FIG_W, height: FIG_H, fonts: fonts(assets) },
  );
}

/** 2カラムの対比 */
export function renderCompareFigure(title: string, sides: [CompareSide, CompareSide], assets: OgAssets): ImageResponse {
  return new ImageResponse(
    (
      <Frame title={title}>
        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          {sides.map((s, i) => (
            <div
              key={s.title}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: '24px 24px',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex' }}>
                <Chip text={s.title} bg={i === 0 ? C.roseSoft : C.lavSoft} color={i === 0 ? C.rose : C.lav} />
              </div>
              <span style={{ fontSize: 19, color: C.text2, display: 'flex' }}>{s.sub}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                {s.accords.map((a) => (
                  <div
                    key={a.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      height: 62,
                      background: C.panel,
                      borderRadius: 14,
                      padding: '0 18px',
                    }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: 13, background: TYPE_LIQUID[a.code], display: 'flex' }} />
                    <span style={{ fontFamily: 'Display', fontSize: 25, color: C.text, display: 'flex' }}>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { width: FIG_W, height: FIG_H, fonts: fonts(assets) },
  );
}

/** 4グループのまとめ */
export function renderGroupFigure(title: string, groups: Group[], assets: OgAssets): ImageResponse {
  return new ImageResponse(
    (
      <Frame title={title}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {groups.map((g, i) => (
            <div
              key={g.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flex: 1,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '0 22px',
              }}
            >
              <div style={{ display: 'flex', width: 118 }}>
                <Chip text={g.name} bg={i % 2 === 0 ? C.roseSoft : C.lavSoft} color={i % 2 === 0 ? C.rose : C.lav} />
              </div>
              <div style={{ display: 'flex', gap: 8, width: 400 }}>
                {g.keys.map((k) => (
                  <span key={k} style={{ fontFamily: 'Display', fontSize: 21, color: C.text, display: 'flex' }}>
                    {k}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 19, color: C.text2, flex: 1, display: 'flex' }}>{g.note}</span>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { width: FIG_W, height: FIG_H, fonts: fonts(assets) },
  );
}

/** 場面別の量（横バー） */
export function renderScaleFigure(title: string, items: ScaleItem[], assets: OgAssets): ImageResponse {
  return new ImageResponse(
    (
      <Frame title={title}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {items.map((it) => (
            <div
              key={it.scene}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flex: 1,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '0 24px',
              }}
            >
              <span style={{ fontFamily: 'Display', fontSize: 24, color: C.text, width: 250, display: 'flex' }}>{it.scene}</span>
              <div style={{ display: 'flex', width: 380, height: 16, borderRadius: 8, background: C.panel }}>
                <div style={{ width: Math.round(380 * it.bar), height: 16, borderRadius: 8, background: C.rose, display: 'flex' }} />
              </div>
              <span style={{ fontSize: 19, color: C.text2, flex: 1, display: 'flex' }}>{it.amount}</span>
            </div>
          ))}
        </div>
      </Frame>
    ),
    { width: FIG_W, height: FIG_H, fonts: fonts(assets) },
  );
}
