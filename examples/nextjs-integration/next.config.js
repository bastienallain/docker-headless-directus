/** @type {import('next').NextConfig} */

// 🎯 Directus Headless CMS Integration for Next.js
// Optimized for our Dragonfly-powered Directus stack

const nextConfig = {
  // Image optimization for Directus assets
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8057', // Headless API port
        pathname: '/assets/**'
      },
      // Add your production domain
      {
        protocol: 'https',
        hostname: 'your-directus-domain.com',
        pathname: '/assets/**'
      }
    ],
    // Optimize image loading
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Image formats supported by our Sharp setup
    formats: ['image/webp', 'image/avif'],
    // Cache optimizations (matches our 365d asset cache)
    minimumCacheTTL: 31536000, // 1 year
    // Device sizes for responsive images
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Environment variables
  env: {
    DIRECTUS_URL: process.env.DIRECTUS_URL || 'http://localhost:8057',
    DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN || '',
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8057'
  },

  // Rewrites for API proxying (optional)
  async rewrites() {
    return [
      {
        source: '/api/directus/:path*',
        destination: `${process.env.DIRECTUS_URL || 'http://localhost:8057'}/:path*`
      }
    ];
  },

  // Headers for optimization
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      // Cache static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Experimental features for better performance
  experimental: {
    // Use the new app directory if you're using Next.js 13+
    appDir: true,
    // Enable server components caching
    serverComponentsExternalPackages: [],
    // Optimize CSS
    optimizeCss: true,
    // Enable edge runtime for API routes
    runtime: 'edge'
  },

  // Build optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configure ISR for content updates
  async generateStaticParams() {
    // Pre-generate popular pages at build time
    return [];
  },

  // Output for different deployment targets
  output: 'standalone', // For Docker deployments
  // output: 'export', // For static export
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Bundle analyzer (uncomment to analyze bundle size)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },

  // Webpack customization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    
    return config;
  }
};

module.exports = nextConfig;