/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Note: Security headers are set in electron/main.js via CSP
  // Static export doesn't support headers() - they must be set by Electron
}

module.exports = nextConfig
