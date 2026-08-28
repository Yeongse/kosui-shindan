# 記事の構造図プロンプト（MBTI／ラブタイプの考察記事）

**すべて 1600×900 の横長（16:9）。正方形ではない。**
キャラ絵（1024×1024の正方形）のプロンプトは [image-prompts-ready.md](./image-prompts-ready.md) にある別物なので混同しないこと。

保存先は `assets/img/article/`。保存後に `npm run img:optimize` を実行すると `public/img/article/*.webp` が作られて記事に出る。
**画像が無い間は図版ごと非表示**なので、1枚ずつ差し込んでいける。

## 一緒に渡す画像（スタイル参照）

**12枚すべてに `public/og/type-gekko.png` をスタイル参照として添付する**と、サイトの色味・余白・カードの質感が揃う。
「この画像の配色とカードの質感に合わせて」と一言添えればよい（構図は真似させない）。ビルド後なら
`public/og/` に45枚あるので、どれでもよいが結果カード系が分かりやすい。

`mbti-map.png` だけは追加で16枚のキャラ絵を渡す手がある（下のブロックに記載）。

## 密度の指定について

前回の生成が寂しくなった原因は、細い線と小さいアイコンで中央が空いたこと。今回のプロンプトには次を入れてある。

- **画面の85%を埋める**、大きな余白を作らないと明示
- 線ではなく**太い帯・太いリボン**にする
- アイコンは**円形タイルの中に大きく**置く
- 円には**白いリング + 淡いグロー**を付けて密度を上げる
- 背景に**麻の葉の地紋を4%**で敷く（サイトと同じ意匠）

## 文字の扱い

文字を入れるのは6枚だけ。残り6枚は文字ゼロで、位置・色・大小だけで構造を見せる。
生成後は**文字化けだけ確認**すればよい。崩れた枚は再生成するか、色と配置は合っているので文字なしで作り直す。

---

## assets/img/article/mbti-axes.png（1600×900・横長）

- **入る位置**: MBTI記事「4つの軸を、香水の言葉に置き換える」
- **見せたい構造**: 4つの軸が、それぞれ別の設計要素の両極を決めていること
- **画像に入れる文字**: 「E / I」「S / N」「T / F」「J / P」の4つだけ

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. Four full-width rows stacked with even spacing, each row sitting inside its own rounded white card that spans almost the entire width and stands about one fifth of the frame tall. On the left of every card, a large vermilion #E0492F pill badge holding white letters, from top to bottom: E / I, then S / N, then T / F, then J / P. To the right of each badge runs a thick horizontal band with rounded ends, roughly as tall as a fingertip, filled with a smooth gradient from a warm vermilion tint on the left to an indigo tint on the right, with five evenly spaced small dots resting on the band to show the gradation. A large icon sits inside a soft circular tile at each end of the band, each tile about three times the height of the band. Row one, left tile: a solid dot with wide concentric radiating rings that spill generously past the tile edge; right tile: a solid dot with tight compact rings hugging it. Row two, left tile: a crisp sharp-edged hexagon with a bold vermilion outline and pale fill; right tile: a soft blurred cloud in indigo tint with fuzzy edges. Row three, left tile: a pale ice-blue droplet with a frosted highlight; right tile: a glowing amber droplet. Row four, left tile: a tall perfume flacon with a heavy weighted base; right tile: a light spray puff dispersing into scattered small particles. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/mbti-accords.png（1600×900・横長）

- **入る位置**: MBTI記事「3つの軸の組み合わせで、8つの香調が決まる」
- **見せたい構造**: 3回の枝分かれで8つに行き着くこと
- **画像に入れる文字**: 「E/I」「S/N」「J/P」の3つだけ

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. A bold left-to-right branching diagram filling the whole frame. One large vermilion dot at the left edge splits into two thick curved ribbons, each of those splits again, and each of those splits once more, ending in exactly eight large filled circles evenly spaced in a single vertical column down the right edge. The ribbons are smooth rounded curves that stay generously thick and only taper slightly as they divide, drawn in a gradient from vermilion at the root to indigo at the tips. Each end circle is large and matte with a thin white ring, and a short thick connector joins each ribbon tip to its circle. The eight circles from top to bottom are #F3CF70, #DBB48C, #F7B3A2, #F8ADCC, #96CAAF, #B49F8D, #D8D0F3 and #E8B76E. Above each of the three branching stages sits one small vermilion pill badge with white letters containing only E/I, then S/N, then J/P. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/mbti-map.png（1600×900・横長）

