import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { ACCORD_CODES, type AccordCode } from '@/data/schema';
import { ACCORD_LIQUID, ACCORD_NAME_JA, TYPE_LIQUID } from '@/data/palette';
import { getTypeByCode } from '@/data/types';
import { decodeDigest, representativeScores } from '@/lib/scoring';
import { allowedOgLabels, OG_DEFAULT_TITLE, OG_SITE_URL_LABEL, OG_SUBLINE, OG_TAGLINE } from '@/lib/og-labels';

/**
 * 動的OG画像 `/api/og`
 * - パラメータ: type（16コードのホワイトリスト）, d（任意, 16hex）, label（ホワイトリスト内の見出し）
 * - 白いカード + 淡いローズ／ラベンダーの地。タイプ名・読み・キャッチ・タグ・調香ノート・香調バー
 * - サブセット化した woff をバンドル。d 不正時はタイプ代表値で描画（500 を返さない）。画像URLの外部参照なし。
 */
export const runtime = 'edge';

const W = 1200;
const H = 630;

const C = {
  bg: '#FBF8FC',
  rose: '#FF5C8D',
  roseSoft: '#FFE3EC',
  lav: '#8B7CF6',
  lavSoft: '#EBE6FF',
  card: '#FFFFFF',
  border: '#EFE8F3',
  text: '#1E1B2E',
  text2: '#6E6785',
  text3: '#A19BB3',
};

let fontsPromise: Promise<{ display: ArrayBuffer; body: ArrayBuffer }> | null = null;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(new URL('./fonts/display.woff', import.meta.url)).then((r) => r.arrayBuffer()),
      fetch(new URL('./fonts/body.woff', import.meta.url)).then((r) => r.arrayBuffer()),
    ]).then(([display, body]) => ({ display, body }));
  }
  return fontsPromise;
}

const CACHE = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000';

function Blobs() {
  return (
    <>
      <div style={{ position: 'absolute', left: -120, top: -140, width: 520, height: 520, borderRadius: 260, background: '#FFE3EC', opacity: 0.9, display: 'flex' }} />
      <div style={{ position: 'absolute', right: -140, bottom: -200, width: 560, height: 560, borderRadius: 280, background: '#EBE6FF', opacity: 0.95, display: 'flex' }} />
    </>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width="34" height="34" viewBox="0 0 40 40">
        <rect x="2" y="2" width="36" height="36" rx="11" fill="#FF6B9A" />
        <path d="M20 9.5 C20 9.5, 12 18.5, 12 23.5 C12 28 15.6 31 20 31 C24.4 31 28 28 28 23.5 C28 18.5 20 9.5 20 9.5 Z" fill="#fff" />
      </svg>
      <span style={{ fontFamily: 'Display', fontSize: 24, color: C.text }}>調香箋</span>
      <span style={{ fontFamily: 'Body', fontSize: 15, color: C.text3 }}>香水診断</span>
    </div>
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
    { name: 'Display', data: fonts.display, weight: 700 as const, style: 'normal' as const },
    { name: 'Body', data: fonts.body, weight: 400 as const, style: 'normal' as const },
  ];

  // ---------- タイプ結果カード ----------
  if (type && !label) {
    const scores = decodeDigest(d) ?? representativeScores(type.code);
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
        <div style={{ width: W, height: H, display: 'flex', background: C.bg, position: 'relative', fontFamily: 'Body', color: C.text, overflow: 'hidden' }}>
          <Blobs />
          {/* カード */}
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
            {/* 左: 丸 + 名前 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380, gap: 18 }}>
              <div style={{ width: 190, height: 190, borderRadius: 95, background: liquid, opacity: 0.9, display: 'flex', boxShadow: `0 0 0 8px #fff, 0 0 0 9px ${liquid}` }} />
              <div style={{ display: 'flex', fontSize: 16, color: C.text2, marginTop: 6 }}>あなたの香水タイプは</div>
              <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 74, lineHeight: 1, color: C.text }}>{type.name}</div>
              <div style={{ display: 'flex', fontSize: 16, color: C.text3, letterSpacing: 4 }}>{type.kana}</div>
            </div>
            {/* 右: キャッチ・タグ・ノート・バー */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: 36, gap: 18, minWidth: 0 }}>
              <Logo />
              <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 34, lineHeight: 1.4, color: C.text }}>{type.catch}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {tags.map((t) => (
                  <div key={t} style={{ display: 'flex', padding: '6px 14px', borderRadius: 999, background: C.lavSoft, color: '#5F4FD6', fontSize: 15, fontFamily: 'Display' }}>
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
      { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
    );
  }

  // ---------- 記事・既定 OG ----------
  const title = label ?? OG_DEFAULT_TITLE;
  const accent = type ? TYPE_LIQUID[type.code] : C.rose;

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', background: C.bg, position: 'relative', fontFamily: 'Body', color: C.text, overflow: 'hidden' }}>
        <Blobs />
        <div style={{ position: 'absolute', left: 60, top: 50, width: 1080, height: 530, background: C.card, borderRadius: 32, border: `1px solid ${C.border}`, boxShadow: '0 30px 60px -30px rgba(120,80,160,0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 56px' }}>
          <Logo />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: label ? 58 : 84, lineHeight: 1.3, color: C.text }}>{title}</div>
            <div style={{ display: 'flex', fontSize: 26, color: C.text2 }}>{OG_TAGLINE}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {OG_SUBLINE.split(/[・／]/).filter(Boolean).map((s) => (
                <div key={s} style={{ display: 'flex', padding: '6px 14px', borderRadius: 999, background: C.roseSoft, color: '#E8467A', fontSize: 15, fontFamily: 'Display' }}>
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
          <div style={{ position: 'absolute', right: 56, top: 44, width: 120, height: 120, borderRadius: 60, background: accent, opacity: 0.85, display: 'flex' }} />
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
  );
}
