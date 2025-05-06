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
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*'
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*'
      },
      {
        source: '/ingest/decide',
        destination: 'https://eu.i.posthog.com/decide'
      }
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
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