- **入る位置**: MBTI記事「16タイプの対応をまとめると、こうなる」（この記事の目玉）
- **見せたい構造**: 16タイプが16の色に1対1で対応すること
- **画像に入れる文字**: 16個のMBTIコードのみ（4文字ずつ）
- **一緒に渡す画像**: **`assets/img/types/` の16枚を全部渡す**。「16個の円のかわりにこの16枚を4×4に並べ、それぞれの下にコードを置く」と指示すると、絵が主役になって文字の比重が下がり、崩れにくい。順番は ESTP=shinko / ESFP=yokoku / ESTJ=setto / ESFJ=shoko / ENTP=karo / ENFP=mitsugetsu / ENTJ=gekko / ENFJ=shunsho / ISTP=ugo / ISFP=nobi / ISTJ=shinkan / ISFJ=shinka / INTP=hakuji / INFP=kime / INTJ=yoiyami / INFJ=kohaku

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. A generous grid of exactly four columns and four rows, sixteen rounded white cards filling the frame with comfortable even gutters. Each card holds one large matte filled circle taking up most of the card, finished with a thin white inner ring and a soft coloured glow behind it, and directly beneath the circle a short four-letter code in a compact modern sans-serif in dark charcoal. Reading left to right, top row: a #F3CF70 circle labelled ESTP, a #FFC93C circle labelled ESFP, a #DBB48C circle labelled ESTJ, a #E0A05E circle labelled ESFJ. Second row: #F7B3A2 labelled ENTP, #FF8E72 labelled ENFP, #F8ADCC labelled ENTJ, #FF7EB3 labelled ENFJ. Third row: #96CAAF labelled ISTP, #6CCB9A labelled ISFP, #B49F8D labelled ISTJ, #B58A63 labelled ISFJ. Bottom row: #D8D0F3 labelled INTP, #B9A8F2 labelled INFP, #E8B76E labelled INTJ, #F2A93B labelled INFJ. All sixteen circles are the same size and the sixteen codes are the only text in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/mbti-distance.png（1600×900・横長）

- **入る位置**: MBTI記事「E / I ｜ 香りをどこまで届かせるか」
- **見せたい構造**: 外向は遠くまで、内向は近くだけ、という半径の差
- **画像に入れる文字**: 「E」「I」の2文字だけ

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. Two large rounded white panels side by side, each filling half the frame. In the left panel a simple indigo figure silhouette stands at the centre wrapped in a very wide translucent vermilion halo of five concentric rings that expand until they nearly touch the panel edges, with four large matte dots floating among the rings coloured #F3CF70, #F7B3A2, #F8ADCC and #DBB48C, and three smaller silhouettes standing far out near the panel edge yet still inside the outermost ring. In the right panel the same silhouette carries only a small tight halo of two rings hugging its shoulders, holding four dots coloured #96CAAF, #B49F8D, #D8D0F3 and #E8B76E, with one silhouette standing close enough to be inside the halo and two others clearly outside it. A large vermilion letter E sits in the top left corner of the left panel and a large indigo letter I in the top left corner of the right panel. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/mbti-temperature.png（1600×900・横長）

- **入る位置**: MBTI記事「T / F ｜ 温度。この記事でいちばん効いている軸」
- **見せたい構造**: 16タイプが冷たい8つと温かい8つに割れること
- **画像に入れる文字**: 「T」「F」の2文字だけ

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. One thick horizontal spectrum bar with rounded ends spanning nearly the full width and standing about a tenth of the frame tall, filled with a smooth gradient running from icy pale blue at the far left through neutral cream at the centre to deep warm amber at the far right. Sixteen large matte circles sit on and around the bar in two neat rows of eight, each circle overlapping the bar slightly and carrying a thin white ring and a soft coloured glow. The eight over the cool left half are #F3CF70, #DBB48C, #F7B3A2, #F8ADCC, #96CAAF, #B49F8D, #D8D0F3 and #E8B76E. The eight over the warm right half are #FFC93C, #E0A05E, #FF8E72, #FF7EB3, #6CCB9A, #B58A63, #B9A8F2 and #F2A93B. A thin vertical divider marks the exact centre of the bar. A large letter T sits at the far left end of the bar and a large letter F at the far right end. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/mbti-groups.png（1600×900・横長）

