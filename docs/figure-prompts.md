# 記事の構造図プロンプト（MBTI／ラブタイプの考察記事）

**すべて 1600×900 の横長（16:9）。正方形ではない。**
キャラ絵（1024×1024の正方形）のプロンプトは [image-prompts-ready.md](./image-prompts-ready.md) にある別物なので混同しないこと。

12枚。**すべて 16:9 の横長**（1600×900 推奨）。保存先は `assets/img/article/`、保存後に `npm run img:optimize` を実行すると
`public/img/article/*.webp` が作られて記事に出る。**画像が無い間は図版ごと非表示**なので、1枚ずつ差し込んでいける。

## 生成するときの前提

- **文字はラテン文字だけ**にしてある。日本語は画像生成AIがまず崩すので、意味は本文とキャプション側に持たせた
- 文字を入れるのは6枚のみ（MBTIコードと軸の記号）。残り6枚は**文字ゼロ**で構造だけを見せる設計
- 色は指定済み。サイトの16タイプの液体色と揃えてあるので、**そのまま貼れば記事のトーンに馴染む**
- 生成後は**文字化けだけ確認**してほしい。1文字でも崩れていたら、その枚だけ再生成するか、色と配置は合っているので文字なしで作り直す

## 16タイプの対応表について

`mbti-map.png` はこの記事の目玉で、16個のコードを正しく描けるかが勝負になる。**もし文字が崩れるようなら、
`assets/img/types/*.png`（16人のキャラ絵）を参照画像として渡す方式に切り替えたほうが早い**。その場合は
「16個の円のかわりにこの16枚を4×4に並べ、各画像の下に対応するコードを置く」と指示すると、絵が主役になって文字の比重が下がる。

---

## assets/img/article/mbti-axes.png（1600×900）

- **入る位置**: MBTI記事「4つの軸を、香水の言葉に置き換える」
- **見せたい構造**: 4つの軸が、それぞれ別の設計要素の「両極」を決めていること
- **画像に入れる文字**: 「E / I」「S / N」「T / F」「J / P」の4つだけ

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. Four horizontal rows stacked evenly, each row is one comparison. On the left edge of each row a small rounded pill badge containing only these exact characters, one per row from top to bottom: E / I, then S / N, then T / F, then J / P. To the right of each badge a long thin horizontal bar that fades from one pole to the other, with one simple pictogram at each end of the bar. Row one: a small dot with a very wide radiating halo on the left end, and a small dot with a tight close halo on the right end. Row two: a crisp sharp-edged hexagon on the left end, and a soft blurred cloud shape on the right end. Row three: an icy pale-blue droplet on the left end, and a warm amber droplet on the right end. Row four: a tall perfume bottle with a heavy base on the left end, and a light spray puff on the right end. Accent colour #E0492F for the badges. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/mbti-accords.png（1600×900）

- **入る位置**: MBTI記事「3つの軸の組み合わせで、8つの香調が決まる」
- **見せたい構造**: 3回の枝分かれで8つに分かれること
- **画像に入れる文字**: 「E/I」「S/N」「J/P」の3つだけ（枝分かれの各段の上に置く）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. A left-to-right binary branching tree on a single row: one node on the far left splits into two, each of those splits into two, and each of those splits into two again, ending in exactly eight filled circles stacked vertically along the right edge. The eight end circles are, from top to bottom: #F3CF70, #DBB48C, #F7B3A2, #F8ADCC, #96CAAF, #B49F8D, #D8D0F3, #E8B76E. Thin #E0492F lines for the branches. Above each of the three branching stages, one tiny label: E/I above the first, S/N above the second, J/P above the third. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/mbti-map.png（1600×900）

