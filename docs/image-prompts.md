# 画像生成プロンプト一覧（平安の料紙・大和絵）

サイトの画像スロットは **無くても崩れない**（地色・SVGのフォールバック）が、揃うほど世界観が立つ。
優先度: ★★★ 必須 / ★★ 推奨 / ★ あれば

すべてのプロンプトに共通で付ける接頭辞（英語で生成する場合）:

> Heian-period Japanese decorated paper (ryōshi) aesthetic, yamato-e style, mineral pigments on washi, restrained and elegant, soft natural light, fine paper fiber texture, **no text, no letters, no watermark, no people, no frame**

日本語で生成する場合:

> 平安時代の料紙装飾・大和絵の様式。和紙に岩絵具、抑制された上品な色、柔らかな光、紙の繊維の質感。文字・人物・額縁は入れない。

色の基準（合わせたい地色）: 生成り `#F3EADB` / 胡粉 `#FBF6EC` / 墨 `#2A2420` / 朱 `#B0432D` / 金 `#B3903E`

---

## 1. 地と装飾（サイト全体）

| 優先 | パス | サイズ | 内容 |
|---|---|---|---|
| ★★★ | `public/img/paper/washi-tile.jpg` | 1024×1024 **シームレス** | 生成り（#F3EADB 前後）の和紙の質感だけ。繊維・わずかな濃淡。砂子・模様なし。継ぎ目が出ないこと（tileable）。JPEG 品質 80、200KB 以下目安 |
| ★★★ | `public/img/paper/hero-ryoshi.jpg` | 2400×1350 | LPヒーローの料紙。右上に淡い藤色〜浅葱の**飛雲**、全体に**金銀の砂子・切箔**をまばらに、下端に薄い**墨流し**。左 60% は文字を載せるため模様をほぼ置かない。地色は #ECE1CC 前後 |
| ★★ | `public/img/paper/kumo-band.png` | 2400×600 **透過PNG** | 横長の飛雲の帯（セクション区切り・フッター上）。藤 `#8F7AA3` と浅葱 `#5B8791` を 15〜25% の不透明度で、縁はにじむ。金砂子を少し。背景透過 |
| ★★ | `public/img/paper/sunago-corner.png` | 1200×1200 **透過PNG** | 右上の角から中央へ向かって薄れていく金銀の砂子・野毛・切箔の群れ。背景透過。カードや色紙の角に重ねる |
| ★★★ | `public/img/paper/shikishi.jpg` | 1600×2000 | 結果カード（調香箋）の色紙の紙。胡粉色 `#FBF6EC` の上質な和紙、上下の縁に金砂子の帯、中央は無地（文字が載る）。継ぎ紙のような色の切り替えは入れない |

プロンプト例（hero-ryoshi）:
> 接頭辞 + "a wide sheet of Heian ryōshi decorated paper, pale ivory base #ECE1CC, faint indigo and wisteria tobikumo clouds drifting in the upper right, scattered gold and silver sunago flakes and tiny kirihaku squares, a very faint suminagashi ink-marbling along the bottom edge, the left 60% of the sheet kept almost plain for text, flat top-down view, 16:9"

プロンプト例（washi-tile）:
> "seamless tileable texture of natural ivory washi paper, visible soft fibers, very subtle tonal variation, color around #F3EADB, flat lighting, no pattern, no flakes, 1:1"

## 2. LP キービジュアル

| 優先 | パス | サイズ | 内容 |
|---|---|---|---|
| ★★★ | `public/img/hero/key-visual.jpg` | 1600×1600 | 色紙に入れる主画像。**青磁の香炉から一筋の煙**が立ち、傍らに薫物（練香）の小箱と匂い袋（組紐）。薄縁の畳か漆の台。背景は生成りの料紙。大和絵の引き算の構図、余白多め。JPEG |

プロンプト例:
> 接頭辞 + "a celadon incense burner with a single thin thread of smoke rising, a small lacquered box of kneaded incense (takimono) and a silk scent sachet with braided cord beside it, placed on a pale tatami edge, generous empty space, yamato-e flatness with soft shading, square composition"

