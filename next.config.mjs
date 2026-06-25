/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Some export/import libraries reference Node core modules that are not
  // needed in the browser. Stub them so the client bundle builds cleanly.
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      zlib: false,
    };
    return config;
  },
};

export default nextConfig;
