import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    turbo: {
      resolveAlias: {
        punycode: 'punycode/'
      }
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          }
        ]
      }
    ];
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
