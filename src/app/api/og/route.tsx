import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { ACCORD_CODES, type AccordCode } from '@/data/schema';
import { TYPE_LIQUID } from '@/data/palette';
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
 * 動的OG画像 `/api/og` — 料紙の上の色紙。
 * - パラメータ: type（16コードのホワイトリスト）, d（任意, 16hex）, label（ホワイトリスト内の見出し）
 * - 構図: 生成りの料紙に飛雲、右に色紙（タイプ名は筆文字・縦組み）、調香表、レーダー、朱の落款
 * - サブセット化した woff をバンドル。d 不正時はタイプ代表値で描画（500 を返さない）。画像URLの外部参照なし。
 */
export const runtime = 'edge';

const W = 1200;
const H = 630;

const C = {
  paper: '#F3EADB',
  paper2: '#ECE1CC',
  paper3: '#FBF6EC',
  sumi: '#2A2420',
  usuzumi: '#6B6157',
  nibi: '#9B9085',
  shu: '#B0432D',
  kin: '#B3903E',
  fuji: '#8F7AA3',
  asagi: '#5B8791',
};

let fontsPromise: Promise<{ display: ArrayBuffer; brush: ArrayBuffer }> | null = null;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(new URL('./fonts/display.woff', import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL('./fonts/brush.woff', import.meta.url)).then((r) => r.arrayBuffer()),
    ]).then(([display, brush]) => ({ display, brush }));
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

/** 飛雲（背景装飾・SVG） */
function Kumo({ x, y, w, color, opacity }: { x: number; y: number; w: number; color: string; opacity: number }) {
  const h = w * 0.28;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 400 112"
      style={{ position: 'absolute', left: x, top: y, opacity }}
    >
      <path
        d="M20 70 C10 40, 60 20, 110 34 C130 8, 200 4, 230 30 C270 10, 340 20, 350 52 C390 56, 392 90, 350 94 C300 110, 200 104, 150 96 C100 108, 30 100, 20 70 Z"
        fill={color}
      />
    </svg>
  );
}

