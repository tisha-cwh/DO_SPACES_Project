import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow any DigitalOcean Spaces (and Spaces CDN) hostname so
    // next/image can optimize the uploaded thumbnails.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "**.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
