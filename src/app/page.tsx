import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { HeroBottle } from '@/components/HeroBottle';
import { ShindanCta } from '@/components/ShindanCta';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { TYPES } from '@/data/types';
import { NOTES } from '@/data/notes';
import { GUIDES } from '@/data/guides';
import { ACCORD_NAME_JA } from '@/data/palette';
import { LP_FAQ, LP_PHILOSOPHY, LP_PHILOSOPHY_HEADING, LP_WHAT_YOU_GET } from '@/data/site-copy';
import { buildMetadata, META, quizJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import styles from './page.module.css';

export const metadata: Metadata = buildMetadata({
  title: META.home.title,
  description: META.home.description,
  path: '/',
});

/**
 * §8.1 LP
 * ファーストビュー3秒以内に「①香水の診断である ②無料・90秒 ③何が得られるか」を伝える。
 */
export default function HomePage() {
  const featuredGuides = GUIDES.slice(0, 6);
  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className={`container container--wide ${styles.hero}`}>
          <div className={styles.heroText}>
            <p className={`data ${styles.eyebrow}`}>無料・登録不要・約90秒</p>
            <h1 className={`display ${styles.h1}`}>
              12の質問で、
              <br />
              あなたに似合う香水がわかる。
            </h1>
            <p className={styles.sub}>
              結果は16タイプの「調香箋」。トップ・ミドル・ラストの具体的なノートと、香水を探すときにそのまま使える検索ワードまでわかります。
            </p>
            <div className={styles.cta}>
              <ShindanCta size="lg" note="あなたの回答を、一滴ずつ蒸留します。" />
            </div>
          </div>
          <div className={styles.heroVisual}>
            <HeroBottle />
            {/* 縦書きは1画面1箇所（§7.3）。装飾テキスト扱いで h1 にはしない。 */}
            <p className={`display ${styles.vertical}`} aria-hidden="true">
              あなたという人間を、一枚の処方箋に翻訳する。
            </p>
          </div>
        </section>

        <hr className={`rule container container--wide ${styles.rule}`} />

        {/* ---------- §A この診断でわかること ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="what-heading">
          <h2 id="what-heading" className={styles.h2}>
            この香水診断でわかること
          </h2>
          <ol className={styles.whatList}>
            {LP_WHAT_YOU_GET.map((w, i) => (
              <li key={w.title} className={styles.whatItem}>
                <span className={`data ${styles.whatNo}`}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className={styles.whatTitle}>{w.title}</h3>
                  <p className={styles.whatBody}>{w.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- §B 診断の考え方 ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="phil-heading">
          <h2 id="phil-heading" className={styles.h2}>
            {LP_PHILOSOPHY_HEADING}
          </h2>
          <div className={styles.prose}>
            {LP_PHILOSOPHY.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className={styles.inlineCta}>
            <ShindanCta variant="ghost" />
          </div>
        </section>

        {/* ---------- §C 16の香水タイプ ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="types-heading">
          <h2 id="types-heading" className={styles.h2}>
            16の香水タイプ（香層図鑑）
          </h2>
          <p className={styles.lead}>
            8つの香調（系統）と温かい／冷たいの温度で分かれる16タイプ。タイプ名を選ぶと、そのタイプに似合う香水の選び方と代表ノートを読めます。
          </p>
          <ul className={styles.typeList}>
            {TYPES.map((t) => {
              const accord = t.code.split('-')[0] as keyof typeof ACCORD_NAME_JA;
              const temp = t.code.endsWith('-C') ? 'cool' : 'warm';
              return (
                <li key={t.code} className={styles.typeItem}>
                  <span className={styles.typeDot} style={{ background: t.liquidColor }} aria-hidden="true" />
                  <Link href={`/type/${t.slug}`} className={styles.typeLink}>
                    <span className={`display ${styles.typeName}`}>{t.name}</span>
                    <span className={styles.typeKana}>（{t.kana}）</span>
                    <span className={styles.typeMeta}>
                      {ACCORD_NAME_JA[accord]}系・{temp}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className={styles.more}>
            <Link href="/type" className="link">
              香水タイプ一覧（全16タイプの香りと似合う人）を見る
            </Link>
          </p>
        </section>

        {/* ---------- §D FAQ ---------- */}
        <div className="container">
          <Faq heading="香水診断について、よくある質問" items={LP_FAQ} />
        </div>

        {/* ---------- §E 香りノート解説 / ガイド ---------- */}
        <section className={`container ${styles.section}`} aria-labelledby="notes-heading">
          <h2 id="notes-heading" className={styles.h2}>
            香りノート解説 — 8つの香調（系統）を知る
          </h2>
          <p className={styles.lead}>
            「ムスク系の香水とは」「グルマン系はどんな匂いか」。診断結果に出てくる香調の特徴と代表ノート、似合う人を系統ごとに解説しています。
          </p>
          <ul className={styles.noteList}>
            {NOTES.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} className="link">
                  {n.name}系の香水とは — 特徴・代表ノート・似合う人
                </Link>
              </li>
            ))}
          </ul>
          <h3 className={styles.h3}>香水の選び方・つけ方ガイド</h3>
          <ul className={styles.noteList}>
            {featuredGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`} className="link">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.more}>
            <Link href="/guide" className="link">
              香水の選び方ガイド一覧を見る
            </Link>
          </p>
        </section>

        {/* ---------- 末尾 CTA ---------- */}
        <section className={`container ${styles.finalCta}`}>
          <p className={`display ${styles.finalLine}`}>まずは、自分の系統の名前を知るところから。</p>
          <ShindanCta size="lg" align="center" note="12問・約90秒・登録不要。回答はブラウザの中だけで処理されます。" />
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={[quizJsonLd(), breadcrumbJsonLd([{ name: '香水診断 調香箋', path: '/' }])]} />
    </>
  );
}
