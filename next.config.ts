import type { NextConfig } from 'next';

// Statischer Export: dieselbe Codebasis läuft als Website, PWA und später via Capacitor als App.
// Keine API-Routes, Server Actions, Middleware oder Laufzeit-SSR verwenden.
const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages liefert unter /<repo>/ aus; lokal leer
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
