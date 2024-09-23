/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api-insight.susy.house/api/:path*", // Proxy to the actual API
      },
    ];
  },
};

export default nextConfig;
