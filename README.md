# 香水診断 調香箋（CHOKOSEN）

12の質問で、あなたに似合う香水がわかる。無料・登録不要・約90秒。結果は16タイプの「調香箋」。

仕様の正は [app-spec.md](./app-spec.md)（v1.2）。本 README は実装の見取り図と運用手順のみを記す。

## スタック

- Next.js 16 (App Router, Turbopack) + TypeScript strict + CSS Modules
- 状態: React useReducer + sessionStorage（回答）/ localStorage（履歴3件）。外部状態管理なし
- アニメーション: CSS transition/keyframes + SVG。framer-motion 等なし
- OG画像: `next/og`（satori）Edge Route、サブセット woff（明朝 + 筆文字）をバンドル
- テスト: Vitest（scoring / 分布 / digest / コンテンツ検収）+ Playwright（完走E2E）
- 解析: Cloudflare Web Analytics（Cookie 不使用・同意バナーなし）。DB なし。個人情報は収集しない

## デザイン — 「平安の料紙」

暗い薬瓶の世界観（spec §7）から、ユーザー指示で **生成りの和紙・墨・朱・金砂子・飛雲・縦書き** に全面変更した。
トークンは `src/styles/tokens.css`（旧トークン名は互換エイリアスで残している）。

- 書体: 本文・見出し = Shippori Mincho B1、タイプ名・番号などの一点 = Yuji Syuku（筆）
- 数字は漢数字（其の一／問一／一・二・三・四）。Batch No. は「調合番号 第YYMMDD-HHMM号」、直リンクは「見本」
- 画像スロット（`/public/img/...`）は **無くても崩れない**（地色・SVG にフォールバック）。
  生成プロンプトと配置パスは [docs/image-prompts.md](./docs/image-prompts.md)

## セットアップ

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_SITE_URL / アフィリエイトID / Cloudflare ビーコン を設定
npm run dev
```

主要コマンド:

| コマンド | 内容 |
|---|---|
| `npm run dev` / `build` / `start` | 開発 / 本番ビルド / 本番起動 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest（scoring スナップショット・分布 10万試行×2モデル・digest 往復・コンテンツ検収） |
| `npm run test:e2e` | Playwright（390px幅で LP→12問→結果→Xシェア→図鑑。要 `npm run build`） |
| `npm run check:links` | ビルド済みHTMLから内部リンクグラフを検証（孤立ページ0・リンク切れ0・アンカーテキスト・robots・§12.1 内部リンク規則） |
| `npm run analyze:distribution` | 16タイプの出現分布（一様ランダム / 人間モデル）を表示。`PATCHES` 環境変数で重み案を試算 |
| `npm run og:fonts` | OG画像用フォントのサブセット再生成（後述） |
| `npm run shots` | 主要ページのフルページスクリーンショット（目視検収用） |
| `npm run verify` | typecheck → test → build → check:links → e2e を一括実行（リリース前） |

## ディレクトリ

```
src/
  app/                    ルーティング（§6）
    page.tsx              LP
    shindan/              診断フロー（noindex）
    type/                 香水タイプ一覧（香層図鑑）
    type/[slug]/          結果 兼 タイプ解説（SSG 16）
    type/[slug]/d/[digest]/  ?d= 付きの内部リライト先（proxy.ts）。OGに d を伝播、canonical はクエリなし
    notes/ notes/[slug]/  香りノート解説（8）
    guide/ guide/[slug]/  ガイド記事（10、データ層に追加するだけで増える）
    about/ privacy/ sitemap/  静的ページ・HTMLサイトマップ
    api/og/route.tsx      動的OG画像（Edge）。fonts/ にサブセット woff
    sitemap.ts robots.ts not-found.tsx
  components/             Vial（瓶プログレス）/ Distill（蒸留演出）/ ShindanCard / Radar / RakkanSeal / ShareRow ほか
  data/
    schema.ts             型定義（§11.3）
    questions.ts          設問12問と重み（§4）— 重み調整の逸脱記録はファイル冒頭
    types.base.ts         16タイプの基本コピー（§5）
    type-seo/part-*.ts    16タイプの SEO本文・FAQ・関連リンク（固有書き下ろし）
    types.ts              上2つの合成（唯一の参照点）
    notes/ notes.ts       ノート解説 8本
    guides/ guides.ts     ガイド記事 10本（part-3.ts を足して配列に加えれば公開）
    palette.ts            色トークン・液体色・混色
    site-copy.ts          LP/aboutの固定コピー・FAQ 5問
    human-prior.ts        キャリブレーション用の「選択肢の選ばれやすさ」事前分布
  lib/
    scoring.ts            判定ロジック（純粋関数）・digest encode/decode
    calibration.ts        分布シミュレーション用サンプラー（テスト・スクリプト共用）
    seo.ts                metadata テンプレート・JSON-LD・絶対URL
    share.ts              シェアURL・縦長画像 canvas 生成
    affiliate.ts          楽天/Amazon 検索リンク組立
    analytics.ts          計測イベントの薄いフック（現状 no-op）
    storage.ts            sessionStorage / localStorage
  proxy.ts                /type/[slug]?d= → /type/[slug]/d/[digest] のリライト
  styles/tokens.css       デザイントークン（§7）
