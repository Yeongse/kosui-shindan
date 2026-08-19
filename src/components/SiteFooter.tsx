import Link from 'next/link';
import { LogoMark } from './LogoMark';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container container--wide ${styles.inner}`}>
        <div className={styles.brand}>
          <LogoMark size={28} />
          <span className={styles.brandName}>調香箋</span>
          <span className={styles.brandSub}>香水診断</span>
        </div>
        <nav className={styles.links} aria-label="フッターナビゲーション">
          <Link href="/type" className={styles.link}>
            香水タイプ一覧
          </Link>
          <Link href="/notes" className={styles.link}>
            香りノート解説
          </Link>
          <Link href="/guide" className={styles.link}>
            香水の選び方ガイド
          </Link>
          <Link href="/about" className={styles.link}>
            診断の考え方・運営者
          </Link>
          <Link href="/privacy" className={styles.link}>
            プライバシーポリシー
          </Link>
          <Link href="/sitemap" className={styles.link}>
            サイトマップ
          </Link>
        </nav>
        <p className={styles.disclaimer}>
          本診断は娯楽コンテンツであり、医学・心理学的評価ではありません。結果は香りの好みを言葉にするための一つの目安としてお使いください。
        </p>
      </div>
    </footer>
  );
}
