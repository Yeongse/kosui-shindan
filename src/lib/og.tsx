import { ImageResponse } from 'next/og';
import { ACCORD_CODES, type AccordCode, type ScentType } from '@/data/schema';
import { ACCORD_LIQUID, ACCORD_NAME_JA, TYPE_LIQUID } from '@/data/palette';
import { representativeScores } from '@/lib/scoring';
import { OG_SITE_URL_LABEL, OG_SUBLINE, OG_TAGLINE } from '@/lib/og-labels';

/**
 * OG画像のレンダリング（1200×630）。ビルド時に scripts/build-og.ts から呼ばれ、
 * public/og/*.png として書き出される（配信は静的ファイル）。
 * 白いカード + 淡い地。フォント・ロゴ・タイプのキャラ絵は呼び出し側から data URI で渡す。
 */

export const OG_W = 1200;
export const OG_H = 630;

const C = {
  bg: '#FCFAF7',
  rose: '#E0492F',
  roseSoft: '#FCE6E0',
  lav: '#2D4F8A',
  lavSoft: '#E7ECF5',
  card: '#FFFFFF',
  border: '#EBE6E0',
  text: '#27262B',
  text2: '#6B6A70',
  text3: '#9D9BA2',
};

export interface OgAssets {
  display: ArrayBuffer;
  body: ArrayBuffer;
  /** ロゴの data URI（無ければ null） */
  logo: string | null;
}

function fontConfig(a: OgAssets) {
  return [
    { name: 'Display', data: a.display, weight: 700 as const, style: 'normal' as const },
    { name: 'Body', data: a.body, weight: 400 as const, style: 'normal' as const },
  ];
}

function Blobs() {
  return (
    <>
      <div style={{ position: 'absolute', left: -120, top: -140, width: 520, height: 520, borderRadius: 260, background: '#FBEEEA', opacity: 0.9, display: 'flex' }} />
      <div style={{ position: 'absolute', right: -140, bottom: -200, width: 560, height: 560, borderRadius: 280, background: '#EEF1F7', opacity: 0.95, display: 'flex' }} />
    </>
  );
}

function Logo({ src }: { src: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={44} height={44} alt="" style={{ objectFit: 'contain' }} />
      ) : null}
      <span style={{ fontFamily: 'Display', fontSize: 24, color: C.text }}>調香箋</span>
      <span style={{ fontFamily: 'Body', fontSize: 15, color: C.text3 }}>香水診断</span>
    </div>
  );
}

