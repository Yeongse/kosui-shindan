# 香水診断 調香箋（CHOKOSEN）

12の質問で、あなたに似合う香水がわかる。無料・登録不要・約90秒。結果は16タイプの「調香箋」。

仕様の正は [app-spec.md](./app-spec.md)（v1.2）。本 README は実装の見取り図と運用手順のみを記す。

## スタック

- Next.js 16 (App Router, Turbopack) + TypeScript strict + CSS Modules。**完全静的**（`output: 'export'`）
- ホスティング: Cloudflare Workers の静的アセット（アセット専用・Worker コードなし）。設定は `wrangler.jsonc`
- 状態: React useReducer + sessionStorage（回答）/ localStorage（履歴3件）。外部状態管理なし
- アニメーション: CSS transition/keyframes + SVG。framer-motion 等なし
- OG画像: `next/og`（satori）で**ビルド時に生成**し `public/og/*.png` として配信（45枚）
- テスト: Vitest（scoring / 分布 / digest / コンテンツ検収）+ Playwright（静的出力に対する E2E）
- 解析: Cloudflare Web Analytics（Cookie 不使用・同意バナーなし）。DB なし。個人情報は収集しない

## デザイン — 現代の診断サイト × 和モダン（v5）

ターゲット（20代女性）に合わせ、MBTI系・ラブタイプ診断・COLORIA 香水診断の現物を調査して文法を揃えた（調査結果と確定トンマナは [docs/design-brief.md](./docs/design-brief.md)）。

- 白いカード + 白練の地に極薄の麻の葉、主色は朱・副色は藍。見出し・タイプ名は現代明朝（Zen Old Mincho）、本文・UIは角ゴシック（Zen Kaku Gothic New）。結果カードにはタイプ名の落款印
- 診断・結果は最大 560px の一列（PCでもアプリ感）。設問は「3 / 12」+ 進捗バー + 縦積みの角丸ボタン
- 結果は丸いキャラ絵 → タイプ名 → タグ → 調香ノート3カード → 香りのバランス（8本のバー%）→ 相性カード → シェア4ボタン
- 見出しの横バー・等幅ラベル・罫線主体・暗い地・セリフ体・クリーム地×赤茶は使わない
- 画像は原本を `assets/img/`、配信用 WebP を `public/img/` に置く（`npm run img:optimize` で生成）。スロットは無くても崩れない。生成プロンプトは [docs/image-prompts.md](./docs/image-prompts.md) / [docs/image-prompts-ready.md](./docs/image-prompts-ready.md)。記事の構造図（横長）は [docs/figure-prompts.md](./docs/figure-prompts.md)

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
| `npm run test:e2e` | Playwright（390px幅・静的出力 out/ に対して実行。要 `npm run build`） |
| `npm run serve` | `out/` を Cloudflare と同じURL解決でローカル配信（:3199） |
| `npm run og:build` | OG画像 45枚を `public/og/` に生成（`npm run build` の前段で自動実行） |
| `npm run check:links` | ビルド済みHTMLから内部リンクグラフを検証（孤立ページ0・リンク切れ0・アンカーテキスト・robots・§12.1 内部リンク規則） |
| `npm run analyze:distribution` | 16タイプの出現分布（一様ランダム / 人間モデル）を表示。`PATCHES` 環境変数で重み案を試算 |
| `npm run og:fonts` | OG画像用フォントのサブセット再生成（後述） |
| `npm run shots` | 主要ページのフルページスクリーンショット（目視検収用） |
| `npm run favicon` | ロゴ画像から favicon / apple-touch-icon / トリム版を生成 |
| `npm run img:optimize` | `assets/img`（原本PNG）→ `public/img`（配信用WebP: タイプ512²・ノート/ヒーロー幅1200）を生成 |
| `npm run deploy` | `out/` を Cloudflare にアップロードして公開（要 `CLOUDFLARE_API_TOKEN`） |
| `npm run verify` | typecheck → test → build → check:links → e2e を一括実行（リリース前） |

## ディレクトリ

```
src/
  app/                    ルーティング（§6）
    page.tsx              LP
    shindan/              診断フロー（noindex）
    type/                 香水タイプ一覧（香層図鑑）
    type/[slug]/          結果 兼 タイプ解説（SSG 16）
    notes/ notes/[slug]/  香りノート解説（8）
    guide/ guide/[slug]/  ガイド記事（18、データ層に追加するだけで増える）
    personality/          性格診断×香水の考察（MBTI・ラブタイプ）
    about/ privacy/ sitemap/  静的ページ・HTMLサイトマップ
    sitemap.ts robots.ts not-found.tsx
  components/             ShindanFlow（設問）/ Loading / ShindanCard（結果カード）/ AccordBars / TypeCard / ShareRow / Art（画像スロット）ほか
  data/
    schema.ts             型定義（§11.3）
    questions.ts          設問12問と重み（§4）— 重み調整の逸脱記録はファイル冒頭
    types.base.ts         16タイプの基本コピー（§5）
    type-seo/part-*.ts    16タイプの SEO本文・FAQ・関連リンク（固有書き下ろし）
    types.ts              上2つの合成（唯一の参照点）
    notes/ notes.ts       ノート解説 8本
    guides/ guides.ts     ガイド記事 18本（part-N.ts を足して配列に加えれば公開）
    cross/ cross.ts       性格診断×香水の考察 2本（/personality。選び方ガイドとは別立て）
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
  lib/og.tsx              OG画像のレンダリング（ビルド時に scripts/build-og.ts から使う）
  styles/tokens.css       デザイントークン（§7）
scripts/                  ビルド補助・検収・分析（build-og / optimize-images / favicon / check-links ほか）
e2e/                      Playwright（静的出力に対して実行）
assets/                   原本（画像PNG・OGフォント）。配信物は public/ に生成する
public/                   静的ファイル（画像・OG画像・_headers・_redirects）
wrangler.jsonc            Cloudflare へのデプロイ設定（アセット専用）
```

