/* eslint-disable no-console */
/**
 * 静的出力（out/）を Cloudflare Workers の静的アセットと同じ挙動でローカル配信する。
 *   npm run serve            … PORT=3199 で起動
 * 目的: 本番（Cloudflare）と同じ URL 解決を手元でも再現し、E2E をこの上で回す。
 *
 * 再現する挙動:
 * - html_handling = "drop-trailing-slash": /type/gekko → out/type/gekko.html、/type/gekko/ は /type/gekko へ 301
 * - not_found_handling = "404-page": 未一致は out/404.html を 404 で返す
 * - infra/cloudflare/_redirects の 301 リダイレクト
 * - infra/cloudflare/_headers の共通ヘッダ（先頭の /* ブロックのみ簡易適用）
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const ROOT = path.resolve('out');
const PORT = Number(process.env.PORT ?? 3199);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function loadRedirects(): Map<string, { to: string; code: number }> {
  const m = new Map<string, { to: string; code: number }>();
  const f = path.resolve('infra/cloudflare/_redirects');
  if (!existsSync(f)) return m;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, code] = t.split(/\s+/);
    if (from && to) m.set(from, { to, code: Number(code ?? 301) });
  }
  return m;
}

function commonHeaders(): Record<string, string> {
  const f = path.resolve('infra/cloudflare/_headers');
  const out: Record<string, string> = {};
  if (!existsSync(f)) return out;
  let inGlobal = false;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (/^\/\*\s*$/.test(line.trim())) {
      inGlobal = true;
      continue;
    }
    if (/^\//.test(line.trim())) {
      inGlobal = false;
      continue;
    }
    if (inGlobal && line.includes(':')) {
      const i = line.indexOf(':');
      out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return out;
}

const REDIRECTS = loadRedirects();
const HEADERS = commonHeaders();

function send(res: http.ServerResponse, status: number, file: string) {
  const ext = path.extname(file);
  res.writeHead(status, { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', ...HEADERS });
  createReadStream(file).pipe(res);
}

function isFile(p: string) {
  return existsSync(p) && statSync(p).isFile();
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  const redirect = REDIRECTS.get(pathname);
  if (redirect) {
    res.writeHead(redirect.code, { Location: redirect.to + url.search });
    return res.end();
  }

  // drop-trailing-slash（ルート以外）
  if (pathname.length > 1 && pathname.endsWith('/')) {
    res.writeHead(301, { Location: pathname.slice(0, -1) + url.search });
    return res.end();
  }

  const rel = pathname === '/' ? '/index.html' : pathname;
  const direct = path.join(ROOT, rel);
  if (isFile(direct)) return send(res, 200, direct);
  if (!path.extname(rel)) {
    const asHtml = path.join(ROOT, `${rel}.html`);
    if (isFile(asHtml)) return send(res, 200, asHtml);
    const asIndex = path.join(ROOT, rel, 'index.html');
    if (isFile(asIndex)) return send(res, 200, asIndex);
  }
  const notFound = path.join(ROOT, '404.html');
  if (isFile(notFound)) return send(res, 404, notFound);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404');
});

server.listen(PORT, () => console.log(`serving out/ on http://localhost:${PORT}`));
