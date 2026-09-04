import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
  },
  reactCompiler: true,
};

export default nextConfig;
