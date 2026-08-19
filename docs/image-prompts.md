# 画像生成プロンプト一覧（v5: 和モダン × 現代の診断サイト）

トンマナは [design-brief.md](./design-brief.md)（v5 追記）。画像スロットは **無くても崩れない**（色付きの丸にフォールバック）が、
このジャンルは「キャラ絵」が主役なので、**16タイプの絵が揃ってはじめて完成**する。
優先度: ★★★ 必須 / ★★ 推奨

## 共通スタイル（全画像に付ける接頭辞）

日本語:
> やわらかなパステル調のデジタルイラスト。現代の診断サイト向けの清潔感のあるタッチに、和の要素（扇・簪・和紙・水引・組紐・小さな家紋のような円）を少しだけ混ぜる。線は細く上品、塗りはフラット寄りで薄い陰影、ほんのり光。背景は白〜白練。文字・ロゴ・ウォーターマーク・額縁は入れない。けばけばしい和柄や時代劇風にはしない。

英語:
> soft pastel digital illustration, clean modern style for a personality-quiz website aimed at women in their 20s, with a light touch of Japanese craft motifs (folding fan, hair ornament, washi paper, mizuhiki cord, small crest-like circle), thin elegant lines, flat shading, airy light, white to off-white background, no text, no letters, no watermark, no frame, not kimono-costume-drama, not loud traditional patterns

合わせたい色: 地 `#FCFAF7` / 朱 `#E0492F` / 藍 `#2D4F8A` / 文字 `#27262B`。
香調の色（タイプの地色）: シトラス `#FFC93C` / グリーン `#6CCB9A` / フローラル `#FF7EB3` / フルーティ `#FF8E72` / グルマン `#E0A05E` / ウッディ `#B58A63` / アンバー `#F2A93B` / ムスク `#B9A8F2`（クール系は少し淡く）

---

## 1. 16タイプのキャラクター（結果カード・一覧カードの丸の中）★★★

| パス | サイズ | 表示 |
|---|---|---|
| `public/img/types/{slug}.png` ×16 | 1024×1024 | 正円でトリミングされ、外側に二重の輪と朱の落款印が付く。**背景はそのタイプの地色（下表）のベタ or 透過**。被写体は中央、外周 15% は空ける |

16枚で **同じキャラ設計（等身・線・塗り）** に揃えること。人物なら上半身のバストアップ、または擬人化した「香りの精」。
顔は正面〜やや斜め、表情はタイプの性格に合わせる。香調は小物で示し、和の要素は一点だけ（髪飾り・扇・襟元の組紐など）。

| slug | タイプ（香調・温度） | 地色 | モチーフ・表情・小物 |
|---|---|---|---|
| `shinko` | 晨光（シトラス・クール） | `#FFE08A` | 朝の光、白シャツ、グレープフルーツの輪切り、簪は銀。すっきりした笑顔 |
| `yokoku` | 陽刻（シトラス・ウォーム） | `#FFC93C` | 日輪のような明るさ、橙とジンジャー、朱の扇。元気な笑顔 |
| `ugo` | 雨後（グリーン・クール） | `#A9E3C4` | 雨上がりの葉と水滴、透明な番傘、静かな微笑み |
| `nobi` | 野火（グリーン・ウォーム） | `#6CCB9A` | 無花果の葉と実、組紐、穏やかだが芯のある目 |
| `gekko` | 月虹（フローラル・クール） | `#FFB3CF` | 月と淡い虹、白い花（スズラン・アイリス）、透明感のある佇まい |
| `shunsho` | 春宵（フローラル・ウォーム） | `#FF7EB3` | 夜桜とローズ、提灯のほのかな灯り、情の深い笑顔 |
| `karo` | 果露（フルーティ・クール） | `#FFB8A3` | 冷やした青りんごとライチ、水滴、ガラスの器、親しみやすい表情 |
| `mitsugetsu` | 蜜月（フルーティ・ウォーム） | `#FF8E72` | 桃とアプリコット、橙の花、幸せそうな笑顔 |
| `setto` | 雪糖（グルマン・クール） | `#F1D3B6` | 雪の結晶と砂糖菓子、和三盆、落ち着いた表情 |
| `shoko` | 焦香（グルマン・ウォーム） | `#E0A05E` | キャラメルとシナモン、湯気の立つ湯呑み、少し大人びた微笑み |
| `shinkan` | 森閑（ウッディ・クール） | `#D3C1AE` | 霧の檜林、苔、静かな横顔 |
| `shinka` | 薪火（ウッディ・ウォーム） | `#B58A63` | 囲炉裏の火と薪、カルダモン、頼もしい笑顔 |
| `yoiyami` | 宵闇（アンバー・クール） | `#F5C77A` | 夜のお香の煙と香炉、サフラン、ミステリアスな目線 |
| `kohaku` | 琥珀（アンバー・ウォーム） | `#F2A93B` | 琥珀の飾りとバニラ、夕方の光、余裕のある微笑み |
| `hakuji` | 白磁（ムスク・クール） | `#E6E2F2` | 白磁の器と白い布、余白の多い構図、涼しげな表情 |
| `kime` | 肌理（ムスク・ウォーム） | `#B9A8F2` | 肌なじみのよい絹、ライスパウダー、やわらかい笑顔 |

プロンプト例（gekko）:
> 接頭辞 + "a gentle young woman character, bust-up, surrounded by a pale moon and a faint rainbow, white lily-of-the-valley and iris flowers, a small silver hair ornament as the only Japanese accent, pastel pink background #FFB3CF, centered composition leaving 15% margin, square"

## 2. LP のキービジュアル ★★★

| パス | サイズ | 表示 |
|---|---|---|
| `public/img/hero/key-visual.jpg` | 1600×900 | LP最上部、角丸 24px の横長枠。文字は載せないので絵だけで「香水診断」だと伝わる構図 |

プロンプト例:
> 接頭辞 + "three or four pastel perfume bottles of different shapes on a white washi surface, a few soft petals, a thin red-and-white mizuhiki cord loosely placed, droplets of light, playful and clean, wide 16:9 composition"

## 3. 香りノート解説の扉絵 ★★

| パス | サイズ | 表示 |
|---|---|---|
| `public/img/notes/{slug}.jpg` ×8 | 1600×700 | 一覧カードと記事冒頭の横長枠 |

| slug | モチーフ |
|---|---|
| `citrus` | レモン・グレープフルーツ・柚子の断面、朝の光 |
| `green` | 若葉と水滴、刈りたての草、苔 |
| `floral` | ローズ・ピオニー・スズランの花束、小さな和紙の包み |
| `fruity` | 桃・ライチ・青りんご、水滴、ガラスの器 |
| `gourmand` | キャラメル・ホワイトチョコ・和三盆・バニラビーンズ |
| `woody` | ヒノキ・シダーの木片と針葉、やわらかい木漏れ日 |
| `amber` | 琥珀の樹脂と香炉の煙、夕方の光 |
| `musk` | 白い布と白い花、清潔感のある余白 |

## 配置後の確認

1. 上記パスに置く（小文字・拡張子まで一致）
2. `npm run dev` で `/`, `/type`, `/type/gekko` を開き、丸の中に絵が入っていることを確認
3. PNG は 300KB 以下、JPEG は品質 80 前後・400KB 以下を目安に圧縮
