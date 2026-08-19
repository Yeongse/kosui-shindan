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

let logoPromise: Promise<string | null> | null = null;
/** ロゴ画像（public/img/brand/logo-mark.png）を data URI で同梱。無ければ null */
function loadLogo() {
  if (!logoPromise) {
    logoPromise = fetch(new URL('../../../../public/img/brand/logo-mark.png', import.meta.url))
      .then(async (r) => {
        if (!r.ok) return null;
        const buf = await r.arrayBuffer();
        let bin = '';
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i += 0x8000) {
          bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return `data:image/png;base64,${btoa(bin)}`;
      })
      .catch(() => null);
  }
  return logoPromise;
}

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type') ?? '';
  const d = searchParams.get('d');
  const labelParam = searchParams.get('label') ?? '';

  const type = getTypeByCode(typeParam);
  const label = allowedOgLabels().has(labelParam) ? labelParam : null;

  const [fonts, logo] = await Promise.all([loadFonts(), loadLogo()]);
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
            {/* 落款印 */}
            <div style={{ position: 'absolute', right: 44, top: 40, width: 92, height: 92, borderRadius: 10, background: C.rose, transform: 'rotate(-5deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              <div style={{ position: 'absolute', inset: 6, border: '2px solid rgba(255,255,255,0.7)', borderRadius: 6, display: 'flex' }} />
              <span style={{ fontFamily: 'Display', fontSize: 34, color: '#fff', lineHeight: 1.05 }}>{Array.from(type.name)[0] ?? ''}</span>
              <span style={{ fontFamily: 'Display', fontSize: 34, color: '#fff', lineHeight: 1.05 }}>{Array.from(type.name)[1] ?? ''}</span>
            </div>
            {/* 左: 丸 + 名前 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380, gap: 18 }}>
              <div style={{ width: 190, height: 190, borderRadius: 95, background: liquid, opacity: 0.9, display: 'flex', boxShadow: `0 0 0 6px #fff, 0 0 0 8px ${liquid}, 0 0 0 14px #fff, 0 0 0 15px ${liquid}88` }} />
              <div style={{ display: 'flex', fontSize: 16, color: C.text2, marginTop: 6 }}>あなたの香水タイプは</div>
              <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 78, lineHeight: 1, letterSpacing: 8, color: C.text }}>{type.name}</div>
              <div style={{ display: 'flex', fontSize: 16, color: C.text3, letterSpacing: 4 }}>{type.kana}</div>
            </div>
            {/* 右: キャッチ・タグ・ノート・バー */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: 36, paddingRight: 110, gap: 18, minWidth: 0 }}>
              <Logo src={logo} />
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
          <Logo src={logo} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: label ? 58 : 84, lineHeight: 1.3, color: C.text }}>{title}</div>
            <div style={{ display: 'flex', fontSize: 26, color: C.text2 }}>{OG_TAGLINE}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {OG_SUBLINE.split(/[・／]/).filter(Boolean).map((s) => (
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
          <div style={{ position: 'absolute', right: 56, top: 44, width: 120, height: 120, borderRadius: 60, background: accent, opacity: 0.85, display: 'flex' }} />
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fontConfig, headers: { 'Cache-Control': CACHE } },
  );
}
