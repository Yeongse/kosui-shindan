/**
 * MBTI 16タイプ × 香水タイプの対応表（/personality/mbti-perfume の図表用）
 * 対応の根拠は記事本文のとおり:
 *   E/I → 香りが届く距離 / S/N → 香りの輪郭 / T/F → 温度 / J/P → 重心
 * 温度は3文字目（T=クール / F=ウォーム）と必ず一致する。
 */
export interface MbtiMapping {
  code: string; // INFP
  typeSlug: string; // kime
}

export const MBTI_MAP: readonly MbtiMapping[] = [
  { code: 'ESTP', typeSlug: 'shinko' },
  { code: 'ESFP', typeSlug: 'yokoku' },
  { code: 'ESTJ', typeSlug: 'setto' },
  { code: 'ESFJ', typeSlug: 'shoko' },
  { code: 'ENTP', typeSlug: 'karo' },
  { code: 'ENFP', typeSlug: 'mitsugetsu' },
  { code: 'ENTJ', typeSlug: 'gekko' },
  { code: 'ENFJ', typeSlug: 'shunsho' },
  { code: 'ISTP', typeSlug: 'ugo' },
  { code: 'ISFP', typeSlug: 'nobi' },
  { code: 'ISTJ', typeSlug: 'shinkan' },
  { code: 'ISFJ', typeSlug: 'shinka' },
  { code: 'INTP', typeSlug: 'hakuji' },
  { code: 'INFP', typeSlug: 'kime' },
  { code: 'INTJ', typeSlug: 'yoiyami' },
  { code: 'INFJ', typeSlug: 'kohaku' },
];
