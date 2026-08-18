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
        <p className="data">PRIVACY POLICY</p>
        <h1 className={styles.h1}>プライバシーポリシー</h1>

        <section className={styles.section} aria-labelledby="pp-1">
          <h2 id="pp-1" className={styles.h2}>
            取得する情報
          </h2>
          <div className={styles.prose}>
            <p>
              香水診断 調香箋（以下「当サイト」）は、氏名・メールアドレス等の個人情報を取得しません。診断の回答はお使いのブラウザ内（sessionStorage / localStorage）でのみ処理・保存され、当サイトのサーバーには送信されません。
            </p>
            <p>
              結果ページのURLに付与される <span className="data">?d=</span>{' '}
              パラメータは8つの香調の集計値であり、個人を特定する情報を含みません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-2">
          <h2 id="pp-2" className={styles.h2}>
            アクセス解析と Cookie
          </h2>
          <div className={styles.prose}>
            <p>
              当サイトはサイト改善のため Google Analytics（GA4）を利用する場合があります。GA4 は Cookie を用いて匿名のトラフィックデータを収集しますが、これは画面上の同意バナーで「同意する」を選んだ場合にのみ有効になります。「利用しない」を選んだ場合、解析用の Cookie は保存されません。選択はブラウザに保存され、いつでもブラウザのサイトデータ削除で取り消せます。
            </p>
            <p>収集されるデータに個人を特定する情報は含まれません。Google によるデータの取り扱いは Google のプライバシーポリシーに従います。</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-3">
          <h2 id="pp-3" className={styles.h2}>
            アフィリエイトプログラム
          </h2>
          <div className={styles.prose}>
            <p>
              当サイトは、楽天アフィリエイト、Amazon アソシエイト・プログラムなどのアフィリエイトプログラムに参加しており、該当するリンクには「PR」の表記を付しています。リンク先の各サービスは、購入・成果の計測のために独自の Cookie を使用することがあります。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-4">
          <h2 id="pp-4" className={styles.h2}>
            外部リンク
          </h2>
          <div className={styles.prose}>
            <p>
              シェア機能（X、LINE）や検索リンクは外部サービスへ遷移します。遷移先での情報の取り扱いは各サービスのポリシーに従い、当サイトは責任を負いません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-5">
          <h2 id="pp-5" className={styles.h2}>
            改定
          </h2>
          <div className={styles.prose}>
            <p>本ポリシーは必要に応じて改定します。改定後の内容は本ページに掲載した時点で効力を生じます。</p>
            <p className="data">最終更新: 2026.08.18</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
