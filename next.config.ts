import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increase limit (e.g., 10MB)
    },
  },
};

export default nextConfig;
