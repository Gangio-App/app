/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  // Disable the automatic 308 redirection for trailing slashes
  // This is important for Socket.IO to work properly
  trailingSlash: false,
  // Explicitly allows the Socket.IO endpoint to use the API path
  async rewrites() {
    return [
      {
        source: '/api/socket/:path*',
        destination: '/api/socket',
      },
    ];
  },
  // Add fallbacks for socket.io dependencies that might be missing in the browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  // Enable standalone output mode for Docker deployment
  output: 'standalone',
  // Increase memory limit for the build process
  experimental: {
    // This increases the memory limit for the build process
    memoryBasedWorkersCount: true,
  },
};

module.exports = nextConfig; 