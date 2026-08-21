import type { Question } from './schema';

/**
 * §4 設問仕様（全12問・確定コピー・重み表）
 * コピー文字列と重みを含む唯一の場所。変更時は §13.1 の分布テストを必ず再実行すること。
 *
 * ── 逸脱記録（§13.1 の指示に基づく重み調整）──
 * §4 の初期重みでは一様ランダム10万試行の分布が FRT-C 0.00% / GRM-C 0.09% / GRN-W 1.6% / AMB-W 22.0% となり
 * 受け入れ基準（全タイプ 2〜22%）を満たさなかった。原因は (1) 温度合計が +12 で warm に 69% 偏る
 * (2) FRT/GRM に cool 側、GRN に warm 側の配点が存在しない (3) AMB の総配点が突出（31）の3点。
 * 設問・選択肢の文言は一切変更せず、以下の方針で重みのみ調整した（コピーの意味と矛盾しない範囲）:
 *   - 温度: 極端値を ±1 縮め、意味的に中立な選択肢を TEMP 0 に（例: 白いシャツ、ストレッチ、写真）
 *   - 香調: 「傘を選ぶのは少し楽しい」に GRM、「夏。全部が濃くて速い」を FRT 主体、「花屋か公園」「春」に GRN+2、
 *           「深呼吸」に GRN+2、「験担ぎ」を WDY 主体、「冬」の AMB を GRM へ、など総配点を 22〜27 に均した
 * 調整後（第1段階）: 一様ランダムで全16タイプ 2.9%〜11.4%、warm 51%。
 *
 * ── 第2段階: 人間の選択の偏りを考慮したキャリブレーション ──
 * 実際の回答者は選択肢が偏り（「冷たいシーツ」「白いシャツ」「映画」「間接照明」等が人気）、回答に一貫性がある。
 * src/data/human-prior.ts の事前分布 + 潜在特性モデルで試算すると MSK-C / AMB-W が 13% に太り、
 * FLR-C 2.5% / GRM-C 1.7% に痩せたため、人気選択肢の配点を分散させた:
 *   - 「白いシャツ」MSK3→MSK2 CIT2、「フロアランプ」AMB3→AMB2 WDY2、「冬」を GRM 主体、「花屋か公園」を FLR 主体に戻す
 *   - 「聞き上手」「深呼吸」「昼の自然光」「メモの束」「熱いシャワー」に warm+1（GRN-W / MSK-W の受け皿）、
 *     「甘いもの」「元気になるタイプ」「ワンピース」に cool-1（GRM-C / FRT-C / FLR-C の受け皿）
 * 調整後: 一様ランダム 3.3%〜9.4%（warm 49%）、人間モデル 3.5%〜9.4%（warm 51%）。
 *
 * ── 第3段階: 設問文の平易化（回答しやすさの改善）──
 * Q3 / Q9 / Q10 / Q12 が抽象的な仮定（「雨の日は正直にいえば」「言葉を使えないなら」「季節がひとつ消えるとしたら」
 * 「香りをまとう理由」）で回答しづらいという指摘を受け、意味を保ったまま日常的な問いに書き換えた
 * （雨の休日の過ごし方 / 気持ちの伝え方 / 好きな季節 / 香水をつけたくなる場面）。**選択肢の重みは据え置き**。
 * 選択肢の中身が変わったぶん human-prior.ts の選ばれやすさを実態に合わせて更新したところ（雨の日に外出する人は減り、
 * 夏を選ぶ人は春秋より少ない）、FRT の主要な受け皿が痩せて人間モデルで FRT-C 2.6% となったため、
 * 意味と矛盾しない範囲で温度のみ2箇所調整した: Q2B「市場。土地の果物」temp 0→-1、Q8D「誰かと少し喋って」temp 0→-1。
 * 調整後: 一様ランダム 2.9%〜9.4%（warm 43%）、人間モデル 3.8%〜10.3%（warm 49%）。
 * いずれも scripts/analyze-distribution.ts と src/lib/scoring.test.ts で担保する。
 */
