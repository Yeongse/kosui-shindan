import type { AccordCode, ScentType, TypeCode } from './schema';
import { TYPES_BASE } from './types.base';
import { TYPE_SEO } from './type-seo';

/**
 * §5 の16タイプ定義（+ v1.1 SEOフィールド）。
 * 基本データ(types.base.ts) と SEO本文(type-seo/) を合成した唯一の参照点。
 */
export const TYPES: readonly ScentType[] = TYPES_BASE.map((base) => ({
  ...base,
  ...TYPE_SEO[base.code],
}));

export const TYPE_BY_CODE: Record<TypeCode, ScentType> = Object.fromEntries(
  TYPES.map((t) => [t.code, t]),
) as Record<TypeCode, ScentType>;

export const TYPE_BY_SLUG: Record<string, ScentType> = Object.fromEntries(TYPES.map((t) => [t.slug, t]));

export function getTypeBySlug(slug: string): ScentType | undefined {
  return TYPE_BY_SLUG[slug];
}

export function getTypeByCode(code: string): ScentType | undefined {
  return (TYPE_BY_CODE as Record<string, ScentType | undefined>)[code];
}

export function isTypeCode(v: string): v is TypeCode {
  return v in TYPE_BY_CODE;
}

export function typesByAccord(accord: AccordCode): { cool: ScentType; warm: ScentType } {
  return {
    cool: TYPE_BY_CODE[`${accord}-C`],
    warm: TYPE_BY_CODE[`${accord}-W`],
  };
}

export const TYPE_SLUGS: readonly string[] = TYPES.map((t) => t.slug);
