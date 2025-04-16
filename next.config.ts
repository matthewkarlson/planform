import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true
  },
  webpack: (config, { isServer }) => {
    // Replace deprecated Node.js punycode module with userland alternative
    config.resolve.alias = {
      ...config.resolve.alias,
      punycode: 'punycode/'
    };
    
    return config;
  },
};

export default nextConfig;