export const QUESTIONS: readonly Question[] = [
  {
    no: 1,
    text: '朝、目が覚めて最初に欲しいのは。',
    options: [
      {
        key: 'A',
        label: '窓を開けたときの、まだ誰も吸っていない空気',
        weight: { accords: { GRN: 3, CIT: 1 }, temp: -2, int: 0 },
      },
      {
        key: 'B',
        label: '淹れたてのコーヒーと、焼けていくパンの匂い',
        weight: { accords: { GRM: 3, WDY: 1 }, temp: 1, int: 2 },
      },
      {
        key: 'C',
        label: '熱いシャワーと、洗いたてのタオル',
        weight: { accords: { MSK: 3, CIT: 1 }, temp: 1, int: 0 },
      },
      {
        key: 'D',
        label: '二度寝。毛布の中の自分の体温',
        weight: { accords: { AMB: 1, FRT: 2, MSK: 1 }, temp: 2, int: 2 },
      },
    ],
  },
  {
    no: 2,
    text: '知らない街に着いた。最初に足が向くのは。',
    options: [
      {
        key: 'A',
        label: 'いちばん高い場所。街全体を見わたしたい',
        weight: { accords: { CIT: 3, WDY: 1 }, temp: 1, int: 1 },
      },
      {
        key: 'B',
        label: '市場。土地の果物と人の声のほうへ',
        weight: { accords: { FRT: 3, GRM: 1 }, temp: -1, int: 1 },
      },
      {
        key: 'C',
        label: '古い教会か、博物館。静かで冷たい石の建物',
        weight: { accords: { WDY: 2, AMB: 2 }, temp: -2, int: 2 },
      },
      {
        key: 'D',
        label: '花屋か公園。その街の植物を見ておきたい',
        weight: { accords: { FLR: 3, GRN: 1 }, temp: 0, int: 1 },
      },
    ],
  },
  {
    no: 3,
    text: '雨の休日。どう過ごすのが好き。',
    options: [
      {
        key: 'A',
        label: '窓を少し開けて、静かに過ごす',
        weight: { accords: { GRN: 3, MSK: 1 }, temp: -2, int: 1 },
      },
      {
        key: 'B',
        label: '気にせず出かける。予定は変えたくない',
        weight: { accords: { CIT: 2, FRT: 2 }, temp: 0, int: 0 },
      },
      {
        key: 'C',
        label: 'おやつを買い込んで、家でゆっくり',
        weight: { accords: { GRM: 3, AMB: 1 }, temp: 0, int: 2 },
      },
      {
        key: 'D',
        label: '好きな入浴剤で、長めにお風呂に入る',
        weight: { accords: { FLR: 1, GRM: 2, MSK: 1 }, temp: 0, int: 0 },
      },
    ],
  },
  {
    no: 4,
    text: '友人があなたを紹介するとき、たぶんこう言う。',
    options: [
      {
        key: 'A',
        label: '「一緒にいると元気になるタイプ」',
        weight: { accords: { CIT: 2, FRT: 2 }, temp: -1, int: 0 },
      },
      {
        key: 'B',
        label: '「聞き上手。気づいたら全部話してる」',
        weight: { accords: { MSK: 2, FLR: 1, GRN: 1 }, temp: 1, int: 0 },
      },
      {
        key: 'C',
        label: '「ブレない。軸がある人」',
        weight: { accords: { WDY: 3, AMB: 1 }, temp: 0, int: 2 },
      },
      {
        key: 'D',
        label: '「読めない。でもそこがいい」',
        weight: { accords: { AMB: 3, FLR: 1 }, temp: 0, int: 2 },
      },
    ],
  },
  {
    no: 5,
    text: '手ざわりで一番好きなのは。',
    options: [
      {
        key: 'A',
        label: '冷たいシーツに足を入れる瞬間',
        weight: { accords: { MSK: 3, CIT: 1 }, temp: -2, int: 0 },
      },
      {
        key: 'B',
        label: '陽に当たった猫の背中',
        weight: { accords: { FRT: 2, GRM: 2 }, temp: 2, int: 1 },
      },
      {
        key: 'C',
        label: '古い木の家具の、角の丸くなったところ',
        weight: { accords: { WDY: 3, AMB: 1 }, temp: 0, int: 2 },
      },
      {
        key: 'D',
        label: '花びらの、破れそうで破れない厚み',
        weight: { accords: { FLR: 3, GRN: 1 }, temp: 0, int: 1 },
      },
    ],
  },
  {
    no: 6,
    text: '深夜1時。まだ起きているとしたら、何をしている。',
    options: [
      {
        key: 'A',
        label: '明日の準備を終えて、ストレッチをしている',
        weight: { accords: { CIT: 2, MSK: 2 }, temp: 0, int: 0 },
      },
      {
        key: 'B',
        label: '甘いものを開封している。夜は自由なので',
        weight: { accords: { GRM: 3, FRT: 1 }, temp: -1, int: 2 },
      },
      {
        key: 'C',
        label: '一本の映画か長い文章に沈んでいる',
        weight: { accords: { AMB: 3, WDY: 1 }, temp: 0, int: 3 },
      },
      {
        key: 'D',
        label: 'ベランダか窓辺で、外の空気を吸っている',
        weight: { accords: { GRN: 3, CIT: 1 }, temp: -1, int: 1 },
      },
    ],
  },
  {
    no: 7,
    text: '「あなたの部屋っぽい」と言われそうな照明は。',
    options: [
      {
        key: 'A',
        label: '白くて明るい。影ができない光',
        weight: { accords: { CIT: 2, MSK: 2 }, temp: -2, int: 0 },
      },
      {
        key: 'B',
        label: '電球色のフロアランプがひとつだけ',
        weight: { accords: { AMB: 2, WDY: 2 }, temp: 2, int: 2 },
      },
      {
        key: 'C',
        label: '間接照明とキャンドル。光は低いほどいい',
        weight: { accords: { AMB: 2, GRM: 1, FLR: 1 }, temp: 1, int: 3 },
      },
      {
        key: 'D',
        label: '昼の自然光がいちばん好き。夜は早めに消す',
        weight: { accords: { GRN: 2, FLR: 1, CIT: 1 }, temp: 1, int: 0 },
      },
    ],
  },
  {
    no: 8,
    text: '大事な場面の直前、あなたがするのは。',
    options: [
      {
        key: 'A',
        label: '深呼吸をひとつ。あとは勢い',
        weight: { accords: { CIT: 2, GRN: 2 }, temp: 1, int: 0 },
      },
      {
        key: 'B',
        label: '手順を最後にもう一度だけ確認する',
        weight: { accords: { WDY: 3, MSK: 1 }, temp: -1, int: 1 },
      },
      {
        key: 'C',
        label: '験担ぎ。決めた小物、決めた手順',
        weight: { accords: { WDY: 2, AMB: 1, FLR: 1 }, temp: 0, int: 2 },
      },
      {
        key: 'D',
        label: '誰かと少し喋って、緊張を薄める',
        weight: { accords: { FRT: 3, GRM: 1, FLR: 1 }, temp: -1, int: 0 },
      },
    ],
  },
  {
    no: 9,
    text: '大切な人に気持ちを伝えるとき、あなたに近いのは。',
    options: [
      {
        key: 'A',
        label: '写真を撮って送る',
        weight: { accords: { CIT: 2, FLR: 1, GRN: 1 }, temp: 0, int: 1 },
      },
      {
        key: 'B',
        label: 'お菓子や料理をつくる',
        weight: { accords: { GRM: 3, GRN: 1 }, temp: 0, int: 2 },
      },
      {
        key: 'C',
        label: '短いメッセージを書く',
        weight: { accords: { MSK: 2, GRN: 1, WDY: 1 }, temp: 1, int: 1 },
      },
      {
        key: 'D',
        label: '好きな音楽をすすめる',
        weight: { accords: { AMB: 2, FLR: 2 }, temp: 0, int: 2 },
      },
    ],
  },
  {
    no: 10,
    text: 'いちばん好きな季節は。',
    options: [
      {
        key: 'A',
        label: '春。花が咲いて、空気がやわらかい',
        weight: { accords: { FLR: 2, GRN: 2 }, temp: 1, int: 0 },
      },
      {
        key: 'B',
        label: '夏。光が強くて、開放的になる',
        weight: { accords: { CIT: 1, FRT: 3 }, temp: -1, int: 1 },
      },
      {
        key: 'C',
        label: '秋。少しずつ深くなっていく感じ',
        weight: { accords: { WDY: 2, AMB: 2 }, temp: 0, int: 2 },
      },
      {
        key: 'D',
        label: '冬。空気が澄んで、部屋が暖かい',
        weight: { accords: { GRM: 3, MSK: 1 }, temp: -1, int: 1 },
      },
    ],
  },
  {
    no: 11,
    text: '「似合う」と言われて一番うれしいのは。',
    options: [
      {
        key: 'A',
        label: '白いシャツ',
        weight: { accords: { MSK: 2, CIT: 2 }, temp: 0, int: 0 },
      },
      {
        key: 'B',
        label: '少しいい時計、または一生ものの革',
        weight: { accords: { WDY: 3, AMB: 1 }, temp: 1, int: 2 },
      },
      {
        key: 'C',
        label: '柔らかい色のニット',
        weight: { accords: { FRT: 2, GRM: 2 }, temp: 1, int: 1 },
      },
      {
        key: 'D',
        label: '一枚で成立するワンピース／セットアップ',
        weight: { accords: { FLR: 3, AMB: 1 }, temp: -1, int: 2 },
      },
    ],
  },
  {
    no: 12,
    text: '最後の質問。香水をつけたくなるのは、どんなとき。',
    options: [
      {
        key: 'A',
        label: '出かける前に、気持ちを切り替えたいとき',
        weight: { accords: { CIT: 2, GRN: 2 }, temp: 0, int: 0 },
      },
      {
        key: 'B',
        label: '人と近くで話す日。さりげなく香るくらいがいい',
        weight: { accords: { MSK: 2, FRT: 2 }, temp: 0, int: 0 },
      },
      {
        key: 'C',
        label: '特別な日。印象に残したいとき',
        weight: { accords: { AMB: 3, WDY: 1 }, temp: 1, int: 3 },
      },
      {
        key: 'D',
        label: '家でひとりのとき。自分が心地よければいい',
        weight: { accords: { FLR: 2, GRM: 1, WDY: 1 }, temp: 0, int: 2 },
      },
    ],
  },
];

export const QUESTION_COUNT = QUESTIONS.length;