## 3. 16タイプの絵（調香箋カードの丸窓）

| 優先 | パス | サイズ | 内容 |
|---|---|---|---|
| ★★★ | `public/img/types/{slug}.png` ×16 | 1024×1024 | 丸くトリミングされて表示される。**中央にモチーフ、背景は生成り `#F3EADB` 前後の無地**（透過でも可）。大和絵の簡素な筆致・岩絵具の発色。16枚で筆致と色調を揃える |

共通接尾辞: "single motif centered, plain pale ivory paper background, circular-crop friendly, square"

| slug | タイプ | モチーフ |
|---|---|---|
| `shinko` | 晨光（シトラス・冷） | 夜明けの薄青い空に橘（たちばな）の枝、金の朝光が一筋 |
| `yokoku` | 陽刻（シトラス・温） | 朱金の日輪と橙（だいだい）の実、生姜の花 |
| `ugo` | 雨後（グリーン・冷） | 雨上がりの草に露、菫（すみれ）が一輪、薄い霞 |
| `nobi` | 野火（グリーン・温） | 無花果の葉と実、遠景に低く這う野の火と霞 |
| `gekko` | 月虹（フローラル・冷） | 夜の水面にかかる白い虹と月、白い夕顔の花 |
| `shunsho` | 春宵（フローラル・温） | 宵の紅梅（または夜桜）、燈籠の灯り |
| `karo` | 果露（フルーティ・冷） | 井戸水で冷やした青梅と桃、水滴 |
| `mitsugetsu` | 蜜月（フルーティ・温） | 熟した桃と橘の花、温かい午後の光 |
| `setto` | 雪糖（グルマン・冷） | 雪輪文の中に白い椿、砂糖菓子のような雪の結晶 |
| `shoko` | 焦香（グルマン・温） | 火鉢の炭火と香炉の煙、焦げ茶と琥珀の色調 |
| `shinkan` | 森閑（ウッディ・冷） | 霞に沈む檜の林、朝靄 |
| `shinka` | 薪火（ウッディ・温） | 囲炉裏の火と積まれた薪、杉の枝 |
| `yoiyami` | 宵闇（アンバー・冷） | 夜の香炉と立ちのぼる煙、閉じた黒い扇 |
| `kohaku` | 琥珀（アンバー・温） | 琥珀の塊と松脂の滴、金色の逆光 |
| `hakuji` | 白磁（ムスク・冷） | 白磁の壺と白い布、余白だけの構図 |
| `kime` | 肌理（ムスク・温） | 重ねた絹の衣（襲）の袖口、肌色から桜色への柔らかい諧調 |

## 4. 香りノート解説の扉絵（8枚）

| 優先 | パス | サイズ | 内容 |
|---|---|---|---|
| ★★ | `public/img/notes/{slug}.jpg` ×8 | 1600×900 | 記事冒頭の横長扉絵。大和絵の花鳥風月で香調を表す。文字なし |

| slug | モチーフ |
|---|---|
| `citrus` | 橘の実と葉、朝の光 |
| `green` | 若草と露、雨後の野 |
| `floral` | 藤と白菊、花びらが散る |
| `fruity` | 桃・枇杷・梅の実、籠 |
| `gourmand` | 和三盆の干菓子と栗、火鉢 |
| `woody` | 檜・杉の林と霞 |
| `amber` | 香炉の煙、琥珀と樹脂の滴 |
| `musk` | 白い絹、匂い袋、余白 |

---

## 配置後の確認

1. ファイルを上記パスに置く（ファイル名は小文字・拡張子まで一致させる）
2. `npm run dev` で `/`, `/type/gekko`, `/notes/musk` を開き、画像が出ていること、フォールバックに戻っていないことを確認
3. 重いと感じたら JPEG 品質 75〜82・長辺 1600〜2400px に圧縮（`washi-tile` は 200KB 以下、他は 400KB 以下が目安）
