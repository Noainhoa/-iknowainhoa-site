import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN access during local development (phone / other devices).
  allowedDevOrigins: ["192.168.1.51", "127.0.0.1", "localhost"],
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
      {
        source: "/work/muebles-begui",
        destination: "https://mueblesbegui.es/",
        permanent: true,
      },
      {
        source: "/work/muebles-begui/",
        destination: "https://mueblesbegui.es/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
