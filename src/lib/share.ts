import { ACCORD_CODES, type AccordCode, type ScentType } from '@/data/schema';
import { COLORS } from '@/data/palette';
import { absUrl } from './seo';

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

export function lineShareUrl(type: ScentType, url: string): string {
  return `https://line.me/R/share?text=${encodeURIComponent(buildShareText(type, url))}`;
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

function drawRadar(
  ctx: CanvasRenderingContext2D,
  scores: Record<AccordCode, number>,
  cx: number,
  cy: number,
  R: number,
  color: string,
  ink: string,
  monoFont: string,
) {
  const max = Math.max(1, ...ACCORD_CODES.map((c) => scores[c]));
  ctx.save();
  ctx.lineWidth = 1.5;
  for (const k of [0.33, 0.66, 1]) {
    ctx.beginPath();
    ACCORD_CODES.forEach((_, i) => {
      const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      const x = cx + Math.cos(a) * R * k;
      const y = cy + Math.sin(a) * R * k;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = ink;
    ctx.globalAlpha = k === 1 ? 0.45 : 0.18;
    ctx.stroke();
  }
  ctx.globalAlpha = 0.15;
  ACCORD_CODES.forEach((_, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ACCORD_CODES.forEach((c, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    const r = (Math.max(0, scores[c]) / max) * R;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = `20px ${monoFont}`;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.7;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ACCORD_CODES.forEach((c, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    ctx.fillText(c, cx + Math.cos(a) * (R + 40), cy + Math.sin(a) * (R + 40));
  });
  ctx.restore();
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

export interface StoryImageParams {
  type: ScentType;
  scores: Record<AccordCode, number>;
  batchNo: string;
  siteLabel?: string;
}

/** 1080×1920 の縦長画像を生成して Blob を返す */
export async function generateStoryImage({
  type,
  scores,
  batchNo,
  siteLabel = 'kosui-shindan.com',
}: StoryImageParams): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');

  const display = cssVar('--ff-display', "'Shippori Mincho B1', serif");
  const body = cssVar('--ff-body', "'Zen Kaku Gothic New', sans-serif");
  const mono = cssVar('--ff-data', "'IBM Plex Mono', monospace");
  await ensureFonts([`120px ${display}`, `700 60px ${display}`, `30px ${body}`, `24px ${mono}`]);

  // 背景（薬瓶）
  ctx.fillStyle = COLORS.bottle;
  ctx.fillRect(0, 0, W, H);

  // 上部ラベル
  ctx.fillStyle = COLORS.verdigris;
  ctx.font = `24px ${mono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CHOKOSEN PHARMACY  —  香水診断・調香箋', W / 2, 150);

  // 箋紙
  const px = 90;
  const py = 220;
  const pw = W - px * 2;
  const ph = 1400;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = COLORS.paper;
  roundRect(ctx, px, py, pw, ph, 4);
  ctx.fill();
  ctx.restore();
  // 内枠
  ctx.strokeStyle = 'rgba(38,34,28,0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 22, py + 22, pw - 44, ph - 44);

  // 箋のヘッダ
  ctx.fillStyle = 'rgba(38,34,28,0.6)';
  ctx.font = `22px ${mono}`;
  ctx.textAlign = 'left';
  ctx.fillText('CHOKOSEN PHARMACY', px + 60, py + 90);
  ctx.textAlign = 'right';
  ctx.fillText(`Batch No. ${batchNo}`, px + pw - 60, py + 90);
  ctx.strokeStyle = 'rgba(38,34,28,0.3)';
  ctx.beginPath();
  ctx.moveTo(px + 60, py + 116);
  ctx.lineTo(px + pw - 60, py + 116);
  ctx.stroke();

  // タイプ名（縦に二文字を積む）
  const nameX = px + 190;
  const nameTop = py + 200;
  ctx.fillStyle = COLORS.sumi;
  ctx.font = `180px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const chars = Array.from(type.name);
  chars.forEach((c, i) => ctx.fillText(c, nameX, nameTop + i * 200));
  // 読み・コード（縦）
  ctx.font = `28px ${display}`;
  ctx.fillStyle = 'rgba(38,34,28,0.6)';
  Array.from(type.kana).forEach((c, i) => ctx.fillText(c, nameX + 135, nameTop + 10 + i * 34));
  ctx.font = `22px ${mono}`;
  ctx.save();
  ctx.translate(nameX + 135, nameTop + 10 + type.kana.length * 34 + 30);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(type.code, 0, 0);
  ctx.restore();

  // キャッチ
  const rightX = px + 400;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.sumi;
  ctx.font = `40px ${display}`;
  const catchLines = wrapText(ctx, type.catch, pw - 400 - 60);
  catchLines.forEach((l, i) => ctx.fillText(l, rightX, py + 250 + i * 56));

  // 調香表
  const rows: [string, string][] = [
    ['Top', type.notes.top.join('、')],
    ['Middle', type.notes.middle.join('、')],
    ['Last', type.notes.last.join('、')],
  ];
  let ry = py + 250 + catchLines.length * 56 + 60;
  ctx.strokeStyle = 'rgba(38,34,28,0.12)';
  rows.forEach(([k, v]) => {
    ctx.fillStyle = 'rgba(38,34,28,0.6)';
    ctx.font = `22px ${mono}`;
    ctx.fillText(k, rightX, ry);
    ctx.fillStyle = COLORS.sumi;
    ctx.font = `28px ${body}`;
    const lines = wrapText(ctx, v, pw - 400 - 60 - 130);
    lines.forEach((l, i) => ctx.fillText(l, rightX + 130, ry + i * 38));
    ry += Math.max(1, lines.length) * 38 + 22;
    ctx.beginPath();
    ctx.moveTo(rightX, ry - 12);
    ctx.lineTo(px + pw - 60, ry - 12);
    ctx.stroke();
    ry += 18;
  });

  // レーダー
  drawRadar(ctx, scores, px + 300, py + ph - 330, 190, type.liquidColor, COLORS.sumi, mono);

  // 落款印
  const sx = px + pw - 60 - 190;
  const sy = py + ph - 60 - 190;
  ctx.save();
  ctx.translate(sx + 95, sy + 95);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.fillStyle = COLORS.rakkan;
  roundRect(ctx, -95, -95, 190, 190, 5);
  ctx.fill();
  ctx.strokeStyle = COLORS.paper;
  ctx.lineWidth = 3;
  ctx.strokeRect(-83, -83, 166, 166);
  ctx.fillStyle = COLORS.paper;
  ctx.font = `700 70px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chars[0] ?? '', 0, -42);
  ctx.fillText(chars[1] ?? '', 0, 42);
  ctx.restore();

  // 下部
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.white;
  ctx.font = `34px ${display}`;
  ctx.fillText('12の質問で、あなたに似合う香水がわかる。', W / 2, H - 200);
  ctx.fillStyle = COLORS.verdigris;
  ctx.font = `24px ${mono}`;
  ctx.fillText(`香水診断 調香箋  ${siteLabel}`, W / 2, H - 140);

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
