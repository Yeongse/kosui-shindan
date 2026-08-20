import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ABOUT_OPERATOR } from '@/data/site-copy';
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
        <p style={{ textAlign: 'center' }}>
          <span className="eyebrow">Privacy</span>
        </p>
        <h1 className={styles.h1}>プライバシーポリシー</h1>

        <section className={styles.section} aria-labelledby="pp-0">
          <h2 id="pp-0" className={styles.h2}>
            運営者と連絡先
          </h2>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt className={styles.dt}>サイト名</dt>
              <dd>香水診断 調香箋</dd>
            </div>
            <div className={styles.dlRow}>
              <dt className={styles.dt}>運営</dt>
              <dd>{ABOUT_OPERATOR.name}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt className={styles.dt}>連絡先</dt>
              <dd>
                <a href={`mailto:${ABOUT_OPERATOR.email}`} className="link">
                  {ABOUT_OPERATOR.email}
                </a>
                <br />
                <a href={ABOUT_OPERATOR.contactUrl} className="link" target="_blank" rel="noopener noreferrer">
                  お問い合わせフォーム
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="pp-1">
          <h2 id="pp-1" className={styles.h2}>
            取得する情報
          </h2>
          <div className={styles.prose}>
            <p>
              当サイトは、氏名・メールアドレス等の個人情報を入力していただく場面を設けていません。診断の回答内容も、個人を特定できる形では保存しません。
            </p>
            <p>
              お問い合わせフォームやメールでご連絡いただいた場合に限り、そこに記載された内容（お名前・メールアドレス・お問い合わせ内容）を受け取ります。これらは回答のためだけに利用し、ご本人の同意なく第三者へ提供することはありません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-2">
          <h2 id="pp-2" className={styles.h2}>
            アクセス解析
          </h2>
          <div className={styles.prose}>
            <p>
              サイトの改善のため、匿名のアクセス解析を利用しています。閲覧されたページや訪問元などの統計情報のみを扱い、個人を特定する情報は含みません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-3">
          <h2 id="pp-3" className={styles.h2}>
            広告・アフィリエイト
          </h2>
          <div className={styles.prose}>
            <p>
              当サイトは、楽天アフィリエイト、Amazon アソシエイト・プログラム等のアフィリエイトプログラムを利用することがあります。該当するリンクを含むブロックには「PR」と表記します。リンク先での購入・契約は各販売事業者との間で行われ、当サイトは商品の品質・在庫・価格について保証しません。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-4">
          <h2 id="pp-4" className={styles.h2}>
            外部サービス
          </h2>
          <div className={styles.prose}>
            <p>
              シェア機能（X、LINE）や検索リンク、お問い合わせフォーム（Google フォーム）は外部サービスへ遷移します。遷移先での情報の取り扱いは各サービスのポリシーに従います。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-5">
          <h2 id="pp-5" className={styles.h2}>
            開示・訂正・削除のご請求
          </h2>
          <div className={styles.prose}>
            <p>
              お問い合わせでお預かりした情報について、開示・訂正・削除をご希望の場合は、上記の連絡先までご連絡ください。ご本人であることを確認のうえ、速やかに対応します。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-6">
          <h2 id="pp-6" className={styles.h2}>
            免責事項
          </h2>
          <div className={styles.prose}>
            <p>
              本診断は娯楽コンテンツであり、医学・心理学的評価ではありません。掲載内容は執筆時点の一般的な情報に基づきます。香料へのアレルギーや体調に関わる事項は、製品の表示と専門家の指示に従ってください。
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="pp-7">
          <h2 id="pp-7" className={styles.h2}>
            改定
          </h2>
          <div className={styles.prose}>
            <p>本ポリシーは必要に応じて改定します。改定後の内容は本ページに掲載した時点で効力を生じます。</p>
            <p className="data">最終更新: {ABOUT_OPERATOR.updatedAt}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
