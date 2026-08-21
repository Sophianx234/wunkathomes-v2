import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. IMAGE OPTIMIZATION
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

  // 2. EXPERIMENTAL & SERVER ACTION CONTROLS
  experimental: {
    serverActions: {
      // Tighter perimeter: 10 images * 5MB max = 50MB. 
      // Prevents massive payload DDoS attacks.
      bodySizeLimit: "50mb", 
      
      // CORRECT PLACEMENT: Allow specific external IPs/domains to call your actions
      allowedOrigins: ['127.0.0.1'], 
    },
  },

  // 3. BUILD ESCAPE HATCHES
  typescript: {
    // !! WARN !! Dangerously allow production builds to complete with type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Dangerously allow production builds to complete with ESLint errors.
    ignoreDuringBuilds: true,
  },

  // 4. SECURITY HEADERS
  // Prevents attackers from fingerprinting your tech stack
  poweredByHeader: false,

  // 5. NATIVE PROXYING (Commented out for future use)
  /* async rewrites() {
    return [
      {
        source: "/api/tuya/:path*",
        destination: "https://openapi.tuyaeu.com/v1.0/:path*",
      },
    ];
  }, */
};

export default nextConfig;