- **入る位置**: MBTI記事「16タイプの対応をまとめると、こうなる」（この記事の目玉）
- **見せたい構造**: 16タイプが16の色に1対1で対応すること
- **画像に入れる文字**: 16個のMBTIコードのみ（4文字ずつ）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. A clean grid of exactly four columns and four rows, sixteen cells in total, evenly spaced. Each cell contains one large filled circle with a small four-letter code centred directly underneath it in a compact sans-serif. Reading left to right, top row: a #F3CF70 circle labelled ESTP, a #FFC93C circle labelled ESFP, a #DBB48C circle labelled ESTJ, a #E0A05E circle labelled ESFJ. Second row: #F7B3A2 labelled ENTP, #FF8E72 labelled ENFP, #F8ADCC labelled ENTJ, #FF7EB3 labelled ENFJ. Third row: #96CAAF labelled ISTP, #6CCB9A labelled ISFP, #B49F8D labelled ISTJ, #B58A63 labelled ISFJ. Bottom row: #D8D0F3 labelled INTP, #B9A8F2 labelled INFP, #E8B76E labelled INTJ, #F2A93B labelled INFJ. All sixteen circles are the same size. The labels are the only text in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/mbti-distance.png（1600×900）

- **入る位置**: MBTI記事「E / I ｜ 香りをどこまで届かせるか」
- **見せたい構造**: 外向は遠くまで、内向は近くだけ、という半径の差
- **画像に入れる文字**: 「E」「I」の2文字だけ

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. Two panels side by side, divided by a thin vertical hairline. In the left panel, a single small figure silhouette at the centre surrounded by a very wide translucent circular halo that nearly fills the panel, with four small filled dots floating inside the halo coloured #F3CF70, #F7B3A2, #F8ADCC and #DBB48C. In the right panel, the same silhouette but with a much smaller tight halo hugging the figure, holding four dots coloured #96CAAF, #B49F8D, #D8D0F3 and #E8B76E. A single letter E sits above the left panel and a single letter I above the right panel. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/mbti-temperature.png（1600×900）

- **入る位置**: MBTI記事「T / F ｜ 温度。この記事でいちばん効いている軸」
- **見せたい構造**: 16タイプが冷たい8つと温かい8つに割れること
- **画像に入れる文字**: 「T」「F」の2文字だけ

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. One long horizontal spectrum bar spanning the full width, fading smoothly from a cool pale blue on the left to a warm amber on the right. Sixteen small circles sit along the bar in two tidy rows of eight. The eight circles on the cool left half are #F3CF70, #DBB48C, #F7B3A2, #F8ADCC, #96CAAF, #B49F8D, #D8D0F3 and #E8B76E. The eight on the warm right half are #FFC93C, #E0A05E, #FF8E72, #FF7EB3, #6CCB9A, #B58A63, #B9A8F2 and #F2A93B. A single letter T at the far left end of the bar and a single letter F at the far right end. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/mbti-groups.png（1600×900）

- **入る位置**: MBTI記事「4つのグループでざっくり見ると」
- **見せたい構造**: 分析家は全部クール、外交官は全部ウォーム、番人と探検家は混ざること
- **画像に入れる文字**: 「NT」「NF」「SJ」「SP」の4つだけ

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. Four equal panels in a single row, each panel a rounded rectangle. Each panel holds four small filled circles in a two-by-two arrangement, with one short label at the top of the panel. The first panel is labelled NT and its four circles are all cool-toned: #F7B3A2, #F8ADCC, #D8D0F3, #E8B76E, with a thin cool blue ring around the panel. The second is labelled NF with four warm circles #FF8E72, #FF7EB3, #B9A8F2, #F2A93B and a thin warm amber ring. The third is labelled SJ with #DBB48C, #E0A05E, #B49F8D, #B58A63. The fourth is labelled SP with #F3CF70, #FFC93C, #96CAAF, #6CCB9A background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/lovetype-axes.png（1600×900）

- **入る位置**: ラブタイプ記事「4つの軸を、香水の言葉に置き換える」
- **見せたい構造**: 恋愛の4つの軸が、それぞれ別の両極を決めていること
- **画像に入れる文字**: なし（文字を一切入れない）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. Four horizontal rows stacked evenly, each row one comparison, with a long thin horizontal bar fading from one pole to the other and a simple pictogram at each end. Row one: an arrow that starts first and leads on the left end, an arrow that follows behind on the right end. Row two: a sliding door standing wide open with light spilling out on the left end, the same door closed on the right end. Row three: a small flame on the left end, a clear ice crystal on the right end. Row four: one long unbroken line on the left end, several short separate dashes on the right end. Accent colour #E0492F. Absolutely no text or letters anywhere in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/lovetype-accords.png（1600×900）

