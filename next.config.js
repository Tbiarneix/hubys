/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.airbnb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.airbnb.fr',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'api.homeexchange.com',
      'imagedelivery.net',
      'a0.muscache.com',
      'www.airbnb.com',
      'www.airbnb.fr',
      'tripadvisor.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