- **入る位置**: MBTI記事「4つのグループでざっくり見ると」
- **見せたい構造**: 分析家は全部クール、外交官は全部ウォーム、番人と探検家は混ざること
- **画像に入れる文字**: 「NT」「NF」「SJ」「SP」の4つだけ

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. Four equal rounded white panels in a single row, each filling its quarter of the frame with a tall comfortable shape. Every panel holds a two by two arrangement of four large matte circles with thin white rings, and one short label in a pill badge centred at the top of the panel. The first panel is labelled NT, sits on a cool indigo tinted wash, and holds #F7B3A2, #F8ADCC, #D8D0F3 and #E8B76E. The second is labelled NF, sits on a warm amber wash, and holds #FF8E72, #FF7EB3, #B9A8F2 and #F2A93B. The third is labelled SJ on a neutral cream wash with #DBB48C, #E0A05E, #B49F8D and #B58A63. The fourth is labelled SP on a neutral cream wash with #F3CF70, #FFC93C, #96CAAF and #6CCB9A. The pill badges on the first and third panels are vermilion, on the second and fourth indigo. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/lovetype-axes.png（1600×900・横長）

- **入る位置**: ラブタイプ記事「4つの軸を、香水の言葉に置き換える」
- **見せたい構造**: 恋愛の4つの軸が、それぞれ別の両極を決めていること
- **画像に入れる文字**: なし（文字を一切入れない）

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. Four full-width rows stacked with even spacing, each inside its own rounded white card spanning almost the entire width. Every card carries a thick horizontal band with rounded ends running across it, filled with a gradient from vermilion tint on the left to indigo tint on the right, with five evenly spaced dots along it, and a large icon inside a soft circular tile at each end. A small solid vermilion diamond marker sits at the far left of each card in place of a label. Row one: an arrow that starts first and leads on the left, an arrow that follows a step behind on the right. Row two: a sliding paper door standing wide open with warm light spilling out on the left, the same door fully closed on the right. Row three: a small bright flame on the left, a faceted clear ice crystal on the right. Row four: one long unbroken continuous line on the left, several short separate dashes on the right. Absolutely no text, letters or numbers anywhere in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/lovetype-accords.png（1600×900・横長）

- **入る位置**: ラブタイプ記事「3つの軸の組み合わせで、8つの香調が決まる」
- **見せたい構造**: 3回の枝分かれで8つに行き着くこと
- **画像に入れる文字**: なし（文字を一切入れない）

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. A bold left-to-right branching diagram filling the whole frame. One large vermilion dot at the left edge splits into two thick curved ribbons, then four, then eight, ending in exactly eight large matte filled circles evenly spaced in a single vertical column down the right edge, each with a thin white ring and a soft coloured glow. The ribbons stay generously thick and are drawn in a gradient from vermilion at the root to indigo at the tips. The eight circles from top to bottom are #F3CF70, #F8ADCC, #F7B3A2, #DBB48C, #96CAAF, #B49F8D, #D8D0F3 and #E8B76E. At each of the three branching points sits a small solid vermilion diamond marker. Absolutely no text, letters or numbers anywhere in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/lovetype-map.png（1600×900・横長）

- **入る位置**: ラブタイプ記事「対応をまとめると、こうなる」
- **見せたい構造**: 同じ組み合わせでも、熱量で左右2つに分かれること
- **画像に入れる文字**: なし（文字を一切入れない）

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. One wide rounded white card filling the frame, holding two tall columns of eight large matte circles each, sixteen circles in total, evenly spaced with comfortable gutters. The left column sits on a cool pale-blue tinted wash and the right column on a warm amber tinted wash, the two washes meeting in a soft vertical gradient down the centre where a thin divider runs. Each circle has a thin white ring and a soft coloured glow, and a faint horizontal connector links each left circle to the right circle on its row. Left column from top to bottom: #F3CF70, #F8ADCC, #F7B3A2, #DBB48C, #96CAAF, #B49F8D, #D8D0F3, #E8B76E. Right column in the same order: #FFC93C, #FF7EB3, #FF8E72, #E0A05E, #6CCB9A, #B58A63, #B9A8F2, #F2A93B. Along the far left margin of every row sit three small pictogram markers drawn in vermilion: a leading arrow or a following arrow, an open door or a closed door, one unbroken line or short dashes. Absolutely no text, letters or numbers anywhere in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/lovetype-lead.png（1600×900・横長）

