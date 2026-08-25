/* eslint-disable no-console */
/**
 * §12.6 — おすすめ香水3本の商品画像・商品ページURLを楽天市場から取得する。
 *
 *   npm run fetch:media
 *   npm run fetch:media -- --only=ジャドール    # 一部だけ引き直す
 *
 * 使うのは楽天ウェブサービスの商品検索API（IchibaItem/Search）。
 * アフィリエイターが商品画像とアフィリエイトリンクを掲載することを前提にしたAPIなので、
 * ここで得た `mediumImageUrls` の画像を自サイトから参照してよい（画像は楽天のCDNから直接配信させ、
 * 自前で再配布はしない）。同時に `affiliateUrl`（商品ページへのアフィリエイトリンク）も取れるため、
 * 取得後は検索リンクではなく商品ページへの直リンクに切り替わる。
 *
 * 取得結果は src/data/product-media.json に書き出してコミットする。ビルド時にAPIは叩かない
 * （静的書き出しのビルドを外部サービスに依存させないため）。
 *
 * 認証情報（.env.local）:
 *   RAKUTEN_APP_ID     … アプリID          https://webservice.rakuten.co.jp/app/create で発行
 *   RAKUTEN_ACCESS_KEY … アクセスキー      同上。2026年のインフラ刷新で必須になった
 *   NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID … アフィリエイトID（任意。入れると affiliateUrl が返る）
 *   NEXT_PUBLIC_SITE_URL … アプリ登録の Allowed websites に合わせて Referer/Origin として送る
 *
 * 2026-05-14 に旧ホスト app.rakuten.co.jp のAPIは停止済み。現行は openapi.rakuten.co.jp。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PICKS_BY_TYPE } from '../src/data/picks';
import type { ProductPick } from '../src/data/schema';

const ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
const OUT = path.resolve(__dirname, '../src/data/product-media.json');

/** おすすめ枠の価格上限（§12.6）。これを超える出品は強く減点される */
const BUDGET_MAX = 8000;

/** .env.local を読む（Nextのビルド外から実行するため自前で拾う） */
function loadEnvLocal(): void {
  try {
    const text = readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    for (const line of text.split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '');
    }
  } catch {
    /* 無ければ環境変数のみ */
  }
}
loadEnvLocal();

const APP_ID = process.env.RAKUTEN_APP_ID ?? '';
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY ?? '';
const AFFILIATE_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? '';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kosui-shindan.com').replace(/\/$/, '');

if (!APP_ID || !ACCESS_KEY) {
  const missing = [!APP_ID && 'RAKUTEN_APP_ID', !ACCESS_KEY && 'RAKUTEN_ACCESS_KEY'].filter(Boolean).join(' / ');
  console.error(
    [
      `${missing} が未設定です。`,
      '  1. https://webservice.rakuten.co.jp/app/create で楽天IDでログインしてアプリを登録する',
      '     - アプリタイプ: Web Application',
      '     - API Access Scope: Rakuten Ichiba API にチェック',
      '     - Expected QPS: 5',
      '  2. 発行された アプリID と アクセスキー を .env.local に追記する',
      '       RAKUTEN_APP_ID=...',
      '       RAKUTEN_ACCESS_KEY=...',
      '  3. npm run fetch:media を再実行する',
      '',
      '未取得のあいだ商品画像は表示されず、リンクは商品名の完全一致検索にフォールバックします。',
    ].join('\n'),
  );
  process.exit(1);
}

export interface ProductMedia {
  /** 楽天CDNの商品画像URL（正方形） */
  image: string;
  /** 商品ページへのアフィリエイトリンク。アフィリエイトID未設定なら素の商品URL */
  affiliateUrl: string;
  /** 素の商品ページURL（記録用） */
  itemUrl: string;
  /** 実際にヒットした商品名。取り違えの検品用に残す */
  itemName: string;
  shopName: string;
  price: number;
  fetchedAt: string;
}

interface RakutenItem {
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  affiliateUrl?: string;
  shopName: string;
  reviewCount: number;
  mediumImageUrls?: { imageUrl: string }[];
}