## 診断ロジックとキャリブレーション

- 判定は `src/lib/scoring.ts` の純粋関数。乱数・時刻を含まないため同じ回答は常に同じ結果。
- 分布は2つのモデルで担保する（`src/lib/scoring.test.ts`）:
  1. **一様ランダム**（§13.1）: 10万試行で全16タイプが 2〜22%
  2. **人間モデル**: `src/data/human-prior.ts` の選択肢事前分布（人気の偏り）と、回答者の潜在特性（温度嗜好・濃度嗜好）による一貫性を掛けたサンプラーで、全16タイプが 3〜16%
- 重みを変えたいときは `PATCHES='[{"q":3,"key":"C","temp":0}]' npm run analyze:distribution` で試算し、`questions.ts` に反映後 `npm run test`。
- **運用**: 回答の選択率が実測できるようになったら、`human-prior.ts` を実測値で置き換えて再キャリブレーションする。

## OG 画像の再生成

OG画像は `npm run build` の前段（`npm run og:build`）で 45枚（タイプ16・ノート8・ガイド18・考察2・既定1）を
`public/og/` に生成する。デザインは `src/lib/og.tsx`。

フォントのサブセット `assets/og-fonts/*.woff` は Shippori Mincho B1（全文言）と Yuji Syuku（タイプ名・見出し語のみ）を、
データ層に現れる文字（タイプ名・読み・ノート名・ガイド題名・固定ラベル + ASCII/かな）だけにサブセットしたもの。
**ガイド記事やノートの題名を追加・変更したら再生成すること**（未収録の漢字は OG 画像で描画されない）。

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli
# TTF は google/fonts リポジトリ（OFL）から取得して任意のディレクトリに置く
OG_FONT_SRC=/path/to/ttf PYFTSUBSET=.venv/bin/pyftsubset npm run og:fonts
```

## デプロイ（Cloudflare Workers 静的アセット）

静的書き出し（`output: 'export'`）した `out/` を、Cloudflare にアップロードして配信する。
Worker のコードは持たない「アセット専用」構成なので、リクエストは Cloudflare のアセット配信層で完結する
（コールドスタートなし・Worker のリクエスト課金なし）。設定は [wrangler.jsonc](./wrangler.jsonc) の1ファイル。

```bash
export CLOUDFLARE_API_TOKEN='...'   # スコープは下記
npm run build                       # out/ を作る（OG画像生成 → next build）
npm run deploy                      # out/ をアップロードして公開
```

### API トークンのスコープ

Cloudflare ダッシュボード →「マイプロフィール」→「API トークン」→「トークンを作成」。
テンプレート **「Cloudflare Workers を編集する」** を選ぶのが最短。手で選ぶ場合の最小構成:

| 種別 | 対象 | 権限 | 用途 |
|---|---|---|---|
| アカウント | Workers スクリプト | 編集 | Worker と静的アセットのアップロード |
| アカウント | アカウント設定 | 読み取り | アカウントの解決（`CLOUDFLARE_ACCOUNT_ID` を渡す場合は省略可） |
| ゾーン | Workers ルート | 編集 | 独自ドメイン（`kosui-shindan.com`）への接続 |
| ゾーン | ゾーン | 読み取り | 接続先ゾーンの解決 |

- **ゾーンリソース**は `kosui-shindan.com` だけに限定してよい
- KV / R2 / D1 は使っていないので不要
- トークンはファイルに書かず、環境変数 `CLOUDFLARE_API_TOKEN` で渡す

### 初回だけダッシュボードで設定すること

`wrangler deploy` は配信とドメイン接続までを行う。以下はサイトの挙動に関わるがデプロイでは触らないので、
最初に1回だけ設定する（いずれもゾーンの設定画面）。

1. **www → apex の301**: ルール →「リダイレクトルール」→ 受信リクエストが `hostname eq "www.kosui-shindan.com"` のとき、
   `concat("https://kosui-shindan.com", http.request.uri.path)` へ 301（クエリ文字列を保持）。
   あわせて DNS に `www` の AAAA レコード `100::`（プロキシ ON）を追加する
2. **常時 HTTPS**: SSL/TLS →「エッジ証明書」→「常に HTTPS を使用」を ON
3. **アクセス解析**: 「Web Analytics」→ サイトを追加 → `kosui-shindan.com`（自動挿入を ON にすれば
   `NEXT_PUBLIC_CF_BEACON_TOKEN` の設定は不要）

### URL の解決規則

`public/_headers` と `public/_redirects` がビルドで `out/` にコピーされ、アップロード時に Cloudflare が読み取る。

- `/type/gekko` → `out/type/gekko.html`、`/type/gekko/` は `/type/gekko` へ 301（`html_handling`）
- 未一致は `out/404.html` を 404 で返す（`not_found_handling`）
- 旧URL（`/q`、`/types`、`/r/{コード}`）は現行URLへ 301（`_redirects`）
- `/_next/static/*` は1年、画像とOGは1週間キャッシュ（`_headers`）

同じ挙動をローカルでも再現できる（E2E もこの上で実行される）:

```bash
npm run build && npm run serve      # http://localhost:3199
```

**環境変数はビルド時に焼き込まれる**（`NEXT_PUBLIC_*`）。アフィリエイトIDなどを変えたら `.env.local` を直して
ビルドし直す。Cloudflare 側に環境変数を置いても反映されない。

## リリース手順と Search Console（§12.5）

1. `npm run verify` が全て通ることを確認（typecheck / tests / build / 内部リンク検証 / E2E）
2. `npm run shots` で 390px と 1280px の見た目を確認（`npm run shots -- 390`）
3. `npm run deploy` でデプロイ後、`https://kosui-shindan.com/sitemap.xml` と `/robots.txt` を確認
4. **Google Search Console** に `kosui-shindan.com`（ドメインプロパティ）を追加し、Cloudflare DNS に TXT レコードで所有権確認
5. サイトマップ `https://kosui-shindan.com/sitemap.xml` を送信
6. URL検査で `/`, `/type/gekko`, `/notes/musk`, `/guide/how-to-choose` をインデックス登録リクエスト
7. リッチリザルトテストで FAQPage / Article / BreadcrumbList / Quiz にエラーがないことを確認
8. 1週間後にカバレッジ（インデックス済み 41 ページ）と「香水診断」関連クエリの表示回数を確認。月次で表示回数が伸びているのに CTR が低いページの title を改善（§14 M10）

## コンテンツ追加の運用

- ガイド記事: `src/data/guides/part-N.ts` を作り `guides.ts` の配列に追加するだけで公開される。公開前に固有の実体験・具体例を1箇所以上追記する（§12.3）。追加後 `npm run og:fonts` と `npm run verify`
- §12.3 の15本＋「香水作り・調香体験とは」の計16本を公開済み。以降は月2本ペースで追記（§14 M10）
- コンテンツ検収（絵文字ゼロ・「！」ゼロ・howToChoose 700〜1000字・重複率30%未満・関連リンク実在）は `npm run test` に含まれる

## 仕様からの逸脱記録

- **設問の重み（§4）**: 初期値では分布テスト（§13.1）を満たさなかったため、文言は変えずに重みのみ調整。さらに人間の選択の偏りを考慮した第2段階の調整を実施。詳細は `src/data/questions.ts` 冒頭
- **ディレクトリ（§11.2）**: `types.ts` を `types.base.ts`（基本コピー）+ `type-seo/`（SEO本文）の合成にした（16タイプ×1500字を1ファイルに置くと編集不能なため）。`guides.ts` `notes.ts` も同様に分割
- **完全静的化（§6/§10.2/§11.1）**: Cloudflare の静的ホスティングに載せるため、Edge の `/api/og`・middleware・動的ルートを廃止した。
  - OG画像は**ビルド時に生成**（`public/og/*.png`）。このため `?d=` によるOG画像の個人化は行わない（共有リンクのプレビューはタイプ代表値。ページ本体とダウンロードする縦長画像は従来どおり個人のスコアで描画される）
  - `?d=` は**ブラウザ側で解決**する。静的HTMLはタイプ代表値で描画し、マウント後に香りのバランス・隠し香調・共有URLを本人の値へ差し替える（本文・見出しは静的HTMLに含まれるので検索には影響しない）
  - 旧URLの301は Cloudflare 側（`public/_redirects`）で行う
- **X の intent URL**: `x.com/intent/post` を使用（旧 twitter.com は転送されるため）
- **デザイン（§7）**: ユーザー指示により spec の世界観（暗い薬瓶・縦書き・蒸留瓶）を離れ、現代の診断サイトの文法（白カード・パステル・丸ゴ・進捗バー・キャラ絵）に全面変更。§7.0 の「角丸カードのグリッド」「棒状プログレス」はジャンル標準として採用。絵文字不使用・「！」不使用は維持
- **計測（§12.7）**: GA4 と同意バナーは撤去し Cloudflare Web Analytics に置換。`track()` は no-op の差し替え点として残置