/** タイプの結果カード風 OG。art はタイプのキャラ絵（data URI）。無ければ液体色の円になる。 */
export function renderTypeOg(type: ScentType, assets: OgAssets, art: string | null = null): ImageResponse {
  const scores = representativeScores(type.code);
  const liquid = TYPE_LIQUID[type.code];
  const [accord, temp] = type.code.split('-') as [AccordCode, 'W' | 'C'];
  const total = Math.max(1, ACCORD_CODES.reduce((a, c) => a + Math.max(0, scores[c]), 0));
  const bars = [...ACCORD_CODES]
    .map((c) => ({ c, pct: Math.round((Math.max(0, scores[c]) / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  const maxPct = Math.max(1, ...bars.map((b) => b.pct));
  const tags = [`#${ACCORD_NAME_JA[accord]}系`, `#${temp === 'C' ? 'クール' : 'ウォーム'}`, `#${type.notes.last[0] ?? ''}`];

  return new ImageResponse(
    (
      <div style={{ width: OG_W, height: OG_H, display: 'flex', background: C.bg, position: 'relative', fontFamily: 'Body', color: C.text, overflow: 'hidden' }}>
        <Blobs />
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 50,
            width: 1080,
            height: 530,
            background: C.card,
            borderRadius: 32,
            border: `1px solid ${C.border}`,
            boxShadow: '0 30px 60px -30px rgba(120,80,160,0.35)',
            display: 'flex',
            padding: '40px 48px',
          }}
        >
          {/* 落款印 */}
          <div style={{ position: 'absolute', right: 44, top: 40, width: 92, height: 92, borderRadius: 10, background: C.rose, transform: 'rotate(-5deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            <div style={{ position: 'absolute', inset: 6, border: '2px solid rgba(255,255,255,0.7)', borderRadius: 6, display: 'flex' }} />
            <span style={{ fontFamily: 'Display', fontSize: 34, color: '#fff', lineHeight: 1.05 }}>{Array.from(type.name)[0] ?? ''}</span>
            <span style={{ fontFamily: 'Display', fontSize: 34, color: '#fff', lineHeight: 1.05 }}>{Array.from(type.name)[1] ?? ''}</span>
          </div>
          {/* 左: 丸 + 名前 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380, gap: 18 }}>
            <div
              style={{
                width: 190,
                height: 190,
                borderRadius: 95,
                background: liquid,
                display: 'flex',
                overflow: 'hidden',
                boxShadow: `0 0 0 6px #fff, 0 0 0 8px ${liquid}, 0 0 0 14px #fff, 0 0 0 15px ${liquid}88`,
              }}
            >
              {art ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art} width={190} height={190} alt="" style={{ borderRadius: 95, objectFit: 'cover' }} />
              ) : null}
            </div>
            <div style={{ display: 'flex', fontSize: 16, color: C.text2, marginTop: 6 }}>あなたの香水タイプは</div>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 78, lineHeight: 1, letterSpacing: 8, color: C.text }}>{type.name}</div>
            <div style={{ display: 'flex', fontSize: 16, color: C.text3, letterSpacing: 4 }}>{type.kana}</div>
          </div>
          {/* 右: キャッチ・タグ・ノート・バー */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: 36, paddingRight: 110, gap: 18, minWidth: 0 }}>
            <Logo src={assets.logo} />
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 34, lineHeight: 1.4, color: C.text }}>{type.catch}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {tags.map((t) => (
                <div key={t} style={{ display: 'flex', padding: '6px 14px', borderRadius: 999, background: C.lavSoft, color: C.lav, fontSize: 15, fontFamily: 'Body' }}>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {(
                [
                  ['トップ', type.notes.top.join('・')],
                  ['ミドル', type.notes.middle.join('・')],
                  ['ラスト', type.notes.last.join('・')],
                ] as const
              ).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 14px', borderRadius: 16, background: '#FAF7FC', border: `1px solid ${C.border}`, gap: 4 }}>
                  <span style={{ fontFamily: 'Display', fontSize: 13, color: C.rose }}>{k}</span>
                  <span style={{ fontSize: 15, lineHeight: 1.4 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bars.map((b) => (
                <div key={b.c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                  <span style={{ width: 84, color: C.text2 }}>{ACCORD_NAME_JA[b.c]}</span>
                  <div style={{ display: 'flex', flex: 1, height: 12, borderRadius: 999, background: '#F3EFF7' }}>
                    <div style={{ display: 'flex', width: `${(b.pct / maxPct) * 100}%`, height: 12, borderRadius: 999, background: ACCORD_LIQUID[b.c] }} />
                  </div>
                  <span style={{ width: 44, textAlign: 'right', fontFamily: 'Display', color: C.text }}>{b.pct}%</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 14, color: C.text3, marginTop: 'auto' }}>{OG_SITE_URL_LABEL}</div>
          </div>
        </div>
      </div>
    ),
    { width: OG_W, height: OG_H, fonts: fontConfig(assets) },
  );
}

/**
 * 性格診断×香水の考察記事のOG（/personality/[slug]）。
 * 左に見出し、右に16タイプのキャラ絵を4×4で並べる。arts は slug 順の data URI。
 */
export function renderCrossOg(
  title: string,
  subtitle: string,
  note: string,
  pills: string[],
  arts: { art: string | null; liquid: string }[],
  assets: OgAssets,
  accent: 'rose' | 'lav' = 'rose',
): ImageResponse {
  const ac = accent === 'rose' ? C.rose : C.lav;
  const acSoft = accent === 'rose' ? C.roseSoft : C.lavSoft;
  return new ImageResponse(
    (
      <div style={{ width: OG_W, height: OG_H, display: 'flex', background: C.bg, position: 'relative', fontFamily: 'Body', color: C.text, overflow: 'hidden' }}>
        <Blobs />
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 50,
            width: 1080,
            height: 530,
            background: C.card,
            borderRadius: 32,
            border: `1px solid ${C.border}`,
            boxShadow: '0 30px 60px -30px rgba(120,80,160,0.35)',
            display: 'flex',
            padding: '40px 44px',
            gap: 30,
          }}
        >
          {/* 左: 見出し */}
          <div style={{ display: 'flex', flexDirection: 'column', width: 520, gap: 18 }}>
            <Logo src={assets.logo} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              <span style={{ display: 'flex', fontFamily: 'Display', fontSize: 52, lineHeight: 1.25, color: C.text }}>{title}</span>
              <span style={{ display: 'flex', fontSize: 20, lineHeight: 1.6, color: C.text2 }}>{subtitle}</span>
            </div>
            <div style={{ display: 'flex', marginTop: 8, padding: '14px 18px', borderRadius: 16, background: '#FAF7FC', border: `1px solid ${C.border}` }}>
              <span style={{ display: 'flex', fontSize: 17, lineHeight: 1.6, color: C.text2 }}>{note}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
              {pills.map((t) => (
                <div key={t} style={{ display: 'flex', padding: '7px 16px', borderRadius: 999, background: acSoft, color: ac, fontSize: 16, fontFamily: 'Display' }}>
                  {t}
                </div>
              ))}
            </div>
            <span style={{ display: 'flex', fontSize: 14, color: C.text3 }}>{OG_SITE_URL_LABEL}</span>
          </div>
          {/* 右: 16タイプのキャラ絵 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignContent: 'center', width: 452 }}>
            {arts.map((a, i) => (
              <div
                key={i}
                style={{
                  width: 98,
                  height: 98,
                  borderRadius: 49,
                  background: a.liquid,
                  display: 'flex',
                  overflow: 'hidden',
                  boxShadow: `0 0 0 4px #fff, 0 0 0 5px ${a.liquid}`,
                }}
              >
                {a.art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.art} width={98} height={98} alt="" style={{ borderRadius: 49, objectFit: 'cover' }} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: OG_W, height: OG_H, fonts: fontConfig(assets) },
  );
}

/** 記事・既定の OG（label 無しならサイト全体の既定）。art は右上の丸に入れる絵（data URI）。 */
export function renderLabelOg(assets: OgAssets, label: string | null, accentColor?: string, art: string | null = null): ImageResponse {
  const title = label ?? '香水診断';
  const accent = accentColor ?? C.rose;
  return new ImageResponse(
    (
      <div style={{ width: OG_W, height: OG_H, display: 'flex', background: C.bg, position: 'relative', fontFamily: 'Body', color: C.text, overflow: 'hidden' }}>
        <Blobs />
        <div style={{ position: 'absolute', left: 60, top: 50, width: 1080, height: 530, background: C.card, borderRadius: 32, border: `1px solid ${C.border}`, boxShadow: '0 30px 60px -30px rgba(120,80,160,0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 56px' }}>
          <Logo src={assets.logo} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: label ? 58 : 84, lineHeight: 1.3, color: C.text }}>{title}</div>
            <div style={{ display: 'flex', fontSize: 26, color: C.text2 }}>{OG_TAGLINE}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {OG_SUBLINE.split(/[・／]/)
                .filter(Boolean)
                .map((s) => (
                  <div key={s} style={{ display: 'flex', padding: '6px 14px', borderRadius: 999, background: C.roseSoft, color: C.rose, fontSize: 15, fontFamily: 'Body' }}>
                    {s.trim()}
                  </div>
                ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {ACCORD_CODES.map((c) => (
                <div key={c} style={{ display: 'flex', width: 18, height: 18, borderRadius: 9, background: ACCORD_LIQUID[c] }} />
              ))}
            </div>
            <div style={{ display: 'flex', fontSize: 15, color: C.text3 }}>{OG_SITE_URL_LABEL}</div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 56,
              top: 44,
              width: 120,
              height: 120,
              borderRadius: 60,
              background: accent,
              display: 'flex',
              overflow: 'hidden',
              boxShadow: `0 0 0 5px #fff, 0 0 0 6px ${accent}`,
            }}
          >
            {art ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art} width={120} height={120} alt="" style={{ borderRadius: 60, objectFit: 'cover' }} />
            ) : null}
          </div>
        </div>
      </div>
    ),
    { width: OG_W, height: OG_H, fonts: fontConfig(assets) },
  );
}
