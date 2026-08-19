import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Art } from '@/components/Art';
import { ShindanCta } from '@/components/ShindanCta';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { TypeCard } from '@/components/TypeCard';
import { TYPES } from '@/data/types';
import { NOTES } from '@/data/notes';
import { GUIDES } from '@/data/guides';
import { ACCORD_CODES } from '@/data/schema';
import { ACCORD_LIQUID } from '@/data/palette';
import { LP_FAQ, LP_PHILOSOPHY, LP_PHILOSOPHY_HEADING, LP_WHAT_YOU_GET } from '@/data/site-copy';
import { buildMetadata, META, quizJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.home.title,
  description: META.home.description,
  path: '/',
});

const ICONS = [
  // 16タイプ: 4つの丸
  <svg key="a" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <circle cx="8" cy="8" r="4" fill="currentColor" />
    <circle cx="16" cy="8" r="4" fill="currentColor" opacity="0.7" />
    <circle cx="8" cy="16" r="4" fill="currentColor" opacity="0.55" />
    <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.4" />
  </svg>,
  // ノート: 3段
  <svg key="b" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M5 7h14M5 12h10M5 17h6" />
  </svg>,
  // 検索
  <svg key="c" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20l-4.2-4.2" />
  </svg>,
];

/** LP — 中央一列。最初の画面で「香水診断・無料90秒・何がわかるか」を伝える。 */
export default function HomePage() {
  const featuredGuides = GUIDES.slice(0, 6);
  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className={`container ${styles.hero}`}>
          <span className="eyebrow">Perfume Type Test</span>
          <div className={styles.kv}>
            <Art
              src="/img/hero/key-visual.webp"
              alt="香水瓶と花を描いたやわらかなイラスト"
              className={styles.kvArt}
              loading="eager"
              fallback={
                <div className={styles.kvFallback} aria-hidden="true">
                  {ACCORD_CODES.map((c, i) => (
                    <span key={c} className={styles.kvDot} style={{ background: ACCORD_LIQUID[c], animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              }
            />
          </div>
          <h1 className={styles.h1}>
            12の質問で、
            <br />
            <span className="grad-text">あなたに似合う香水</span>
            <br className={styles.brMobile} />
            がわかる。
          </h1>
          <p className={styles.sub}>
            結果は16タイプの「調香箋」。トップ・ミドル・ラストの具体的なノートと、香水を探すときにそのまま使える検索ワードまでわかります。
          </p>
          <ul className={styles.chips} aria-label="診断の特徴">
            <li className="chip">全12問・約90秒</li>
            <li className="chip">16タイプ判定</li>
            <li className="chip">無料・登録不要</li>
            <li className="chip">結果をシェアできる</li>
          </ul>
          <div className={styles.cta}>
            <ShindanCta size="lg" block align="center" note="登録不要・完全無料・約90秒で完了" />
          </div>
          <p className={styles.subLinks}>
            <Link href="/type" className="link">
              16タイプ一覧を見る
            </Link>
            <span aria-hidden="true"> ／ </span>
            <Link href="/notes" className="link">
              香りの解説を読む
            </Link>
          </p>
        </section>

        {/* ---------- わかること ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="what-heading">
          <h2 id="what-heading" className={`h2 h2--center`}>
            この香水診断でわかること
          </h2>
          <ol className={styles.whatGrid}>
            {LP_WHAT_YOU_GET.map((w, i) => (
              <li key={w.title} className={`card ${styles.whatCard}`}>
                <span className={styles.whatIcon}>{ICONS[i]}</span>
                <h3 className={styles.whatTitle}>{w.title}</h3>
                <p className={styles.whatBody}>{w.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- 16タイプ ---------- */}
        <section className={`container container--wide ${styles.section}`} aria-labelledby="types-heading">
          <h2 id="types-heading" className={`h2 h2--center`}>
            16の香水タイプ
          </h2>
          <p className={styles.lead}>
            8つの香調（系統）と温かい／冷たいの温度で分かれる16タイプ。気になるタイプを選ぶと、似合う香水の選び方と代表ノートが読めます。
          </p>
          <ul className={styles.typeGrid}>
            {TYPES.map((t) => (
              <li key={t.code}>
                <TypeCard type={t} />
              </li>
            ))}
          </ul>
          <p className={styles.more}>
            <Link href="/type" className="btn btn--ghost">
              香水タイプ一覧（全16タイプの香りと似合う人）を見る
            </Link>
          </p>
        </section>

        {/* ---------- 考え方 ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="phil-heading">
          <div className={`card ${styles.prosePanel}`}>
            <h2 id="phil-heading" className={`h2 ${styles.proseHeading}`}>
              {LP_PHILOSOPHY_HEADING}
            </h2>
            <div className={styles.prose}>
              {LP_PHILOSOPHY.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className={styles.inlineCta}>
              <ShindanCta variant="ghost" align="center" />
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <div className="container">
          <Faq heading="香水診断について、よくある質問" items={LP_FAQ} />
        </div>

        {/* ---------- ノート / ガイド ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="notes-heading">
          <h2 id="notes-heading" className={`h2 h2--center`}>
            香りの解説と選び方ガイド
          </h2>
          <p className={styles.lead}>
            「ムスク系の香水とは」「グルマン系はどんな匂いか」。診断結果に出てくる香調の特徴や、香水の選び方・つけ方を解説しています。
          </p>
          <div className={styles.twoCol}>
            <div className={`card ${styles.linkPanel}`}>
              <h3 className={styles.linkHeading}>香りノート解説（8つの香調）</h3>
              <ul className={styles.linkList}>
                {NOTES.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/notes/${n.slug}`} className={styles.linkItem}>
                      <span className={styles.linkDot} style={{ background: ACCORD_LIQUID[n.accord] }} aria-hidden="true" />
                      {n.name}系の香水とは — 特徴・代表ノート・似合う人
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`card ${styles.linkPanel}`}>
              <h3 className={styles.linkHeading}>香水の選び方・つけ方ガイド</h3>
              <ul className={styles.linkList}>
                {featuredGuides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guide/${g.slug}`} className={styles.linkItem}>
                      {g.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/guide" className="link">
                    ガイド一覧を見る
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- 末尾 CTA ---------- */}
        <section className={`container ${styles.finalCta}`}>
          <div className={`card ${styles.finalPanel}`}>
            <p className={styles.finalLine}>まずは、自分の系統の名前を知るところから。</p>
            <ShindanCta size="lg" block align="center" note="12問・約90秒・登録不要" />
          </div>
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={[quizJsonLd(), breadcrumbJsonLd([{ name: '香水診断 調香箋', path: '/' }])]} />
    </>
  );
}
