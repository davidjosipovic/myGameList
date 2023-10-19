/** @type {import('next').NextConfig} */
const nextConfig = {
  
    typescript: {
        ignoreBuildErrors: true,
      },
      swcMinify: true,
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.igdb.com',
            port: '',
            pathname: '/igdb/**',
          },
        ],
      },
};

module.exports = nextConfig
