import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'vktqecgylkjogquhsymz.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@supabase/supabase-js", "@supabase/ssr"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Turbopack pour dev ultra rapide
  // CORS for API routes
  async headers() {
    const existing = await (async () => {
      // Preserve existing security headers configuration
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://translate.google.com https://www.paypal.com https://www.sandbox.paypal.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://source.unsplash.com https://*.supabase.co  https://cdn-icons-png.flaticon.com https://api.qrserver.com https://www.svgrepo.com https://lh3.googleusercontent.com https://flagcdn.com https://www.transparenttextures.com  https://www.paypalobjects.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://*.supabase.co https://api-m.sandbox.paypal.com https://api-m.paypal.com https://vitals.vercel-insights.com https://www.google-analytics.com; frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com; media-src 'self' https://assets.mixkit.co;" },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          ],
        },
      ];
    })();
    // Add CORS for API routes
    existing.push({
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Authorization,Content-Type' },
        { key: 'Access-Control-Max-Age', value: '86400' },
      ],
    });
    return existing;
  },
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  // Compression & optimisation
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
