import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TypePageView } from '@/components/TypePageView';
import { getTypeBySlug } from '@/data/types';
import { isValidDigest } from '@/lib/scoring';
import { typeMetadata } from '@/lib/seo';

/**
 * /type/[slug]?d=HEX16 の内部リライト先（proxy.ts）。
 * 個人スコア付きで描画し、OG 画像に d を伝播する。canonical は /type/[slug]（§12.2）。
 * digest が不正なら代表値にフォールバック（500 を返さない）。
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; digest: string }>;
}): Promise<Metadata> {
  const { slug, digest } = await params;
  const t = getTypeBySlug(slug);
  if (!t) return {};
  return typeMetadata(t, isValidDigest(digest) ? digest : undefined);
}

export default async function TypeDigestPage({ params }: { params: Promise<{ slug: string; digest: string }> }) {
  const { slug, digest } = await params;
  const t = getTypeBySlug(slug);
  if (!t) notFound();
  return <TypePageView type={t} digest={isValidDigest(digest) ? digest : null} />;
}
