'use client';

import Link from 'next/link';
import type { ScentType } from '@/data/schema';
import { track } from '@/lib/analytics';
import styles from './AffiliateBlock.module.css';

/**
 * 香水作成体験（調香体験）への導線。ASP で発行したアフィリエイトリンクを環境変数に入れると表示される。
 *   NEXT_PUBLIC_EXPERIENCE_URL   … ASPのアフィリエイトリンク（必須・未設定なら非表示）
 *   NEXT_PUBLIC_EXPERIENCE_LABEL … ボタン文言（任意。既定「調香体験を探す」）
 *   NEXT_PUBLIC_EXPERIENCE_NAME  … サービス名（任意。既定「アソビュー」）
 */
const URL = process.env.NEXT_PUBLIC_EXPERIENCE_URL ?? '';
const LABEL = process.env.NEXT_PUBLIC_EXPERIENCE_LABEL ?? '調香体験を探す';
const NAME = process.env.NEXT_PUBLIC_EXPERIENCE_NAME ?? 'アソビュー';

export function ExperienceBlock({ type }: { type: ScentType }) {
  if (!URL) return null;
  return (
    <section className={`card ${styles.section}`} aria-labelledby="exp-heading">
      <div className={styles.headRow}>
        <h2 id="exp-heading" className={`h2 ${styles.heading}`}>
          自分だけの香水を作る
        </h2>
        <span className={styles.pr} title="アフィリエイトリンクを含みます">
          PR
        </span>
      </div>
      <p className={styles.lead}>
        {type.name}タイプの調香ノート（{type.notes.top[0]}、{type.notes.middle[0]}、{type.notes.last[0]}
        ）を手がかりに、調香師と一緒にオリジナルの1本を作る体験もあります。30分〜2時間、手ぶらで参加できるプランが中心です。
      </p>
      <div className={styles.item}>
        <p className={styles.query}>全国の調香体験・香水作りプラン</p>
        <div className={styles.links}>
          <a
            href={URL}
            target="_blank"
            rel="nofollow sponsored noopener"
            className={`${styles.link} ${styles.experience}`}
            onClick={() => track('affiliate_click', { type: type.code, query_index: 99, market: 'experience' })}
          >
            {NAME}で{LABEL}
          </a>
        </div>
      </div>
      <p className={styles.note}>
        体験の予約・決済は各予約サイトで行われます。当サイトはリンク経由の予約で紹介料を受け取ることがあります。
        はじめての方は{' '}
        <Link href="/guide/perfume-making-experience" className="link">
          香水作り・調香体験の流れと選び方
        </Link>
        {' '}もどうぞ。
      </p>
    </section>
  );
}
