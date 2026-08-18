import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { ACCORD_CODES, type AccordCode } from '@/data/schema';
import { COLORS, TYPE_LIQUID } from '@/data/palette';
import { getTypeByCode } from '@/data/types';
import { decodeDigest, representativeScores } from '@/lib/scoring';
import {
  allowedOgLabels,
  OG_DEFAULT_TITLE,
  OG_PHARMACY,
  OG_SITE_LABEL,
  OG_SITE_URL_LABEL,
  OG_SUBLINE,
  OG_TAGLINE,
} from '@/lib/og-labels';

/**
 * §10.2 動的OG画像 `/api/og`
 * - パラメータ: type（16コードのホワイトリスト）, d（任意, 16hex）, label（ホワイトリスト内の見出し）
 * - 構図: 左1/3に液体色の瓶のシルエット、右2/3が箋紙。タイプ名（横組み大級数）、コード、Top/Middle/Last、右下に落款
 * - サブセット化した woff をバンドル。d 不正時はタイプ代表値で描画（500 を返さない）。
 * - 画像URLの外部参照なし（テキストと SVG のみ）。
 */
export const runtime = 'edge';

const W = 1200;
const H = 630;

let fontsPromise: Promise<{ display: ArrayBuffer; mono: ArrayBuffer; body: ArrayBuffer }> | null = null;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(new URL('./fonts/display.woff', import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL('./fonts/mono.woff', import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL('./fonts/body.woff', import.meta.url)).then((r) => r.arrayBuffer()),
    ]).then(([display, mono, body]) => ({ display, mono, body }));
  }
  return fontsPromise;
}

