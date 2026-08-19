# 画像生成プロンプト一覧（v4: 現代の診断サイト用イラスト）

トンマナは [design-brief.md](./design-brief.md)。画像スロットは **無くても崩れない**（色付きの丸にフォールバック）が、
このジャンルは「キャラ絵」が主役なので、**16タイプの絵が揃ってはじめて完成**する。
優先度: ★★★ 必須 / ★★ 推奨

## 共通スタイル（全画像に付ける接頭辞）

日本語:
> やわらかなパステル調のデジタルイラスト。白〜淡いピンク／ラベンダーの背景、丸みのある線、透明感のある配色、ほんのり光。清潔感のある現代的なタッチ（20代女性向けの診断サイト・SNSシェア画像の雰囲気）。文字・ロゴ・ウォーターマーク・額縁は入れない。

英語:
> soft pastel digital illustration, clean modern style for a personality-quiz website aimed at women in their 20s, rounded shapes, airy light, pale pink and lavender tones, white background, no text, no letters, no watermark, no frame

合わせたい色: 地 `#FBF8FC` / ローズ `#FF5C8D` / ラベンダー `#8B7CF6` / 文字 `#1E1B2E`。
香調の色（タイプの地色）: シトラス `#FFC93C` / グリーン `#6CCB9A` / フローラル `#FF7EB3` / フルーティ `#FF8E72` / グルマン `#E0A05E` / ウッディ `#B58A63` / アンバー `#F2A93B` / ムスク `#B9A8F2`（クール系は少し淡く）

---

## 1. 16タイプのキャラクター（結果カード・一覧カードの丸の中）★★★

| パス | サイズ | 表示 |
|---|---|---|
| `public/img/types/{slug}.png` ×16 | 1024×1024 | 正円でトリミング。**背景はそのタイプの地色（下表）のベタ or 透過**。被写体は中央、外周 15% は空ける |

16枚で **同じキャラ設計（等身・線・塗り）** に揃えること。人物なら上半身のバストアップ、または擬人化した「香りの精」。
顔は正面〜やや斜め、表情はタイプの性格に合わせる。小物で香調を示す。

| slug | タイプ（香調・温度） | 地色 | モチーフ・表情・小物 |
|---|---|---|---|
| `shinko` | 晨光（シトラス・クール） | `#FFE08A` | 朝の光、白シャツ、グレープフルーツの輪切り。すっきりした笑顔 |
| `yokoku` | 陽刻（シトラス・ウォーム） | `#FFC93C` | 太陽のような明るさ、オレンジとジンジャー、元気な笑顔 |
| `ugo` | 雨後（グリーン・クール） | `#A9E3C4` | 雨上がりの葉と水滴、透明な傘、静かな微笑み |
| `nobi` | 野火（グリーン・ウォーム） | `#6CCB9A` | 無花果の葉と実、穏やかだが芯のある目 |
| `gekko` | 月虹（フローラル・クール） | `#FFB3CF` | 月と淡い虹、白い花（スズラン・アイリス）、透明感のある佇まい |
| `shunsho` | 春宵（フローラル・ウォーム） | `#FF7EB3` | 夜桜とローズ、ピンクペッパー、情の深い笑顔 |
| `karo` | 果露（フルーティ・クール） | `#FFB8A3` | 冷やした青りんごとライチ、水滴、親しみやすい表情 |
| `mitsugetsu` | 蜜月（フルーティ・ウォーム） | `#FF8E72` | 桃とアプリコット、オレンジの花、幸せそうな笑顔 |
| `setto` | 雪糖（グルマン・クール） | `#F1D3B6` | 雪の結晶と砂糖菓子、ホワイトチョコ、落ち着いた表情 |
| `shoko` | 焦香（グルマン・ウォーム） | `#E0A05E` | キャラメルとシナモン、湯気、少し大人びた微笑み |
| `shinkan` | 森閑（ウッディ・クール） | `#D3C1AE` | 霧の針葉樹林、ヒノキ、静かな横顔 |
| `shinka` | 薪火（ウッディ・ウォーム） | `#B58A63` | 焚き火と薪、カルダモン、頼もしい笑顔 |
| `yoiyami` | 宵闇（アンバー・クール） | `#F5C77A` | 夜のお香の煙、サフラン、ミステリアスな目線 |
| `kohaku` | 琥珀（アンバー・ウォーム） | `#F2A93B` | 琥珀とバニラ、夕方の光、余裕のある微笑み |
| `hakuji` | 白磁（ムスク・クール） | `#E6E2F2` | 白い陶器と白い布、余白の多い構図、涼しげな表情 |
| `kime` | 肌理（ムスク・ウォーム） | `#B9A8F2` | 肌なじみのよい布、ライスパウダー、やわらかい笑顔 |

プロンプト例（gekko）:
> 接頭辞 + "a gentle young woman character, bust-up, surrounded by a pale moon and a faint rainbow, white lily-of-the-valley and iris flowers, translucent pastel pink background #FFB3CF, centered composition leaving 15% margin, square"

## 2. LP のキービジュアル ★★★

| パス | サイズ | 表示 |
|---|---|---|
| `public/img/hero/key-visual.jpg` | 1600×900 | LP最上部、角丸 24px の横長枠。文字は載せないので絵だけで「香水診断」だと伝わる構図 |

プロンプト例:
> 接頭辞 + "three or four pastel perfume bottles of different shapes arranged on a white surface with soft petals, droplets and a faint rainbow, playful and clean, wide 16:9 composition"

## 3. 香りノート解説の扉絵 ★★

| パス | サイズ | 表示 |
|---|---|---|
| `public/img/notes/{slug}.jpg` ×8 | 1600×700 | 一覧カードと記事冒頭の横長枠 |

| slug | モチーフ |
|---|---|
| `citrus` | レモン・グレープフルーツ・ベルガモットの断面、朝の光 |
| `green` | 若葉と水滴、刈りたての草 |
| `floral` | ローズ・ピオニー・スズランの花束 |
| `fruity` | 桃・ライチ・青りんご、水滴 |
| `gourmand` | キャラメル・ホワイトチョコ・バニラビーンズ |
| `woody` | ヒノキ・シダーの木片と針葉、やわらかい木漏れ日 |
| `amber` | 琥珀の樹脂とお香の煙、夕方の光 |
| `musk` | 白い布と白い花、清潔感のある余白 |

## 4. 任意（あると雰囲気が上がる）

- `public/img/og/default.jpg`（1200×630）: OG画像は自動生成しているので不要。差し替えたい場合のみ。

## 配置後の確認

1. 上記パスに置く（小文字・拡張子まで一致）
2. `npm run dev` で `/`, `/type`, `/type/gekko` を開き、丸の中に絵が入っていることを確認
3. PNG は 300KB 以下、JPEG は品質 80 前後・400KB 以下を目安に圧縮
