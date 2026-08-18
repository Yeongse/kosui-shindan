import type { AccordCode, TypeCode } from './schema';

/**
 * §7.2 カラートークン / 液体色
 * 各香調タイプの「液体色」（瓶の中身・OG画像・レーダー描画に使用）。
 * cool系タイプは同色を彩度-15%・明度+8%で派生させる。
 */

export const COLORS = {
  bottle: '#101B16',
  glass: '#1B2A22',
  white: '#EDE8DC',
  amber: '#C9973B',
  verdigris: '#5E7D6B',
  paper: '#F2EDE0',
  sumi: '#26221C',
  rakkan: '#9E2B25',
} as const;

/** 香調8軸の基準液体色（warm系がそのまま使用） */
export const ACCORD_LIQUID: Record<AccordCode, string> = {
  CIT: '#D8A22E',
  GRN: '#6E8B5A',
  FLR: '#C77E93',
  FRT: '#C25B4E',
  GRM: '#A9713D',
  WDY: '#7A5C39',
  AMB: '#8C5A24',
  MSK: '#B8B2A0',
};

export const ACCORD_NAME_JA: Record<AccordCode, string> = {
  CIT: 'シトラス',
  GRN: 'グリーン',
  FLR: 'フローラル',
  FRT: 'フルーティ',
  GRM: 'グルマン',
  WDY: 'ウッディ',
  AMB: 'アンバー',
  MSK: 'ムスク',
};

export const ACCORD_NAME_EN: Record<AccordCode, string> = {
  CIT: 'Citrus',
  GRN: 'Green',
  FLR: 'Floral',
  FRT: 'Fruity',
  GRM: 'Gourmand',
  WDY: 'Woody',
  AMB: 'Amber',
  MSK: 'Musk',
};

/* ---------- 色演算（純粋関数） ---------- */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}

/** cool系派生: 彩度-15%・明度+8%（絶対値ポイント） */
export function deriveCool(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [r2, g2, b2] = hslToRgb(h, Math.max(0, s - 0.15), Math.min(1, l + 0.08));
  return rgbToHex(r2, g2, b2);
}

/** 複数色の加重平均（Vialの混色に使用） */
export function mixHex(colors: { hex: string; weight: number }[]): string {
  const total = colors.reduce((a, c) => a + c.weight, 0);
  if (total <= 0) return COLORS.amber;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const c of colors) {
    const [cr, cg, cb] = hexToRgb(c.hex);
    r += (cr * c.weight) / total;
    g += (cg * c.weight) / total;
    b += (cb * c.weight) / total;
  }
  return rgbToHex(r, g, b);
}

export function liquidColorFor(code: TypeCode): string {
  const [accord, temp] = code.split('-') as [AccordCode, 'W' | 'C'];
  const base = ACCORD_LIQUID[accord];
  return temp === 'C' ? deriveCool(base) : base;
}

export const TYPE_LIQUID: Record<TypeCode, string> = {
  'CIT-C': liquidColorFor('CIT-C'),
  'CIT-W': liquidColorFor('CIT-W'),
  'GRN-C': liquidColorFor('GRN-C'),
  'GRN-W': liquidColorFor('GRN-W'),
  'FLR-C': liquidColorFor('FLR-C'),
  'FLR-W': liquidColorFor('FLR-W'),
  'FRT-C': liquidColorFor('FRT-C'),
  'FRT-W': liquidColorFor('FRT-W'),
  'GRM-C': liquidColorFor('GRM-C'),
  'GRM-W': liquidColorFor('GRM-W'),
  'WDY-C': liquidColorFor('WDY-C'),
  'WDY-W': liquidColorFor('WDY-W'),
  'AMB-C': liquidColorFor('AMB-C'),
  'AMB-W': liquidColorFor('AMB-W'),
  'MSK-C': liquidColorFor('MSK-C'),
  'MSK-W': liquidColorFor('MSK-W'),
};
