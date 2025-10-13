import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
      {
      source: '/',
      destination: '/chat',
      permanent: false,
    }
  ]
};

export default nextConfig;
