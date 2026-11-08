import type { MetadataRoute } from "next";

// No /api route exists yet. Disallow it so a later handler is not crawled.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://letsgo.batleth.com/sitemap.xml",
  };
}