/** 金砂子（小さな粒を散らす・決定的） */
function Sunago({ x, y, w, h, n, seed }: { x: number; y: number; w: number; h: number; n: number; seed: number }) {
  const pts: { cx: number; cy: number; r: number }[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < n; i++) pts.push({ cx: rnd() * w, cy: rnd() * h, r: 0.8 + rnd() * 2.2 });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: x, top: y }}>
      {pts.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={C.kin} fillOpacity={0.55} />
      ))}
    </svg>
  );
}

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
    { name: 'Brush', data: fonts.brush, weight: 400 as const, style: 'normal' as const },
  ];

  const Background = () => (
    <>
      <Kumo x={-40} y={-20} w={520} color={C.fuji} opacity={0.16} />
      <Kumo x={760} y={470} w={520} color={C.asagi} opacity={0.14} />
      <Sunago x={900} y={0} w={300} h={220} n={70} seed={7} />
      <Sunago x={0} y={430} w={320} h={200} n={60} seed={19} />
    </>
  );

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
            background: C.paper,
            fontFamily: 'Display',
            color: C.sumi,
            position: 'relative',
          }}
        >
          <Background />

          {/* 左: サイト名（縦）と一文 */}
          <div
            style={{
              width: 300,
              height: H,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '48px 0 40px 56px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', fontSize: 16, letterSpacing: 6, color: C.usuzumi }}>香水診断</div>
              <div style={{ display: 'flex', fontFamily: 'Brush', fontSize: 44, letterSpacing: 6, color: C.sumi }}>調香箋</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', fontSize: 20, lineHeight: 1.6, color: C.sumi, letterSpacing: 2 }}>
                {OG_TAGLINE}
              </div>
              <div style={{ display: 'flex', fontSize: 15, letterSpacing: 2, color: C.nibi }}>{OG_SITE_URL_LABEL}</div>
            </div>
          </div>

          {/* 右: 色紙 */}
          <div
            style={{
              position: 'absolute',
              left: 330,
              top: 36,
              width: 830,
              height: 558,
              background: C.paper3,
              border: `1px solid rgba(179,144,62,0.35)`,
              boxShadow: '0 24px 48px -28px rgba(42,36,32,0.45)',
              display: 'flex',
              padding: 10,
            }}
          >
            <div
              style={{
                flex: 1,
                border: `1px solid rgba(179,144,62,0.35)`,
                display: 'flex',
                flexDirection: 'column',
                padding: '22px 30px 22px 30px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 15,
                  letterSpacing: 4,
                  color: C.usuzumi,
                  paddingBottom: 12,
                  borderBottom: `1px solid rgba(42,36,32,0.2)`,
                }}
              >
                <span>{OG_PHARMACY}</span>
                <span>{isPersonal ? `調合番号 第${d?.slice(0, 6).toUpperCase()}号` : '調合番号 見本'}</span>
              </div>

              <div style={{ display: 'flex', flex: 1, marginTop: 18, gap: 30 }}>
                {/* 縦書きタイプ名（筆） */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {chars.map((ch, i) => (
                      <div key={i} style={{ display: 'flex', fontFamily: 'Brush', fontSize: 150, lineHeight: 1.05, color: C.sumi }}>
                        {ch}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', color: C.usuzumi, fontSize: 20, letterSpacing: 2 }}>
                      {Array.from(type.kana).map((k, i) => (
                        <span key={i} style={{ lineHeight: 1.25 }}>
                          {k}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', fontSize: 14, letterSpacing: 2, color: C.nibi }}>{type.code}</div>
                  </div>
                </div>

                {/* 右側: キャッチ・調香表・レーダー */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', fontSize: 30, letterSpacing: 3, lineHeight: 1.5 }}>{type.catch}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18, gap: 6, width: 440 }}>
                    {(
                      [
                        ['トップ', type.notes.top.join('、')],
                        ['ミドル', type.notes.middle.join('、')],
                        ['ラスト', type.notes.last.join('、')],
                      ] as const
                    ).map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          gap: 16,
                          fontSize: 19,
                          paddingBottom: 6,
                          borderBottom: '1px solid rgba(42,36,32,0.12)',
                        }}
                      >
                        <span style={{ fontSize: 14, letterSpacing: 3, width: 64, color: C.shu, paddingTop: 5 }}>{k}</span>
                        <span style={{ color: C.sumi }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <svg width="160" height="160" viewBox="0 0 200 200" style={{ position: 'absolute', left: 8, bottom: 6 }}>
                    <polygon points={ringPoints(100, 100, 62)} fill="none" stroke={C.sumi} strokeOpacity="0.4" />
                    <polygon points={ringPoints(100, 100, 41)} fill="none" stroke={C.sumi} strokeOpacity="0.16" />
                    <polygon points={ringPoints(100, 100, 20)} fill="none" stroke={C.sumi} strokeOpacity="0.16" />
                    <path d={radarPath(scores, 100, 100, 62)} fill={liquid} fillOpacity="0.55" stroke={liquid} strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* 落款 */}
              <div
                style={{
                  position: 'absolute',
                  right: 30,
                  bottom: 26,
                  width: 120,
                  height: 120,
                  background: C.shu,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(-3deg)',
                }}
              >
                <div style={{ position: 'absolute', inset: 7, border: `2px solid ${C.paper3}`, display: 'flex' }} />
                <span style={{ fontFamily: 'Display', fontSize: 46, color: C.paper3, lineHeight: 1 }}>{chars[0] ?? ''}</span>
                <span style={{ fontFamily: 'Display', fontSize: 46, color: C.paper3, lineHeight: 1 }}>{chars[1] ?? ''}</span>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
    );
  }

  // ---------- 記事・既定 OG ----------
  const liquid = type ? TYPE_LIQUID[type.code] : C.shu;
  const title = label ?? OG_DEFAULT_TITLE;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          background: C.paper,
          color: C.sumi,
          fontFamily: 'Display',
          padding: '56px 64px',
          position: 'relative',
        }}
      >
        <Background />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{ display: 'flex', fontSize: 18, letterSpacing: 5, color: C.usuzumi }}>香水診断</div>
            <div style={{ display: 'flex', fontFamily: 'Brush', fontSize: 34, letterSpacing: 5 }}>調香箋</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 840 }}>
            <div style={{ display: 'flex', fontSize: label ? 56 : 84, lineHeight: 1.35, letterSpacing: 4, borderLeft: `6px solid ${C.shu}`, paddingLeft: 24 }}>
              {title}
            </div>
            <div style={{ display: 'flex', fontSize: 28, letterSpacing: 2, color: C.usuzumi }}>{OG_TAGLINE}</div>
            <div style={{ display: 'flex', fontSize: 20, color: C.nibi, letterSpacing: 2 }}>{OG_SUBLINE}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={{ fontSize: 22, letterSpacing: 4 }}>{OG_SITE_LABEL}</span>
            <span style={{ fontSize: 16, letterSpacing: 2, color: C.nibi }}>{OG_SITE_URL_LABEL}</span>
          </div>
        </div>
        {/* 右: 朱印 */}
        <div
          style={{
            position: 'absolute',
            right: 84,
            top: 180,
            width: 150,
            height: 150,
            background: liquid,
            borderRadius: 75,
            opacity: 0.9,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 64,
            bottom: 64,
            width: 110,
            height: 110,
            background: C.shu,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-3deg)',
          }}
        >
          <div style={{ position: 'absolute', inset: 7, border: `2px solid ${C.paper3}`, display: 'flex' }} />
          <span style={{ fontSize: 60, color: C.paper3, lineHeight: 1 }}>箋</span>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
  );
}
