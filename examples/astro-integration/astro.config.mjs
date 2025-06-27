import { defineConfig } from 'astro/config';

// 🎯 Directus Headless CMS Integration for Astro
// This example shows how to integrate Astro with our optimized Directus stack

export default defineConfig({
  // Server configuration for development
  server: {
    port: 3000,
    host: true
  },

  // Image optimization for assets from Directus
  image: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8057', // Headless API port
        pathname: '/assets/**'
      }
    ]
  },

  // Build optimizations
  build: {
    // Enable static generation for better CDN caching
    format: 'directory',
    // Optimize assets
    assets: '_assets'
  },

  // Vite configuration for development
  vite: {
    // Environment variables for Directus
    define: {
      'process.env.DIRECTUS_URL': JSON.stringify(process.env.DIRECTUS_URL || 'http://localhost:8057'),
      'process.env.DIRECTUS_TOKEN': JSON.stringify(process.env.DIRECTUS_TOKEN || '')
    },
    
    // Development server proxy for API calls
    server: {
      proxy: {
        '/api/directus': {
          target: 'http://localhost:8057',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/directus/, '')
        }
      }
    }
  },

  // Integrations
  integrations: [
    // Add any integrations you need
    // Example: @astrojs/tailwind(), @astrojs/react()
  ]
});