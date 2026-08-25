import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TypePageView } from '@/components/TypePageView';
import { getTypeBySlug, TYPE_SLUGS } from '@/data/types';
import { typeMetadata } from '@/lib/seo';

/**
 * /type/[slug] — 診断結果 兼 タイプ解説記事（静的生成 16ページ）。
 * `?d=`（個人スコア）はクライアント側で読み取り、香りのバランス等を差し替える。
 * canonical は常にクエリなしの /type/[slug]。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return TYPE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTypeBySlug(slug);
  if (!t) return {};
  return typeMetadata(t);
}

export default async function TypePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTypeBySlug(slug);
  if (!t) notFound();
  return <TypePageView type={t} />;
}
