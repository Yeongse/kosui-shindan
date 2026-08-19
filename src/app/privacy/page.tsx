import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata, META } from '@/lib/seo';
import styles from '../about/page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.privacy.title,
  description: META.privacy.description,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: 'プライバシーポリシー', path: '/privacy' }]} />
        <p className="data">個人情報の取り扱い</p>
        <h1 className={styles.h1}>プライバシーポリシー</h1>

        <section className={styles.section} aria-labelledby="pp-1">
          <h2 id="pp-1" className={styles.h2}>
            取得する情報
          </h2>
          <div className={styles.prose}>
            <p>
              香水診断 調香箋（以下「当サイト」）は、氏名・メールアドレス等の個人情報を取得しません。診断の回答内容も個人を特定できる形では保存しません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-2">
          <h2 id="pp-2" className={styles.h2}>
            アクセス解析
          </h2>
          <div className={styles.prose}>
            <p>
              当サイトは、サイトの改善のために匿名のアクセス解析を利用しています。解析では閲覧されたページや訪問元などの統計情報のみを扱い、個人を特定する情報は含まれません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-3">
          <h2 id="pp-3" className={styles.h2}>
            広告・アフィリエイト
          </h2>
          <div className={styles.prose}>
            <p>
              当サイトは、楽天アフィリエイト、Amazon アソシエイト・プログラムなどのアフィリエイトプログラムに参加しており、該当するリンクには「PR」の表記を付しています。リンク先での購入・契約は各販売事業者との間で行われます。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-4">
          <h2 id="pp-4" className={styles.h2}>
            外部サービス
          </h2>
          <div className={styles.prose}>
            <p>
              シェア機能（X、LINE）や検索リンクは外部サービスへ遷移します。遷移先での情報の取り扱いは各サービスのポリシーに従います。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-5">
          <h2 id="pp-5" className={styles.h2}>
            改定
          </h2>
          <div className={styles.prose}>
            <p>本ポリシーは必要に応じて改定します。改定後の内容は本ページに掲載した時点で効力を生じます。</p>
            <p className="data">最終更新: 2026.08.19</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
