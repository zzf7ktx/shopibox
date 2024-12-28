/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.blob.core.windows.net",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "special-space-succotash-w96475645j63jqg-3000.app.github.dev/",
        "localhost:3000",
      ],
    },
  },
};

module.exports = nextConfig;
