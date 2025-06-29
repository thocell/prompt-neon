/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Skip static generation for problematic pages
  trailingSlash: true,
  output: 'standalone',
  // Disable static optimization to prevent prerender errors
  experimental: {
    forceSwcTransforms: true,
  }
}

module.exports = nextConfig
