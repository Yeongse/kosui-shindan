import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { ShindanFlow } from '@/components/ShindanFlow';
import { buildMetadata, META } from '@/lib/seo';

/** §6 /shindan — 診断フロー。noindex, follow（回答UIは検索結果に不要）。 */
export const metadata: Metadata = buildMetadata({
  title: META.shindan.title,
  description: META.shindan.description,
  path: '/shindan',
  noindex: true,
});

export default function ShindanPage() {
  return (
    <>
      <SiteHeader minimal />
      <main className="container container--app">
        <ShindanFlow />
      </main>
    </>
  );
}