function radarPath(scores: Record<AccordCode, number>, cx: number, cy: number, R: number): string {
  const max = Math.max(1, ...ACCORD_CODES.map((c) => scores[c]));
  return (
    ACCORD_CODES.map((c, i) => {
      const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      const r = (Math.max(0, scores[c]) / max) * R;
      return `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
    }).join(' ') + ' Z'
  );
}

function ringPoints(cx: number, cy: number, R: number): string {
  return ACCORD_CODES.map((_, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    return `${(cx + Math.cos(a) * R).toFixed(1)},${(cy + Math.sin(a) * R).toFixed(1)}`;
  }).join(' ');
}

const CACHE = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type') ?? '';
  const d = searchParams.get('d');
  const labelParam = searchParams.get('label') ?? '';

  const type = getTypeByCode(typeParam);
  const label = allowedOgLabels().has(labelParam) ? labelParam : null;

  const fonts = await loadFonts();
  const fontConfig = [
    { name: 'Display', data: fonts.display, weight: 400 as const, style: 'normal' as const },
    { name: 'Mono', data: fonts.mono, weight: 400 as const, style: 'normal' as const },
    { name: 'Body', data: fonts.body, weight: 400 as const, style: 'normal' as const },
  ];

  // ---------- タイプ結果カード ----------
  if (type && !label) {
    const scores = decodeDigest(d) ?? representativeScores(type.code);
    const liquid = TYPE_LIQUID[type.code];
    const isPersonal = !!decodeDigest(d);
    const chars = Array.from(type.name);

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: 'flex',
            background: COLORS.bottle,
            fontFamily: 'Body',
            color: COLORS.sumi,
          }}
        >
          {/* 左1/3: 瓶のシルエット */}
          <div
            style={{
              width: 400,
              height: H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <svg width="220" height="480" viewBox="0 0 220 480">
              <path
                d="M78 20 H142 V78 L176 118 V440 Q176 464 152 464 H68 Q44 464 44 440 V118 L78 78 Z"
                fill={COLORS.glass}
              />
              <path d="M44 240 H176 V440 Q176 464 152 464 H68 Q44 464 44 440 Z" fill={liquid} />
              <path
                d="M78 20 H142 V78 L176 118 V440 Q176 464 152 464 H68 Q44 464 44 440 V118 L78 78 Z"
                fill="none"
                stroke={COLORS.white}
                strokeOpacity="0.7"
                strokeWidth="2.5"
              />
              <rect x="70" y="0" width="80" height="20" rx="3" fill={COLORS.white} fillOpacity="0.9" />
              <rect x="70" y="150" width="80" height="60" fill={COLORS.paper} />
            </svg>
            {/* 瓶のラベル文字（satori は SVG <text> 非対応のため div で重ねる） */}
            <div
              style={{
                position: 'absolute',
                left: 160,
                top: 225,
                width: 80,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Display',
                fontSize: 26,
                letterSpacing: 4,
                color: COLORS.sumi,
              }}
            >
              {type.name}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 40,
                bottom: 34,
                fontFamily: 'Mono',
                fontSize: 16,
                letterSpacing: 2,
                color: COLORS.verdigris,
                display: 'flex',
              }}
            >
              {OG_SITE_URL_LABEL}
            </div>
          </div>

          {/* 右2/3: 箋紙 */}
          <div
            style={{
              flex: 1,
              margin: '34px 34px 34px 0',
              background: COLORS.paper,
              display: 'flex',
              flexDirection: 'column',
              padding: '30px 38px 30px 42px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'Mono',
                fontSize: 15,
                letterSpacing: 1.5,
                color: 'rgba(38,34,28,0.6)',
                paddingBottom: 12,
                borderBottom: '1px solid rgba(38,34,28,0.3)',
              }}
            >
              <span>{OG_PHARMACY}</span>
              <span>{isPersonal ? `Batch No. ${d?.slice(0, 6).toUpperCase()}` : 'SPECIMEN'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: 26 }}>
              <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 132, lineHeight: 1, letterSpacing: 10 }}>
                {chars.join('')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 14, gap: 6 }}>
                <span style={{ fontFamily: 'Display', fontSize: 26, letterSpacing: 4, color: 'rgba(38,34,28,0.7)' }}>
                  {type.kana}
                </span>
                <span style={{ fontFamily: 'Mono', fontSize: 18, letterSpacing: 2, color: 'rgba(38,34,28,0.6)' }}>
                  {type.code}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 30, letterSpacing: 2, marginTop: 14 }}>
              {type.catch}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, gap: 8, width: 520 }}>
              {(
                [
                  ['Top', type.notes.top.join('、')],
                  ['Middle', type.notes.middle.join('、')],
                  ['Last', type.notes.last.join('、')],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    gap: 18,
                    fontSize: 20,
                    paddingBottom: 6,
                    borderBottom: '1px solid rgba(38,34,28,0.12)',
                  }}
                >
                  <span style={{ fontFamily: 'Mono', fontSize: 15, width: 76, color: 'rgba(38,34,28,0.6)', paddingTop: 4 }}>
                    {k}
                  </span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            {/* レーダー */}
            <svg
              width="150"
              height="150"
              viewBox="0 0 200 200"
              style={{ position: 'absolute', right: 214, bottom: 26 }}
            >
              <polygon points={ringPoints(100, 100, 62)} fill="none" stroke={COLORS.sumi} strokeOpacity="0.45" />
              <polygon points={ringPoints(100, 100, 41)} fill="none" stroke={COLORS.sumi} strokeOpacity="0.18" />
              <polygon points={ringPoints(100, 100, 20)} fill="none" stroke={COLORS.sumi} strokeOpacity="0.18" />
              <path d={radarPath(scores, 100, 100, 62)} fill={liquid} fillOpacity="0.55" stroke={liquid} strokeWidth="2" />
            </svg>

            {/* 落款 */}
            <div
              style={{
                position: 'absolute',
                right: 40,
                bottom: 36,
                width: 132,
                height: 132,
                background: COLORS.rakkan,
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-3deg)',
                border: `2px solid ${COLORS.rakkan}`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 8,
                  border: `2px solid ${COLORS.paper}`,
                  display: 'flex',
                }}
              />
              <span style={{ fontFamily: 'Display', fontSize: 50, color: COLORS.paper, lineHeight: 1 }}>{chars[0] ?? ''}</span>
              <span style={{ fontFamily: 'Display', fontSize: 50, color: COLORS.paper, lineHeight: 1 }}>{chars[1] ?? ''}</span>
            </div>
          </div>
        </div>
      ),
      { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
    );
  }

  // ---------- 記事・既定 OG ----------
  const liquid = type ? TYPE_LIQUID[type.code] : COLORS.amber;
  const title = label ?? OG_DEFAULT_TITLE;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          background: COLORS.bottle,
          color: COLORS.white,
          fontFamily: 'Body',
          padding: '56px 64px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: 18, letterSpacing: 3, color: COLORS.verdigris }}>
            {OG_PHARMACY}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 820 }}>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: label ? 56 : 88, lineHeight: 1.3, letterSpacing: 3 }}>
              {title}
            </div>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 30, letterSpacing: 2, color: 'rgba(237,232,220,0.8)' }}>
              {OG_TAGLINE}
            </div>
            <div style={{ display: 'flex', fontSize: 20, color: 'rgba(237,232,220,0.55)' }}>{OG_SUBLINE}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={{ fontFamily: 'Display', fontSize: 24, letterSpacing: 4 }}>{OG_SITE_LABEL}</span>
            <span style={{ fontFamily: 'Mono', fontSize: 16, letterSpacing: 2, color: COLORS.verdigris }}>
              {OG_SITE_URL_LABEL}
            </span>
          </div>
        </div>
        <svg width="200" height="440" viewBox="0 0 220 480" style={{ position: 'absolute', right: 80, top: 95 }}>
          <path d="M78 20 H142 V78 L176 118 V440 Q176 464 152 464 H68 Q44 464 44 440 V118 L78 78 Z" fill={COLORS.glass} />
          <path d="M44 260 H176 V440 Q176 464 152 464 H68 Q44 464 44 440 Z" fill={liquid} />
          <path
            d="M78 20 H142 V78 L176 118 V440 Q176 464 152 464 H68 Q44 464 44 440 V118 L78 78 Z"
            fill="none"
            stroke={COLORS.white}
            strokeOpacity="0.7"
            strokeWidth="2.5"
          />
          <rect x="70" y="0" width="80" height="20" rx="3" fill={COLORS.white} fillOpacity="0.9" />
        </svg>
      </div>
    ),
    { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
  );
}
