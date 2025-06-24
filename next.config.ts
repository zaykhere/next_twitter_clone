import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [new URL('https://img.clerk.com/**'), new URL('https://ik.imagekit.io/**')],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
