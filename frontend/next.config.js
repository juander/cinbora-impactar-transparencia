/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  // This will prevent static generation for routes that use search params
  // which resolves our build issues
  pageExtensions: ['tsx', 'jsx', 'js', 'ts'],
  images: {
    // Removida a configuração depreciada domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cinbora-transparencia.s3.sa-east-1.amazonaws.com',
        port: '',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig
