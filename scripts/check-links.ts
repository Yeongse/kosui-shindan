/* eslint-disable no-console */
/**
 * §13.3 SEO検収 — 内部リンクグラフの検証（静的出力 out/ を対象）
 *   npm run build && npm run check:links
 *
 * 検証項目:
 *  1. sitemap に含まれる全ページが、他ページから1本以上の内部リンクを受けている（孤立ページ0）
 *  2. 全内部リンクの遷移先が実在する（リンク切れ0）
 *  3. アンカーテキストに「こちら」「詳細」等の無意味語が使われていない
 *  4. /shindan が noindex、それ以外の sitemap 対象ページが index
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const APP_DIR = path.resolve(__dirname, '../out');
const SITE = 'https://kosui-shindan.com';

if (!existsSync(APP_DIR)) {
  console.error('out/ が見つかりません。先に `npm run build` を実行してください。');
  process.exit(1);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f === '_next') continue;
      walk(p, out);
    } else if (f.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

/** out/type/gekko.html → /type/gekko */
function routeOf(file: string): string {
  const rel = path.relative(APP_DIR, file).replace(/\\/g, '/').replace(/\.html$/, '');
  if (rel === 'index') return '/';
  if (rel === '_not-found') return '/_not-found';
  return `/${rel}`;
}

const files = walk(APP_DIR);
const pages = new Map<string, string>();
for (const f of files) pages.set(routeOf(f), readFileSync(f, 'utf8'));

// sitemap.xml
const sitemapFile = path.join(APP_DIR, 'sitemap.xml');
const sitemapXml = existsSync(sitemapFile) ? readFileSync(sitemapFile, 'utf8') : '';
const sitemapUrls = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]!.replace(SITE, '') || '/');

const inbound = new Map<string, Set<string>>();
const broken: string[] = [];
const badAnchors: string[] = [];
const BAD = /^(こちら|詳細|詳しくはこちら|more|read more|click here|link)$/i;

const knownDynamic = [/^\/sitemap\.xml$/, /^\/robots\.txt$/];

for (const [route, html] of pages) {
  const re = /<a\b[^>]*\bhref="([^"#?]+)(?:\?[^"#]*)?(?:#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/g;
  for (const m of html.matchAll(re)) {
    const href = m[1]!;
    if (!href.startsWith('/')) continue; // 外部リンクは対象外
    const text = m[2]!.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (BAD.test(text)) badAnchors.push(`${route}: "${text}" -> ${href}`);
    const target = href.replace(/\/$/, '') || '/';
    if (!inbound.has(target)) inbound.set(target, new Set());
    if (target !== route) inbound.get(target)!.add(route);
    const exists = pages.has(target) || knownDynamic.some((r) => r.test(target));
    if (!exists) broken.push(`${route} -> ${href}`);
  }
}

const orphans = sitemapUrls.filter((u) => u !== '/' && (inbound.get(u)?.size ?? 0) === 0);

const robotsIssues: string[] = [];
for (const u of sitemapUrls) {
  const html = pages.get(u);
  if (!html) {
    robotsIssues.push(`${u}: HTML が見つからない`);
    continue;
  }
  if (/name="robots" content="noindex/.test(html)) robotsIssues.push(`${u}: noindex なのに sitemap に含まれる`);
}
if (sitemapUrls.includes('/shindan')) robotsIssues.push('/shindan が sitemap に含まれている');
if (!/name="robots" content="noindex/.test(pages.get('/shindan') ?? '')) robotsIssues.push('/shindan が noindex でない');

console.log(`pages: ${pages.size}, sitemap: ${sitemapUrls.length}, links checked: ${[...inbound.values()].reduce((a, s) => a + s.size, 0)}`);
console.log(`orphans: ${orphans.length}`, orphans);
console.log(`broken links: ${broken.length}`, broken.slice(0, 20));
console.log(`bad anchors: ${badAnchors.length}`, badAnchors.slice(0, 20));
console.log(`robots issues: ${robotsIssues.length}`, robotsIssues);

// 内部リンク規則（§12.1）: タイプ→ノート2本＋ガイド2本＋相性タイプ2本
const ruleIssues: string[] = [];
for (const [route, html] of pages) {
  if (!/^\/type\/[a-z]+$/.test(route)) continue;
  const notes = new Set(Array.from(html.matchAll(/href="\/notes\/([a-z]+)"/g)).map((m) => m[1]));
  const guides = new Set(Array.from(html.matchAll(/href="\/guide\/([a-z-]+)"/g)).map((m) => m[1]));
  const types = new Set(Array.from(html.matchAll(/href="\/type\/([a-z]+)"/g)).map((m) => m[1]).filter((s) => `/type/${s}` !== route));
  if (notes.size < 2) ruleIssues.push(`${route}: notes links ${notes.size} < 2`);
  if (guides.size < 2) ruleIssues.push(`${route}: guide links ${guides.size} < 2`);
  if (types.size < 2) ruleIssues.push(`${route}: type links ${types.size} < 2`);
}
for (const [route, html] of pages) {
  if (!/^\/notes\/[a-z]+$/.test(route)) continue;
  const types = new Set(Array.from(html.matchAll(/href="\/type\/([a-z]+)"/g)).map((m) => m[1]));
  if (types.size < 2) ruleIssues.push(`${route}: type links ${types.size} < 2`);
  if (!html.includes('href="/shindan"')) ruleIssues.push(`${route}: 診断CTAなし`);
}
for (const [route, html] of pages) {
  if (!/^\/guide\/[a-z-]+$/.test(route)) continue;
  if (!/href="\/notes\/[a-z]+"/.test(html)) ruleIssues.push(`${route}: 関連ノートなし`);
  if (!html.includes('href="/shindan"')) ruleIssues.push(`${route}: 診断CTAなし`);
}
for (const [route, html] of pages) {
  if (!/^\/personality\/[a-z-]+$/.test(route)) continue;
  if (!/href="\/notes\/[a-z]+"/.test(html)) ruleIssues.push(`${route}: 関連ノートなし`);
  if (!/href="\/guide\/[a-z-]+"/.test(html)) ruleIssues.push(`${route}: 関連ガイドなし`);
  if (!html.includes('href="/shindan"')) ruleIssues.push(`${route}: 診断CTAなし`);
}
for (const [route, html] of pages) {
  if (!/^\/mbti\/[a-z]+$/.test(route)) continue;
  if (!/href="\/type\/[a-z]+"/.test(html)) ruleIssues.push(`${route}: タイプ解説へのリンクなし`);
  if (!/href="\/mbti\/[a-z]+"/.test(html)) ruleIssues.push(`${route}: 近いMBTIへのリンクなし`);
  if (!html.includes('href="/shindan"')) ruleIssues.push(`${route}: 診断CTAなし`);
}
console.log(`internal link rule issues: ${ruleIssues.length}`, ruleIssues);

const failed = orphans.length + broken.length + badAnchors.length + robotsIssues.length + ruleIssues.length;
if (failed > 0) {
  console.error(`\nNG: ${failed} issue(s)`);
  process.exit(1);
}
console.log('\nOK: 孤立ページ0・リンク切れ0・アンカーテキストOK・robots OK・内部リンク規則OK');