- **入る位置**: ラブタイプ記事「3つの軸の組み合わせで、8つの香調が決まる」
- **見せたい構造**: 3回の枝分かれで8つに分かれること
- **画像に入れる文字**: なし（文字を一切入れない）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. A left-to-right binary branching tree on a single row: one node on the far left splits into two, then four, then eight, ending in exactly eight filled circles stacked vertically along the right edge, coloured from top to bottom #F3CF70, #F8ADCC, #F7B3A2, #DBB48C, #96CAAF, #B49F8D, #D8D0F3 and #E8B76E. Thin #E0492F branch lines. Absolutely no text or letters anywhere in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/lovetype-map.png（1600×900）

- **入る位置**: ラブタイプ記事「対応をまとめると、こうなる」
- **見せたい構造**: 同じ組み合わせでも、熱量で左右2つに分かれること
- **画像に入れる文字**: なし（文字を一切入れない）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. A tidy grid of two columns and eight rows, sixteen filled circles in total, all the same size. The left column is tinted with a cool pale-blue wash behind it and the right column with a warm amber wash. Left column circles from top to bottom: #F3CF70, #F8ADCC, #F7B3A2, #DBB48C, #96CAAF, #B49F8D, #D8D0F3, #E8B76E. Right column, same order: #FFC93C, #FF7EB3, #FF8E72, #E0A05E, #6CCB9A, #B58A63, #B9A8F2, #F2A93B. Along the far left margin of each row, three tiny pictogram markers: a leading arrow or a following arrow, an open door or a closed door, one unbroken line or short dashes. Absolutely no text or letters anywhere in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/lovetype-lead.png（1600×900）

- **入る位置**: ラブタイプ記事「主導性｜先に香るか、最後に残るか」
- **見せたい構造**: 立ち上がりが早い香りと、遅れて効く香りの時間差
- **画像に入れる文字**: なし（文字を一切入れない）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. A simple line chart with one horizontal baseline representing time and no numbers or ticks. Two smooth curves are drawn over it. The first curve in #E0492F rises very steeply near the left edge, peaks early, then falls away and fades. The second curve in #2D4F8A rises slowly, peaks late toward the right side, and stays high all the way to the right edge. A small perfume bottle icon sits at the start of the first curve and a faint scent trail sits at the end of the second. Absolutely no text, letters or numbers anywhere in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/lovetype-distance.png（1600×900）

- **入る位置**: ラブタイプ記事「公開度｜どこまで届かせるか」
- **見せたい構造**: オープンは遠くまで、プライベートは近くだけ
- **画像に入れる文字**: なし（文字を一切入れない）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. Two panels side by side, divided by a thin vertical hairline. In the left panel a small figure silhouette with a very wide translucent circular halo nearly filling the panel, four small dots inside it coloured #F3CF70, #F7B3A2, #F8ADCC and #DBB48C, and several other silhouettes standing far away but still inside the halo. In the right panel the same figure with a tight halo only an arm's length wide, four dots inside it coloured #96CAAF, #B49F8D, #D8D0F3 and #E8B76E, and one other silhouette standing close enough to be inside it while the rest stand outside. Absolutely no text or letters anywhere in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

## assets/img/article/lovetype-scenes.png（1600×900）

- **入る位置**: ラブタイプ記事「場面別｜ちょうどいい量はここまで変わる」
- **見せたい構造**: 場所によって、ちょうどいい香りの範囲が段階的に変わること
- **画像に入れる文字**: なし（文字を一切入れない）

flat vector infographic illustration, editorial magazine quality, minimal and airy, generous white space, thin hairlines, soft matte pastel palette, no photographic texture, no 3D, no drop shadows. Four equal panels in a single row, each showing one scene with a seated or standing figure and a translucent circular scent halo of a clearly different size. From left to right the halo grows steadily larger: first a restaurant table set for two with the smallest halo barely touching the figure, then the interior of a car with a slightly larger halo, then a row of cinema seats with a medium halo, then an open night street with the largest halo. Halo colour a soft #E0492F at low opacity. Absolutely no text or letters anywhere in the image. background #FCFAF7, wide landscape 16:9 composition, wide outer margins, no paragraphs of text, no sentences, no captions, no legend, no watermark, no logo, no signature, no distorted or invented letterforms.

