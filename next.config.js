/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enabled for static export deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './imageLoader.js',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure imgs directory is copied to output
  assetPrefix: '',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig