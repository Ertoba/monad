/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["placeholder.com", "via.placeholder.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@vercel/postgres"],
  },
}

module.exports = nextConfig

