/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude contract files from Next.js compilation
  webpack: (config, { isServer }) => {
    // Ignore hardhat files during build
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('hardhat');
    }
    
    return config;
  },
  
  // Exclude contracts and scripts from type checking
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Ensure .well-known files are served correctly
  async headers() {
    return [
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
