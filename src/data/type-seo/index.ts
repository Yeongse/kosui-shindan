import type { ScentTypeSeo, TypeCode } from '../schema';
import { TYPE_SEO_1 } from './part-1';
import { TYPE_SEO_2 } from './part-2';
import { TYPE_SEO_3 } from './part-3';
import { TYPE_SEO_4 } from './part-4';

/**
 * §8.4 / §11.3 — 16タイプ分の SEO フィールド（全タイプ固有の書き下ろし）。
 * 執筆単位で4ファイルに分割し、ここで合成する。
 * 全16コードが揃っていることは src/data/content.test.ts で担保する。
 */
const merged: Partial<Record<TypeCode, ScentTypeSeo>> = {
  ...TYPE_SEO_1,
  ...TYPE_SEO_2,
  ...TYPE_SEO_3,
  ...TYPE_SEO_4,
};

export const TYPE_SEO = merged as Record<TypeCode, ScentTypeSeo>;