/** 全角・記号・大小文字の揺れを吸収して比較用に潰す */
function normalize(s: string): string {
  return s
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/[\s・･,、.。/／|｜()（）[\]【】＆&＋+'"’”\-ー―–—_]/g, '');
}

/** 香水本体ではないもの（詰め替え・小分け・空瓶・テスター・中古） */
const NOT_A_BOTTLE =
  /(アトマイザー|お試し|量り売り|小分け|サンプル|ミニ香水|空き瓶|空瓶|中古|訳あり|香水瓶のみ|ボトルのみ|テスター|テスタータイプ|使いかけ|残量|詰め替え|詰替|リフィル|ツィスト|ツイスト|名入れ|刻印|アウトレット|訳アリ|訳あり|わけあり|B級)/;

/** 同じ香りで展開されている香水以外のライン。画像も中身も別物なので落とす。 */
const NOT_A_FRAGRANCE =
  /(ボディ\s*(ローション|クリーム|ミルク|オイル|ソープ|ジェル|パウダー)|シャワー\s*ジェル|ソープ|石鹸|石けん|キャンドル|ヘア\s*(ミスト|オイル|フレグランス)|ハンド\s*(クリーム|ソープ)|ルーム\s*(スプレー|フレグランス)|バス\s*オイル|デオドラント|アフターシェーブ|シャンプー|リップ|ディフューザー|練り香水)/;

/** 香水であることの積極的な裏づけ（賦香濃度の表記） */
const IS_FRAGRANCE =
  /(EDP|EDT|EDC|オード?ゥ?\s*パルファ|オード?ゥ?\s*トワレ|オーデ?\s*コロン|コロン|パルファム|パルファン|香水)/i;

/**
 * 1つの出品に複数の香りが同居している「選べる香り」型の出品。
 * 商品ページとしては目的の香りを指さないうえ、画像も別の香りのことが多いので落とす。
 * 「選べるサイズ」だけ（同一の香りの容量違い）は正当なので、香り違いの語だけを見る。
 */
const MULTI_SCENT = /(選べる[^】]*香り|各種|など|他\s*】|「.*」より選択)/;

/** 商品名から容量(ml)を全て拾う */
function volumesMl(name: string): number[] {
  return Array.from(name.matchAll(/(\d+(?:\.\d+)?)\s*m[lL]/g)).map((m) => Number(m[1]));
}

/** 正規取扱・公式店を優先するための加点 */
function shopBonus(item: RakutenItem): number {
  const t = `${item.shopName} ${item.itemName}`;
  let n = 0;
  if (/公式/.test(t)) n += 8;
  if (/国内正規|正規品|正規取扱/.test(t)) n += 5;
  return n;
}

/** 販促の飾り（【…】★…★）を落として、商品名の本体だけにする */
function stripPromo(name: string): string {
  return name
    .replace(/【[^】]*】/g, ' ')
    .replace(/★[^★]*★/g, ' ')
    .replace(/●[^●]*●/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 画像URLの _ex パラメータを引き上げる（既定は128x128で小さすぎる） */
function upscale(url: string, size = 400): string {
  return url.replace(/_ex=\d+x\d+/, `_ex=${size}x${size}`);
}

/**
 * 検索結果から「この商品」を選ぶ。
 *
 * 落とすもの: 画像なし / 香水本体でない出品 / 複数の香りが同居する出品 /
 *             最大容量が 25ml 未満（小分け・サンプル）/ pick.exclude に当たる別ライン。
 * 選ぶ基準: 商品名のトークンが全て含まれ、かつ商品名の「前のほう」に出てくること。
 *           同点なら 公式・正規品 > レビュー件数 > 安い順。
 */
function pickBest(pick: ProductPick, items: RakutenItem[]): RakutenItem | undefined {
  const brandTokens = pick.brandJa.split(/\s+/).filter(Boolean).map(normalize);
  const nameTokens = pick.name.split(/\s+/).filter(Boolean).map(normalize);
  const excludes = (pick.exclude ?? []).map(normalize).filter(Boolean);
  let best: { item: RakutenItem; score: number } | undefined;

  for (const item of items) {
    if (!item.mediumImageUrls?.length) continue;
    if (NOT_A_BOTTLE.test(item.itemName)) continue;
    if (NOT_A_FRAGRANCE.test(item.itemName)) continue;
    if (MULTI_SCENT.test(item.itemName)) continue;
    if (!IS_FRAGRANCE.test(item.itemName)) continue;

    // 10ml のトラベルサイズなど正規の小容量は残したいので下限は 9ml。
    // 小分け・サンプルは NOT_A_BOTTLE と価格下限（2500円）で落とす。
    const vols = volumesMl(item.itemName);
    const maxVol = vols.length ? Math.max(...vols) : 0;
    if (vols.length && maxVol < 9) continue;
    if (item.itemPrice < 2500) continue;
    // ml が無くて g だけのものは固形（ソープ・練り香水）
    if (!vols.length && /\d+\s*g\b/.test(item.itemName)) continue;

    const body = stripPromo(item.itemName);
    const hay = normalize(body);

    // 同ブランドの別ライン（コロニア プーラ、ザ・ワン フォーメン 等）を弾く
    if (excludes.some((x) => hay.includes(x))) continue;

    // 商品名のトークンは全て含まれていること
    if (!nameTokens.every((t) => hay.includes(t))) continue;

    // 目的の商品が名前の前のほうに出ていること。
    // 複数商品を並べた出品では目的の名前が後ろに追いやられるので、それを位置で弾く。
    const firstAt = Math.min(...nameTokens.map((t) => hay.indexOf(t)));
    if (firstAt > 45) continue;

    const brandHits = brandTokens.filter((t) => hay.includes(t)).length;
    const score =
      brandHits * 10 +
      shopBonus(item) +
      Math.max(0, 10 - firstAt / 5) +
      Math.min(item.reviewCount, 50) / 25 +
      // 容量は 50ml で頭打ちの弱い加点。ミニは避けたいが、大容量を選ぶ理由にはしない
      Math.min(maxVol, 50) / 25 -
      // 予算上限(8,000円)を超えたぶんを強く減点する。
      // 「安い30ml」が「高い100ml」に必ず勝つように、容量加点より重みを大きく取る。
      Math.max(0, item.itemPrice - BUDGET_MAX) / 400;
    if (!best || score > best.score) best = { item, score };
  }
  return best?.item;
}

async function search(keyword: string): Promise<RakutenItem[]> {
  const u = new URL(ENDPOINT);
  u.searchParams.set('format', 'json');
  u.searchParams.set('applicationId', APP_ID);
  u.searchParams.set('accessKey', ACCESS_KEY);
  if (AFFILIATE_ID) u.searchParams.set('affiliateId', AFFILIATE_ID);
  u.searchParams.set('keyword', keyword);
  u.searchParams.set('hits', '30');
  u.searchParams.set('imageFlag', '1');
  u.searchParams.set('sort', 'standard');
  u.searchParams.set('minPrice', '2500'); // 小分け・サンプルを最初から除く

  // アプリ登録の Allowed websites は Referer/Origin で判定される。ブラウザと違い Node の fetch は
  // これらを明示的に送れるので、登録したサイトURLをそのまま名乗る（実際にこのサイトのためのデータ取得）。
  const res = await fetch(u, {
    headers: {
      'User-Agent': 'kosui-shindan/1.0',
      Referer: `${SITE_URL}/`,
      Origin: SITE_URL,
    },
  });
  const json = (await res.json().catch(() => null)) as
    | { Items?: ({ Item: RakutenItem } | RakutenItem)[]; errors?: { errorCode: number; errorMessage: string } }
    | null;
  // 認証・レート超過は JSON の errors に入り、HTTPステータスと一致しないことがある
  if (json?.errors) throw new Error(`${json.errors.errorCode}: ${json.errors.errorMessage}`);
  if (!res.ok || !json) throw new Error(`${res.status} ${res.statusText}`);
  // formatVersion 未指定なら [{ Item: {...} }]、2 なら [{...}]。どちらでも読めるようにする
  return (json.Items ?? []).map((w) => ('Item' in w ? w.Item : w));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
  const picks = Object.values(PICKS_BY_TYPE)
    .flat()
    .filter((p) => !only || p.query.includes(only) || p.name.includes(only));

  const existing: Record<string, ProductMedia> = JSON.parse(readFileSync(OUT, 'utf8'));
  const now = new Date().toISOString().slice(0, 10);
  const missed: string[] = [];

  for (const p of picks) {
    try {
      // ブランド + 商品名 で引き、駄目なら商品名だけで引き直す
      let item = pickBest(p, await search(p.query));
      if (!item) {
        await sleep(1100);
        item = pickBest(p, await search(`${p.brandJa} ${p.name}`));
      }
      if (!item) {
        missed.push(`${p.brandJa} ${p.name}`);
        console.log(`  miss  ${p.brandJa} ${p.name}`);
      } else {
        existing[p.query] = {
          image: upscale(item.mediumImageUrls![0]!.imageUrl),
          affiliateUrl: item.affiliateUrl || item.itemUrl,
          itemUrl: item.itemUrl,
          itemName: item.itemName,
          shopName: item.shopName,
          price: item.itemPrice,
          fetchedAt: now,
        };
        console.log(`  ok    ${p.brandJa} ${p.name}  ->  ${item.itemName.slice(0, 44)}`);
      }
    } catch (e) {
      missed.push(`${p.brandJa} ${p.name} (${String(e)})`);
      console.error(`  err   ${p.brandJa} ${p.name}: ${String(e)}`);
    }
    await sleep(1100); // 楽天ウェブサービスの目安レート（1req/秒）を下回らないよう待つ
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');

  console.log(`\n書き出し: ${path.relative(process.cwd(), OUT)}（${Object.keys(sorted).length}件）`);
  if (missed.length) {
    console.log(`未取得 ${missed.length}件:`);
    for (const m of missed) console.log(`  - ${m}`);
    console.log('検索語が合っていない可能性があります。picks.ts の query を調整して --only= で引き直してください。');
  }
})();