scripts/                  検収・分析・フォント生成
e2e/                      Playwright
```

## 診断ロジックとキャリブレーション

- 判定は `src/lib/scoring.ts` の純粋関数。乱数・時刻を含まないため同じ回答は常に同じ結果。
- 分布は2つのモデルで担保する（`src/lib/scoring.test.ts`）:
  1. **一様ランダム**（§13.1）: 10万試行で全16タイプが 2〜22%
  2. **人間モデル**: `src/data/human-prior.ts` の選択肢事前分布（人気の偏り）と、回答者の潜在特性（温度嗜好・濃度嗜好）による一貫性を掛けたサンプラーで、全16タイプが 3〜16%
- 重みを変えたいときは `PATCHES='[{"q":3,"key":"C","temp":0}]' npm run analyze:distribution` で試算し、`questions.ts` に反映後 `npm run test`。
- **運用**: 回答の選択率が実測できるようになったら、`human-prior.ts` を実測値で置き換えて再キャリブレーションする。

## OG 画像フォントの再生成

`src/app/api/og/fonts/*.woff` は Shippori Mincho B1（全文言）と Yuji Syuku（タイプ名・見出し語のみ）を、
データ層に現れる文字（タイプ名・読み・ノート名・ガイド題名・固定ラベル + ASCII/かな）だけにサブセットしたもの。
**ガイド記事やノートの題名を追加・変更したら再生成すること**（未収録の漢字は OG 画像で描画されない）。

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli
# TTF は google/fonts リポジトリ（OFL）から取得して任意のディレクトリに置く
OG_FONT_SRC=/path/to/ttf PYFTSUBSET=.venv/bin/pyftsubset npm run og:fonts
```

`/api/og?label=` は `src/lib/og-labels.ts` のホワイトリスト（ノート題名・ガイド短題名）に一致する文字列だけを受け付ける。

## デプロイ（Vercel + Cloudflare DNS）

1. Vercel にプロジェクトを作成し、環境変数を設定: `NEXT_PUBLIC_SITE_URL=https://kosui-shindan.com`, `NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID`, `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`, `NEXT_PUBLIC_CF_BEACON_TOKEN`（Cloudflare Web Analytics）
2. Cloudflare は DNS のみ（プロキシ OFF / グレー雲）。`kosui-shindan.com` と `www` を Vercel に向け、Vercel 側で www → apex の 301 を設定（§1.1）
3. `kousui-shindan.com` を取得できた場合は Vercel でドメイン追加 → apex へ 301
4. 旧URL（`/q` `/types` `/r/[code]`）は `next.config.ts` の redirects で 301 済み

## リリース手順と Search Console（§12.5）

1. `npm run verify` が全て通ることを確認（typecheck / 39 tests / build / 内部リンク検証 / E2E）
2. `npm run shots` で 390px と 1280px の見た目を確認（`npm run shots -- 390`）
3. デプロイ後、`https://kosui-shindan.com/sitemap.xml` と `/robots.txt` を確認
4. **Google Search Console** に `kosui-shindan.com`（ドメインプロパティ）を追加し、Cloudflare DNS に TXT レコードで所有権確認
5. サイトマップ `https://kosui-shindan.com/sitemap.xml` を送信
6. URL検査で `/`, `/type/gekko`, `/notes/musk`, `/guide/how-to-choose` をインデックス登録リクエスト
7. リッチリザルトテストで FAQPage / Article / BreadcrumbList / Quiz にエラーがないことを確認
8. 1週間後にカバレッジ（インデックス済み 41 ページ）と「香水診断」関連クエリの表示回数を確認。月次で表示回数が伸びているのに CTR が低いページの title を改善（§14 M10）

## コンテンツ追加の運用

- ガイド記事: `src/data/guides/part-3.ts` を作り `guides.ts` の配列に追加するだけで公開される。公開前に固有の実体験・具体例を1箇所以上追記する（§12.3）。追加後 `npm run og:fonts` と `npm run verify`
- 残りの予定記事: `long-lasting` / `similar-scent-search` / `perfume-terms` / `first-date-scent` / `nioi-kaori-difference`
- コンテンツ検収（絵文字ゼロ・「！」ゼロ・howToChoose 700〜1000字・重複率30%未満・関連リンク実在）は `npm run test` に含まれる

## 仕様からの逸脱記録

- **設問の重み（§4）**: 初期値では分布テスト（§13.1）を満たさなかったため、文言は変えずに重みのみ調整。さらに人間の選択の偏りを考慮した第2段階の調整を実施。詳細は `src/data/questions.ts` 冒頭
- **ディレクトリ（§11.2）**: `types.ts` を `types.base.ts`（基本コピー）+ `type-seo/`（SEO本文）の合成にした（16タイプ×1500字を1ファイルに置くと編集不能なため）。`guides.ts` `notes.ts` も同様に分割
- **`?d=` の扱い（§6/§10.2）**: SSG を保ちつつ OG に d を伝播するため、`proxy.ts` で `/type/[slug]/d/[digest]` に内部リライト（URLバー表示は `?d=` のまま、canonical はクエリなし）
- **Edge Runtime**: Next.js 16 では非推奨警告が出るが、§10.2 の指定どおり `/api/og` は Edge で動作させている。将来 `runtime = 'nodejs'` に切り替える場合はフォント読込を `fs` 経由に変更する
- **X の intent URL**: `x.com/intent/post` を使用（旧 twitter.com は転送されるため）
- **デザイン（§7）**: ユーザー指示により「明治の薬瓶」→「平安の料紙」に全面変更。§7.2 の配色・§7.0 の一部禁止事項（朱をCTAに使用）は意図的に外れている
- **計測（§12.7）**: GA4 と同意バナーは撤去し Cloudflare Web Analytics に置換。`track()` は no-op の差し替え点として残置
