import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 旧仕様URL(§6)は実装しないが、万一の先行実装・外部リンク対策として301を張る
  async redirects() {
    return [
      { source: '/q', destination: '/shindan', permanent: true },
      { source: '/types', destination: '/type', permanent: true },
      { source: '/r/CIT-C', destination: '/type/shinko', permanent: true },
      { source: '/r/CIT-W', destination: '/type/yokoku', permanent: true },
      { source: '/r/GRN-C', destination: '/type/ugo', permanent: true },
      { source: '/r/GRN-W', destination: '/type/nobi', permanent: true },
      { source: '/r/FLR-C', destination: '/type/gekko', permanent: true },
      { source: '/r/FLR-W', destination: '/type/shunsho', permanent: true },
      { source: '/r/FRT-C', destination: '/type/karo', permanent: true },
      { source: '/r/FRT-W', destination: '/type/mitsugetsu', permanent: true },
      { source: '/r/GRM-C', destination: '/type/setto', permanent: true },
      { source: '/r/GRM-W', destination: '/type/shoko', permanent: true },
      { source: '/r/WDY-C', destination: '/type/shinkan', permanent: true },
      { source: '/r/WDY-W', destination: '/type/shinka', permanent: true },
      { source: '/r/AMB-C', destination: '/type/yoiyami', permanent: true },
      { source: '/r/AMB-W', destination: '/type/kohaku', permanent: true },
      { source: '/r/MSK-C', destination: '/type/hakuji', permanent: true },
      { source: '/r/MSK-W', destination: '/type/kime', permanent: true },
      // www → apex は Cloudflare/Vercel 側のドメイン設定で 301（§1.1）。
    ];
  },
};

export default nextConfig;