- **入る位置**: ラブタイプ記事「主導性｜先に香るか、最後に残るか」
- **見せたい構造**: 立ち上がりが早い香りと、遅れて効く香りの時間差
- **画像に入れる文字**: なし（文字を一切入れない）

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. A bold two-curve chart on one wide rounded white card filling the frame. A soft horizontal baseline runs across the lower third with no ticks and no numbers. The first curve, drawn thick in vermilion #E0492F with a translucent vermilion area filled in beneath it, rises very steeply just after the left edge, peaks high and early, then falls away and fades to nothing before the right edge. The second curve, drawn thick in indigo #2D4F8A with a translucent indigo area filled in beneath it, rises slowly and steadily, peaks late in the right third, and stays high all the way to the right edge. A perfume flacon icon sits at the foot of the first curve and a soft dispersing scent trail rises from the crest of the second. The two filled areas overlap slightly in the middle in a deeper blended tone. Absolutely no text, letters or numbers anywhere in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/lovetype-distance.png（1600×900・横長）

- **入る位置**: ラブタイプ記事「公開度｜どこまで届かせるか」
- **見せたい構造**: オープンは遠くまで、プライベートは近くだけ
- **画像に入れる文字**: なし（文字を一切入れない）

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. Two large rounded white panels side by side, each filling half the frame. In the left panel a simple indigo figure silhouette stands at the centre wrapped in a very wide translucent vermilion halo of five concentric rings expanding until they nearly touch the panel edges, four large matte dots floating among the rings coloured #F3CF70, #F7B3A2, #F8ADCC and #DBB48C, and four smaller silhouettes scattered far out yet all still inside the outermost ring. In the right panel the same silhouette carries a tight halo of two rings only an arm's length wide holding four dots coloured #96CAAF, #B49F8D, #D8D0F3 and #E8B76E, with exactly one silhouette standing close enough to be inside the halo while three others stand clearly outside it. Absolutely no text, letters or numbers anywhere in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

## assets/img/article/lovetype-scenes.png（1600×900・横長）

- **入る位置**: ラブタイプ記事「場面別｜ちょうどいい量はここまで変わる」
- **見せたい構造**: 場所によって、ちょうどいい香りの範囲が段階的に変わること
- **画像に入れる文字**: なし（文字を一切入れない）

premium editorial infographic, flat vector with soft two-tone fills and gentle inner shading, confident dense composition where the artwork fills about 85 percent of the frame and no large area is left empty, rounded white cards floating on a warm off-white ground #FCFAF7, a very faint large-scale Japanese hemp-leaf asanoha geometric watermark in the background at 4 percent opacity, brand accents vermilion #E0492F and indigo #2D4F8A, soft matte perfume palette, generous thick strokes rather than hairlines, crisp geometry, no photographic texture, no 3D bevels, no harsh drop shadows. Four rounded white panels in a single row, each filling its quarter of the frame and showing one simple scene in clean flat vector with indigo silhouettes and a translucent vermilion circular halo of clearly different size. From left to right the halo grows steadily and obviously larger, roughly doubling each time. First panel: a restaurant table set for two with plates and a small vase, the halo so small it barely leaves the seated figure's shoulders. Second panel: the interior of a car seen from the side with two seats, a slightly larger halo filling the cabin. Third panel: a row of cinema seats with a seated figure, a medium halo spreading two seats wide. Fourth panel: an open night street with a street lamp and a walking figure, the largest halo spreading freely into the air. A thin vermilion baseline runs along the bottom of all four panels, rising in four visible steps from left to right to echo the growth. Absolutely no text, letters or numbers anywhere in the image. 1600x900 landscape, balanced margins, every shape large enough to read when the image is shown 400 pixels wide, no paragraphs of text, no sentences, no legend, no watermark text, no logo, no signature, no invented or garbled letterforms.

