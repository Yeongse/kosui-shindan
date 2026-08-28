import type { Metadata } from 'next';
import type { CrossArticle, GuideArticle, NoteArticle, ScentType } from '@/data/schema';

/**
 * §12.2 メタデータテンプレート / §12.4 構造化データ / §12.5 絶対URL
 * すべての canonical・OG・JSON-LD の URL はここから組み立てる（ハードコード禁止）。
 */

export const SITE_NAME = '香水診断 調香箋';
export const SITE_NAME_EN = 'CHOKOSEN';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kosui-shindan.com').replace(/\/$/, '');
export const SITE_TAGLINE = '12の質問で、あなたに似合う香水がわかる。';
export const SITE_SUBCOPY = '無料・登録不要・約90秒。結果は16タイプの「調香箋」で。';

export function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/* ---------- title / description テンプレート ---------- */

export const META = {
  home: {
    title: '香水診断（無料・90秒）｜あなたに似合う香水がわかる 調香箋',
    description:
      '12の質問で、あなたに似合う香水の系統がわかる無料の香水診断。結果は16タイプの「調香箋」で、トップ・ミドル・ラストの具体的なノートと探し方までわかります。登録不要・約90秒。',
  },
  shindan: {
    title: '香水診断をはじめる（12問・無料・約90秒）｜香水診断 調香箋',
    description:
      '12の質問に答えると、あなたに似合う香水の系統が16タイプの「調香箋」でわかります。無料・登録不要・約90秒。',
  },
  typeIndex: {
    title: '香水タイプ一覧（全16タイプ）｜香水診断 調香箋',
    description:
      '香水診断 調香箋の全16タイプ一覧。シトラス・グリーン・フローラル・フルーティ・グルマン・ウッディ・アンバー・ムスクの8系統×温度で分かれる香水タイプと、それぞれに似合うノートを紹介します。',
  },
  notesIndex: {
    title: '香りノート解説（8系統）｜香水診断 調香箋',
    description:
      'シトラス・グリーン・フローラル・フルーティ・グルマン・ウッディ・アンバー・ムスク。香水の8つの香調（系統）について、特徴・代表ノート・似合う人を解説します。',
  },
  guideIndex: {
    title: '香水の選び方・つけ方ガイド｜香水診断 調香箋',
    description:
      '香水の選び方、オードトワレとオードパルファンの違い、つける場所や適量に加えて、香りのおすすめの選び分けやアロマ診断との違いまで。初心者が最初の1本で失敗しないためのガイド記事一覧。',
  },
  personality: {
    title: 'MBTI・ラブタイプから香水を選ぶ｜性格診断×香水の考察',
    description:
      'MBTIの16タイプやラブタイプ診断の結果を、香水の香調に翻訳した考察記事。E/Iは香りの届く距離、T/Fは温度というように、性格診断の軸をそのまま香りの設計要素として読み替えます。',
  },
  about: {
    title: '香水診断 調香箋について｜診断の考え方・運営者・免責',
    description:
      '香水診断 調香箋の診断の考え方（8香調×温度の16タイプ）、運営者情報、免責事項、プライバシーポリシーについて。',
  },
  privacy: {
    title: 'プライバシーポリシー｜香水診断 調香箋',
    description: '香水診断 調香箋のプライバシーポリシー。取得する情報、アクセス解析、アフィリエイトについて。',
  },
  sitemap: {
    title: 'サイトマップ｜香水診断 調香箋',
    description: '香水診断 調香箋の全ページ一覧。診断・香水タイプ16ページ・香りノート解説8本・ガイド記事。',
  },
} as const;

/* ---------- Metadata builders ---------- */

interface BuildMetaOptions {
  title: string;
  description: string;
  path: string; // canonical path（クエリなし）
  ogImage?: string; // 絶対URL or パス
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata(o: BuildMetaOptions): Metadata {
  const canonical = absUrl(o.path);
  const ogImage = o.ogImage ? absUrl(o.ogImage) : absUrl('/og/default.png');
  return {
    title: { absolute: o.title },
    description: o.description,
    alternates: { canonical },
    robots: o.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: o.type ?? 'website',
      siteName: SITE_NAME,
      title: o.title,
      description: o.description,
      url: canonical,
      locale: 'ja_JP',
      images: [{ url: ogImage, width: 1200, height: 630, alt: o.title }],
      ...(o.type === 'article'
        ? { publishedTime: o.publishedTime, modifiedTime: o.modifiedTime }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: o.title,
      description: o.description,
      images: [ogImage],
    },
  };
}

export function typeMetadata(t: ScentType): Metadata {
  return buildMetadata({
    title: `${t.seoTitle}｜${SITE_NAME}`,
    description: t.seoDescription,
    path: `/type/${t.slug}`, // ?d= 付きでも canonical はクエリなし（§12.2）
    ogImage: `/og/type-${t.slug}.png`,
    type: 'article',
    publishedTime: CONTENT_PUBLISHED_AT,
    modifiedTime: CONTENT_UPDATED_AT,
  });
}

export function noteMetadata(n: NoteArticle): Metadata {
  return buildMetadata({
    title: n.seoTitle,
    description: n.seoDescription,
    path: `/notes/${n.slug}`,
    ogImage: `/og/note-${n.slug}.png`,
    type: 'article',
    publishedTime: n.publishedAt,
    modifiedTime: n.updatedAt,
  });
}

export function crossMetadata(c: CrossArticle): Metadata {
  return buildMetadata({
    title: `${c.title}｜${SITE_NAME}`,
    description: c.seoDescription,
    path: `/personality/${c.slug}`,
    ogImage: `/og/cross-${c.slug}.png`,
    type: 'article',
    publishedTime: c.publishedAt,
    modifiedTime: c.updatedAt,
  });
}

export function guideMetadata(g: GuideArticle): Metadata {
  return buildMetadata({
    title: `${g.title}｜${SITE_NAME}`,
    description: g.seoDescription,
    path: `/guide/${g.slug}`,
    ogImage: `/og/guide-${g.slug}.png`,
    type: 'article',
    publishedTime: g.publishedAt,
    modifiedTime: g.updatedAt,
  });
}

/** タイプ解説ページの公開日・更新日（コンテンツ更新時に手で更新する） */
export const CONTENT_PUBLISHED_AT = '2026-08-18';
export const CONTENT_UPDATED_AT = '2026-08-18';

/* ---------- JSON-LD ---------- */

export type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: absUrl('/'),
    inLanguage: 'ja',
    description: META.home.description,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function quizJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `${SITE_NAME} — 12の質問で似合う香水がわかる香水診断`,
    about: { '@type': 'Thing', name: 'Perfume' },
    url: absUrl('/shindan'),
    inLanguage: 'ja',
    numberOfQuestions: 12,
    isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: SITE_NAME, url: absUrl('/') },
  };
}

export function articleJsonLd(o: {
  headline: string;
  description: string;
  path: string;
  image?: string;
  publishedAt: string;
  updatedAt: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: o.headline,
    description: o.description,
    mainEntityOfPage: absUrl(o.path),
    url: absUrl(o.path),
    image: o.image ? [absUrl(o.image)] : undefined,
    datePublished: o.publishedAt,
    dateModified: o.updatedAt,
    inLanguage: 'ja',
    author: { '@type': 'Organization', name: SITE_NAME, url: absUrl('/') },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: absUrl('/') },
  };
}
