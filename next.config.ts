import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/tasks',
        destination: '/tugas',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
