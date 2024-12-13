/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          fs: false, // Prevents 'fs' from being bundled in the client-side code
        };
      }
      return config;
    },
  };
  
export default nextConfig;
  
