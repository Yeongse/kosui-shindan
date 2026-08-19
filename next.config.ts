import type { NextConfig } from 'next';

/**
 * 静的書き出し（output: 'export'）。Cloudflare Workers の静的アセットとして配信する。
 * - サーバー機能は持たない（OG画像はビルド時に public/og へ生成、`?d=` はクライアントで解決）
 * - リダイレクトは Cloudflare 側（infra/cloudflare/_redirects と Terraform のリダイレクトルール）で行う
 */
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
