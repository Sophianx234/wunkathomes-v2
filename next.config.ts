import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Set this high enough to accommodate 10x 5MB images
    },
  },
  // 1. NATIVE PROXYING
  async rewrites() {
    return [
      {
        // When frontend calls /api/tuya/...
        source: "/api/tuya/:path*",
        // Proxy it silently to the actual external API
        destination: "https://openapi.tuyaeu.com/v1.0/:path*",
      },
      {
        // Example: Another external microservice
        source: "/api/external/:path*",
        destination: "https://api.external-service.com/:path*",
      }
    ];
  },

  // 2. DISABLE POWERED BY HEADER (Security)
  // Prevents attackers from knowing you are running Next.js
  poweredByHeader: false,


};

export default nextConfig;
