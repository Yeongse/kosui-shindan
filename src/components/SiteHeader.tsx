import Link from 'next/link';
import { LogoMark } from './LogoMark';

import styles from './SiteHeader.module.css';

/** ヘッダー: ロゴ + 主要ナビ。白地・薄い下線。 */
export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={`container container--wide ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="香水診断 調香箋 トップへ">
          <LogoMark size={40} />
          <span className={styles.logoText}>
            <span className={styles.logoMain}>調香箋</span>
            <span className={styles.logoSmall}>香水診断</span>
          </span>
        </Link>
        {!minimal && (
          <nav className={styles.nav} aria-label="サイト内ナビゲーション">
            {/* 狭い画面では横スクロールする。リンクは隠さず、診断CTAだけ右に固定する */}
            <div className={styles.navLinks}>
              <Link href="/type" className={styles.navLink}>
                タイプ一覧
              </Link>
              <Link href="/notes" className={styles.navLink}>
                香りの解説
              </Link>
              <Link href="/guide" className={styles.navLink}>
                選び方ガイド
              </Link>
              <Link href="/personality/mbti-perfume" className={styles.navLink}>
                MBTIから
              </Link>
              <Link href="/personality/lovetype-perfume" className={styles.navLink}>
                ラブタイプから
              </Link>
            </div>
            <Link href="/shindan" className={`${styles.navCta}`}>
              診断する
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
