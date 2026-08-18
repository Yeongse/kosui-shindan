import { NextResponse, type NextRequest } from 'next/server';

/**
 * §8.4 / §12.2 — `/type/[slug]?d=HEX16` を `/type/[slug]/d/HEX16` に内部リライトする。
 * これにより /type/[slug] 本体は SSG のまま、個人スコア付きページだけを動的描画できる。
 * URL バーの表示は `?d=` のまま（リライトはユーザーに見えない）。
 *
 * また `/type/[slug]/d/[digest]` への直接アクセスは、正規URL `/type/[slug]?d=` に 301 する。
 */
const TYPE_PATH = /^\/type\/([a-z]+)\/?$/;
const TYPE_D_PATH = /^\/type\/([a-z]+)\/d\/([0-9a-fA-F]{16})\/?$/;
const HEX16 = /^[0-9a-fA-F]{16}$/;

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const direct = pathname.match(TYPE_D_PATH);
  if (direct) {
    const url = req.nextUrl.clone();
    url.pathname = `/type/${direct[1]}`;
    url.search = `?d=${direct[2]!.toLowerCase()}`;
    return NextResponse.redirect(url, 301);
  }

  const m = pathname.match(TYPE_PATH);
  if (m) {
    const d = searchParams.get('d');
    if (d && HEX16.test(d)) {
      const url = req.nextUrl.clone();
      url.pathname = `/type/${m[1]}/d/${d.toLowerCase()}`;
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/type/:path*'],
};
