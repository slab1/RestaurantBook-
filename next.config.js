/** @type {import('next').NextConfig} */
const nextConfig = {
  // Commented out for development - uncomment for static export builds
  // output: 'export',
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