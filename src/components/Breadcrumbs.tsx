import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo';
import styles from './Breadcrumbs.module.css';

/** パンくず（BreadcrumbList 構造化データ付き）。最初の項目は常にサイト名。 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const all: Crumb[] = [{ name: '香水診断 調香箋', path: '/' }, ...crumbs];
  return (
    <>
      <nav aria-label="パンくずリスト" className={styles.nav}>
        <ol className={styles.list}>
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.path} className={styles.item}>
                {last ? (
                  <span aria-current="page" className={styles.current}>
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className={styles.link}>
                    {c.name}
                  </Link>
                )}
                {!last && (
                  <span aria-hidden="true" className={styles.sep}>
                    ／
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
