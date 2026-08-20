import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShindanCta } from '@/components/ShindanCta';
import { ABOUT_OPERATOR, LP_PHILOSOPHY } from '@/data/site-copy';
import { ACCORD_CODES } from '@/data/schema';
import { ACCORD_NAME_JA } from '@/data/palette';
import { buildMetadata, META } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.about.title,
  description: META.about.description,
  path: '/about',
});

/** §6 /about — 診断の考え方・運営者情報・免責 */
export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className={`container ${styles.main}`}>
        <Breadcrumbs crumbs={[{ name: '診断の考え方・運営者', path: '/about' }]} />
        <p style={{ textAlign: 'center' }}><span className="eyebrow">About</span></p>
        <h1 className={styles.h1}>香水診断 調香箋について</h1>

        <section className={styles.section} aria-labelledby="about-idea">
          <h2 id="about-idea" className={styles.h2}>
            香水診断の考え方
          </h2>
          <div className={styles.prose}>
            {LP_PHILOSOPHY.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-logic">
          <h2 id="about-logic" className={styles.h2}>
            判定の仕組み
          </h2>
          <div className={styles.prose}>
            <p>
              12問それぞれの選択肢に、8つの香調と温度への重みが設定されています。回答を集計し、最も値の高い香調を主香調、温度の合計が温かい側なら warm、冷たい側なら cool として、主香調×温度の16タイプに分類します。同じ回答であれば、いつ受けても同じ結果になります。
            </p>
            <p>8つの香調は次のとおりです。</p>
            <ul className={styles.ul}>
              {ACCORD_CODES.map((c) => (
                <li key={c}>
                  <span className={`data ${styles.code}`}>{c}</span> {ACCORD_NAME_JA[c]}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-operator">
          <h2 id="about-operator" className={styles.h2}>
            運営者情報
          </h2>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt className={`data ${styles.dt}`}>運営</dt>
              <dd>{ABOUT_OPERATOR.name}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt className={`data ${styles.dt}`}>お問い合わせ</dt>
              <dd>
                {ABOUT_OPERATOR.contactNote}
                <br />
                <a href={ABOUT_OPERATOR.contactUrl} className="link" target="_blank" rel="noopener noreferrer">
                  お問い合わせフォーム
                </a>
                <br />
                メール:{' '}
                <a href={`mailto:${ABOUT_OPERATOR.email}`} className="link">
                  {ABOUT_OPERATOR.email}
                </a>
              </dd>
            </div>
            <div className={styles.dlRow}>
              <dt className={`data ${styles.dt}`}>サイト名</dt>
              <dd>香水診断 調香箋（こうすいしんだん ちょうこうせん）</dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="about-disclaimer">
          <h2 id="about-disclaimer" className={styles.h2}>
            免責事項
          </h2>
          <div className={styles.prose}>
            <p>本診断は娯楽コンテンツであり、医学・心理学的評価ではありません。結果は香りの好みを言葉にするための一つの目安であり、特定の効果・効能を保証するものではありません。</p>
            <p>
              結果ページおよびガイド記事には、アフィリエイトプログラムによる広告リンクを含むことがあります（その場合は「PR」と表記します）。リンク先での購入・契約に関する責任は各販売事業者にあり、当サイトは商品の品質・在庫・価格について保証しません。
            </p>
            <p>
              掲載内容は執筆時点の一般的な情報に基づきます。香料へのアレルギーや体調に関わる事項は、必ず製品の表示と専門家の指示に従ってください。
            </p>
          </div>
        </section>

        <p className={styles.links}>
          <Link href="/privacy" className="link">
            プライバシーポリシー
          </Link>
          <Link href="/sitemap" className="link">
            サイトマップ
          </Link>
        </p>

        <div className={styles.cta}>
          <ShindanCta align="center" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
