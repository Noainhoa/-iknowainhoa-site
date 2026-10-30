import { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/_next",
        "/api",
        "/life",
        "/life/",
        "/parking-guardamar-centro/admin",
        "/parking-guardamar-centro/admin/",
        "/parking/admin",
        "/parking/admin/",
        "/tech-made-easy/admin",
        "/tech-made-easy/admin/",
        "/tech-made-easy/reserva",
        "*.json$",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
