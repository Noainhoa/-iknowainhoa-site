import type { NextConfig } from "next";

/** Separate Vite PWA project; proxied under /almanac/ without owning that app’s deploy. */
const ALMANAC_ORIGIN =
  process.env.ALMANAC_ORIGIN ?? "https://iknowainhoa-almanac.vercel.app";

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
  async rewrites() {
    return [
      {
        source: "/almanac",
        destination: `${ALMANAC_ORIGIN}/almanac`,
      },
      {
        source: "/almanac/:path*",
        destination: `${ALMANAC_ORIGIN}/almanac/:path*`,
      },
    ];
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
