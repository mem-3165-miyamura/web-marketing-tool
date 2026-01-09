import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcrypt', 'duckdb'],
  // Next.js 15+ では experimental.instrumentationHook は不要（または非推奨）
  experimental: {
    // 他のオプションがあれば残す
  },
};

export default nextConfig;