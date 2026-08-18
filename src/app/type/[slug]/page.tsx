import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TypePageView } from '@/components/TypePageView';
import { getTypeBySlug, TYPE_SLUGS } from '@/data/types';
import { typeMetadata } from '@/lib/seo';

/**
 * §6 /type/[slug] — 診断結果 兼 タイプ解説記事（SSG 16ページ）。
 * `?d=` 付きアクセスは proxy.ts で /type/[slug]/d/[digest] に内部リライトされ、
 * そちらで個人スコア付きの OG 画像・レーダーを描画する（canonical はこのURL）。
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
  return <TypePageView type={t} digest={null} />;
}
