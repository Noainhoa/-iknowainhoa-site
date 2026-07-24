import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.thum.io",
        pathname: "/get/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/parking",
        destination: "/parking-guardamar-centro",
        permanent: true,
      },
      {
        source: "/parking/",
        destination: "/parking-guardamar-centro/",
        permanent: true,
      },
      {
        source: "/parking/admin",
        destination: "/parking-guardamar-centro/admin",
        permanent: true,
      },
      {
        source: "/parking/admin/",
        destination: "/parking-guardamar-centro/admin/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
