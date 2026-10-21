import type { NextConfig } from 'next';

// Statischer Export: dieselbe Codebasis läuft als Website, PWA und später via Capacitor als App.
// Keine API-Routes, Server Actions, Middleware oder Laufzeit-SSR verwenden.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
