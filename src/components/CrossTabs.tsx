import Link from 'next/link';
import { CROSS_ARTICLES } from '@/data/cross';
import styles from './CrossTabs.module.css';

/** /personality 配下の2記事を行き来するタブ。現在地はハイライトする。 */
export function CrossTabs({ current }: { current?: string }) {
  return (
    <nav className={styles.tabs} aria-label="性格診断から探す">
      {CROSS_ARTICLES.map((c) => {
        const active = c.slug === current;
        return (
          <Link
            key={c.slug}
            href={`/personality/${c.slug}`}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {c.tab}
          </Link>
        );
      })}
    </nav>
  );
}
