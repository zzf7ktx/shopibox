/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["special-space-succotash-w96475645j63jqg-3000.app.github.dev/", "localhost:3000"]
    },
  }
};

module.exports = nextConfig;
