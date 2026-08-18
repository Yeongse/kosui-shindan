import type { JsonLd as JsonLdType } from '@/lib/seo';

/** JSON-LD をインラインで出力する。`<` を < にエスケープして script 終端の注入を防ぐ。 */
export function JsonLd({ data }: { data: JsonLdType | JsonLdType[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
