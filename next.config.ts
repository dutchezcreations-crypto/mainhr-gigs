import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ehbikcdpnorevdxfuzyr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  output: "standalone",
  // Allow WebSocket/HMR connections from ngrok domains in development
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.io",
    "localhost:3000",
  ],
  // Allow Server Actions from ngrok domains (CSRF protection bypass)
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.ngrok-free.app",
        "*.ngrok-free.dev",
        "*.ngrok.io",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
