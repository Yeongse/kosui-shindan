import { ACCORD_CODES, type AccordCode, type ScentType } from '@/data/schema';
import { absUrl } from './seo';
import { ACCORD_LIQUID as ACCORD_LIQUID_LOCAL, ACCORD_NAME_JA as ACCORD_NAME_JA_LOCAL } from '@/data/palette';

/** 縦長画像の配色（tokens.css と同期） */
const P = {
  bg: '#FCFAF7',
  roseSoft: '#FBEEEA',
  lavSoft: '#E7ECF5',
  card: '#FFFFFF',
  rose: '#E0492F',
  lav: '#2D4F8A',
  text: '#27262B',
  text2: '#6B6A70',
  text3: '#9D9BA2',
};

/**
 * §10 シェア仕様 — intent URL 組立・縦長画像(1080×1920) canvas 生成
 */

export function shareUrlFor(type: ScentType, digest?: string | null): string {
  return absUrl(`/type/${type.slug}${digest ? `?d=${digest}` : ''}`);
}

export function buildShareText(type: ScentType, url: string): string {
  return `私の調香箋は「${type.name}（${type.kana}）」でした。\n${type.catch}\n#調香箋 #香水診断\n${url}`;
}

export function xIntentUrl(type: ScentType, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(buildShareText(type, url))}`;
}

/* ---------- 縦長画像（Instagram ストーリーズ用） ---------- */

function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

async function ensureFonts(specs: string[]): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s)));
    await document.fonts.ready;
  } catch {
    /* フォント未ロードでも描画は続行（フォールバック書体） */
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}




function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const ch of Array.from(text)) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * 画像を読み込む。失敗したら null（描画は色だけのフォールバックにする）。
 * 同一オリジンの画像なので canvas は汚染されず、toBlob で保存できる。
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 画像を円形に切り抜いて中央に収める（cover 相当） */
function drawCircularImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, r: number) {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

export interface StoryImageParams {
  type: ScentType;
  scores: Record<AccordCode, number>;
  batchNo?: string;
  siteLabel?: string;
}

/** 1080×1920 の縦長画像を生成して Blob を返す（白いカード + 淡い地） */
export async function generateStoryImage({
  type,
  scores,
  siteLabel = 'kosui-shindan.com',
}: StoryImageParams): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');

  const display = cssVar('--ff-display', "'Zen Old Mincho', serif");
  const body = cssVar('--ff-body', "'Zen Kaku Gothic New', sans-serif");
  const [, typeArt] = await Promise.all([
    ensureFonts([`900 120px ${display}`, `700 40px ${display}`, `500 30px ${body}`, `400 24px ${body}`]),
    loadImage(`/img/types/${type.slug}.webp`),
  ]);

  // 地
  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = P.roseSoft;
  ctx.beginPath();
  ctx.arc(120, 160, 420, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.lavSoft;
  ctx.beginPath();
  ctx.arc(W - 80, H - 260, 480, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ロゴ
  ctx.fillStyle = P.text;
  ctx.font = `900 40px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('調香箋', W / 2, 150);
  ctx.fillStyle = P.text3;
  ctx.font = `500 24px ${body}`;
  ctx.fillText('香水診断', W / 2, 188);

  // カード
  const px = 80;
  const py = 240;
  const pw = W - px * 2;
  const ph = 1420;
  ctx.save();
  ctx.shadowColor = 'rgba(120,80,160,0.25)';
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = P.card;
  roundRect(ctx, px, py, pw, ph, 44);
  ctx.fill();
  ctx.restore();

  // 丸（タイプのキャラ絵。読み込めなければ液体色で塗る）
  const cx = W / 2;
  const cy = py + 230;
  const r = 150;
  ctx.fillStyle = type.liquidColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  if (typeArt) {
    drawCircularImage(ctx, typeArt, cx, cy, r);
  }
  // 二重の輪（結果カードと同じ意匠）
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = type.liquidColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 162, 0, Math.PI * 2);
  ctx.stroke();

  // 落款印（右上）
  ctx.save();
  ctx.translate(px + pw - 120, py + 120);
  ctx.rotate((-5 * Math.PI) / 180);
  ctx.fillStyle = P.rose;
  roundRect(ctx, -60, -60, 120, 120, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  roundRect(ctx, -50, -50, 100, 100, 8);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `700 44px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const nm = Array.from(type.name);
  ctx.fillText(nm[0] ?? '', 0, -24);
  ctx.fillText(nm[1] ?? '', 0, 26);
  ctx.restore();
  ctx.textBaseline = 'alphabetic';

  // ラベル・名前
  ctx.textAlign = 'center';
  ctx.fillStyle = P.text2;
  ctx.font = `500 26px ${body}`;
  ctx.fillText('わたしの香水タイプは', cx, cy + 230);
  ctx.fillStyle = P.text;
  ctx.font = `900 120px ${display}`;
  ctx.fillText(type.name, cx, cy + 360);
  ctx.fillStyle = P.text3;
  ctx.font = `500 24px ${body}`;
  ctx.fillText(type.kana, cx, cy + 400);
  ctx.fillStyle = P.text;
  ctx.font = `700 38px ${display}`;
  ctx.fillText(type.catch, cx, cy + 470);

  // タグ
  const [accord, temp] = type.code.split('-') as [AccordCode, 'W' | 'C'];
  const tags = [`#${ACCORD_NAME_JA_LOCAL[accord]}系`, `#${temp === 'C' ? 'クール' : 'ウォーム'}`, `#${type.notes.last[0] ?? ''}`];
  ctx.font = `700 24px ${display}`;
  const widths = tags.map((t) => ctx.measureText(t).width + 40);
  let tx = cx - (widths.reduce((a, b) => a + b, 0) + (tags.length - 1) * 12) / 2;
  tags.forEach((t, i) => {
    ctx.fillStyle = P.lavSoft;
    roundRect(ctx, tx, cy + 505, widths[i]!, 46, 23);
    ctx.fill();
    ctx.fillStyle = P.lav;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t, tx + widths[i]! / 2, cy + 528);
    tx += widths[i]! + 12;
  });
  ctx.textBaseline = 'alphabetic';

  // ノート3カード
  const rows: [string, string][] = [
    ['トップ', type.notes.top.join('・')],
    ['ミドル', type.notes.middle.join('・')],
    ['ラスト', type.notes.last.join('・')],
  ];
  const cardW = (pw - 80 - 20) / 3;
  rows.forEach(([k, v], i) => {
    const x = px + 40 + i * (cardW + 10);
    const y = cy + 600;
    ctx.fillStyle = '#FAF7FC';
    roundRect(ctx, x, y, cardW, 150, 24);
    ctx.fill();
    ctx.fillStyle = P.rose;
    ctx.font = `900 22px ${display}`;
    ctx.textAlign = 'center';
    ctx.fillText(k, x + cardW / 2, y + 44);
    ctx.fillStyle = P.text;
    ctx.font = `500 22px ${body}`;
    const lines = wrapText(ctx, v, cardW - 30);
    lines.slice(0, 3).forEach((l, li) => ctx.fillText(l, x + cardW / 2, y + 84 + li * 30));
  });

  // バランスバー（上位4）
  const total = Math.max(1, ACCORD_CODES.reduce((a, c) => a + Math.max(0, scores[c]), 0));
  const bars = [...ACCORD_CODES]
    .map((c) => ({ c, pct: Math.round((Math.max(0, scores[c]) / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  const maxPct = Math.max(1, ...bars.map((b) => b.pct));
  bars.forEach((b, i) => {
    const y = cy + 800 + i * 58;
    ctx.textAlign = 'left';
    ctx.fillStyle = P.text2;
    ctx.font = `500 24px ${body}`;
    ctx.fillText(ACCORD_NAME_JA_LOCAL[b.c], px + 50, y + 20);
    const bx = px + 190;
    const bw = pw - 190 - 130;
    ctx.fillStyle = '#F3EFF7';
    roundRect(ctx, bx, y, bw, 20, 10);
    ctx.fill();
    ctx.fillStyle = ACCORD_LIQUID_LOCAL[b.c];
    roundRect(ctx, bx, y, bw * (b.pct / maxPct), 20, 10);
    ctx.fill();
    ctx.textAlign = 'right';
    ctx.fillStyle = P.text;
    ctx.font = `700 24px ${display}`;
    ctx.fillText(`${b.pct}%`, px + pw - 50, y + 20);
  });

  // 下部
  ctx.textAlign = 'center';
  ctx.fillStyle = P.text2;
  ctx.font = `700 30px ${display}`;
  ctx.fillText('12の質問で、あなたに似合う香水がわかる。', W / 2, H - 150);
  ctx.fillStyle = P.text3;
  ctx.font = `500 24px ${body}`;
  ctx.fillText(siteLabel, W / 2, H - 105);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
