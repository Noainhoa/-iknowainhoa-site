import { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllBlog, getAllProjects, getAllProducts, getAllLanding } from "@/lib/content";
import { getAllProductApps, productAppPaths } from "@/lib/productApps";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url;

  // Fetch all published items
  const [blogs, projects, products, landings] = await Promise.all([
    getAllBlog(),
    getAllProjects(),
    getAllProducts(),
    getAllLanding(),
  ]);

  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.date ? new Date(project.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.date ? new Date(product.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const landingUrls = landings.map((landing) => ({
    url: `${baseUrl}/l/${landing.slug}`,
    lastModified: landing.date ? new Date(landing.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const productAppUrls = getAllProductApps().flatMap((app) => {
    const paths = productAppPaths(app.slug);
    return [
      {
        url: `${baseUrl}${paths.product}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}${paths.support}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}${paths.privacy}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      },
    ];
  });

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro?lang=es`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro?lang=en`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro?lang=fr`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro/privacidad?lang=es`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro/privacidad?lang=en`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/parking-guardamar-centro/privacidad?lang=fr`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    },
  ];

  return [
    ...staticUrls,
    ...productAppUrls,
    ...blogUrls,
    ...projectUrls,
    ...productUrls,
    ...landingUrls,
  ];
}
