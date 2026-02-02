/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Externalize @react-pdf/renderer to prevent bundling conflicts
  // This fixes React version conflicts in production
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@react-pdf/layout',
    '@react-pdf/pdfkit',
    '@react-pdf/primitives',
    '@react-pdf/reconciler',
    '@react-pdf/font',
    '@react-pdf/image',
    '@react-pdf/stylesheet',
    '@react-pdf/textkit',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig

