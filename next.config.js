/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Désactiver les routes d'API pour l'export statique
  rewrites: async () => [],
};

module.exports = nextConfig;