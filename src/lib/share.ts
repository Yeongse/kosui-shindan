import { ACCORD_CODES, type AccordCode, type ScentType } from '@/data/schema';
import { absUrl } from './seo';

/** 縦長画像の配色（紺紙金泥・tokens.css と同期） */
const P = {
  ground: '#13203A',
  ink: '#EEEAE0',
  ink2: '#B9B4A7',
  ink3: '#857F74',
  paper: '#F1EFE7',
  paper3: '#F7F5EE',
  sumi: '#2A2420',
  usuzumi: '#6B6157',
  nibi: '#9B9085',
  paperKin: '#8A6D2F',
  shu: '#C2402A',
  kin: '#CFAE63',
  byakugun: '#A6CDD1',
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

/** 飛雲 */
function drawKumo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string, alpha: number) {
  const k = w / 400;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(20, 70);
  ctx.bezierCurveTo(10, 40, 60, 20, 110, 34);
  ctx.bezierCurveTo(130, 8, 200, 4, 230, 30);
  ctx.bezierCurveTo(270, 10, 340, 20, 350, 52);
  ctx.bezierCurveTo(390, 56, 392, 90, 350, 94);
  ctx.bezierCurveTo(300, 110, 200, 104, 150, 96);
  ctx.bezierCurveTo(100, 108, 30, 100, 20, 70);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 金砂子（決定的な疑似乱数で散らす） */
function drawSunago(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n: number, seed: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  ctx.save();
  ctx.fillStyle = P.kin;
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(x + rnd() * w, y + rnd() * h, 1.5 + rnd() * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
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
  const brush = cssVar('--ff-brush', "'Yuji Syuku', serif");
  const body = display;
  const mono = display;
  await ensureFonts([`180px ${brush}`, `120px ${display}`, `700 60px ${display}`, `30px ${body}`, `24px ${mono}`]);

  // 背景（紺紙）
  ctx.fillStyle = P.ground;
  ctx.fillRect(0, 0, W, H);
  drawKumo(ctx, -80, 40, 620, P.kin, 0.14);
  drawKumo(ctx, 560, 1660, 620, P.byakugun, 0.1);
  drawSunago(ctx, 760, 0, 320, 260, 90, 7);
  drawSunago(ctx, 0, 1640, 340, 280, 80, 19);

  // 上部ラベル
  ctx.fillStyle = P.kin;
  ctx.font = `26px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('香 水 診 断 　 調 香 箋', W / 2, 150);

  // 箋紙
  const px = 90;
  const py = 220;
  const pw = W - px * 2;
  const ph = 1400;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = P.paper;
  roundRect(ctx, px, py, pw, ph, 2);
  ctx.fill();
  ctx.restore();
  // 金の二重枠
  ctx.strokeStyle = 'rgba(207,174,99,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
  ctx.strokeRect(px + 22, py + 22, pw - 44, ph - 44);

  // 箋のヘッダ
  ctx.fillStyle = P.usuzumi;
  ctx.font = `22px ${display}`;
  ctx.textAlign = 'left';
  ctx.fillText('香水診断 調香箋', px + 60, py + 90);
  ctx.textAlign = 'right';
  ctx.fillText(batchNo === 'SPECIMEN' ? '調合番号 見本' : `調合番号 第${batchNo}号`, px + pw - 60, py + 90);
  ctx.strokeStyle = 'rgba(42,36,32,0.3)';
  ctx.beginPath();
  ctx.moveTo(px + 60, py + 116);
  ctx.lineTo(px + pw - 60, py + 116);
  ctx.stroke();

  // タイプ名（縦に二文字を積む・筆）
  const nameX = px + 190;
  const nameTop = py + 200;
  ctx.fillStyle = P.sumi;
  ctx.font = `180px ${brush}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const chars = Array.from(type.name);
  chars.forEach((c, i) => ctx.fillText(c, nameX, nameTop + i * 200));
  // 読み・コード（縦）
  ctx.font = `28px ${display}`;
  ctx.fillStyle = P.usuzumi;
  Array.from(type.kana).forEach((c, i) => ctx.fillText(c, nameX + 135, nameTop + 10 + i * 34));
  ctx.font = `22px ${display}`;
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
  ctx.fillStyle = P.sumi;
  ctx.font = `40px ${display}`;
  const catchLines = wrapText(ctx, type.catch, pw - 400 - 60);
  catchLines.forEach((l, i) => ctx.fillText(l, rightX, py + 250 + i * 56));

  // 調香表
  const rows: [string, string][] = [
    ['トップ', type.notes.top.join('、')],
    ['ミドル', type.notes.middle.join('、')],
    ['ラスト', type.notes.last.join('、')],
  ];
  let ry = py + 250 + catchLines.length * 56 + 60;
  ctx.strokeStyle = 'rgba(42,36,32,0.12)';
  rows.forEach(([k, v]) => {
    ctx.fillStyle = P.paperKin;
    ctx.font = `20px ${display}`;
    ctx.fillText(k, rightX, ry);
    ctx.fillStyle = P.sumi;
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
  drawRadar(ctx, scores, px + 300, py + ph - 330, 190, type.liquidColor, P.sumi, display);

  // 落款印
  const sx = px + pw - 60 - 190;
  const sy = py + ph - 60 - 190;
  ctx.save();
  ctx.translate(sx + 95, sy + 95);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.fillStyle = P.shu;
  roundRect(ctx, -95, -95, 190, 190, 5);
  ctx.fill();
  ctx.strokeStyle = P.paper3;
  ctx.lineWidth = 3;
  ctx.strokeRect(-83, -83, 166, 166);
  ctx.fillStyle = P.paper3;
  ctx.font = `700 70px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chars[0] ?? '', 0, -42);
  ctx.fillText(chars[1] ?? '', 0, 42);
  ctx.restore();

  // 下部
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = P.ink;
  ctx.font = `34px ${display}`;
  ctx.fillText('12の質問で、あなたに似合う香水がわかる。', W / 2, H - 200);
  ctx.fillStyle = P.ink3;
  ctx.font = `24px ${display}`;
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
