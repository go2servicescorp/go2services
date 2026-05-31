import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
  allowedDevOrigins: ["*.ngrok-free.app"],
};

export default nextConfig;
