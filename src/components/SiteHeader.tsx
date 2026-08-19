import Link from 'next/link';
import { SealMark } from './SealMark';
import styles from './SiteHeader.module.css';

/**
 * ヘッダー: [朱印] 香水診断 調香箋 / 右: 香水タイプ一覧 / 香りの解説 / 選び方ガイド
 * ロゴは「香水診断」を小さく冠する二段組。
 */
export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={`container container--wide ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="香水診断 調香箋 トップへ">
          <SealMark size={34} />
          <span className={styles.logoText}>
            <span className={styles.logoSmall}>香水診断</span>
            <span className={`brush ${styles.logoMain}`}>調香箋</span>
          </span>
        </Link>
        {!minimal && (
          <nav className={styles.nav} aria-label="サイト内ナビゲーション">
            <Link href="/type" className={styles.navLink}>
              香水タイプ一覧
            </Link>
            <Link href="/notes" className={styles.navLink}>
              香りの解説
            </Link>
            <Link href="/guide" className={`${styles.navLink} ${styles.navLinkWide}`}>
              選び方ガイド
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
