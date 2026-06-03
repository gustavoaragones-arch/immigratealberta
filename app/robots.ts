import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't index the decision-tool result/city pages — they're query-param
        // driven and generate infinite URL space, which wastes crawl budget.
        disallow: ["/decision-tool/results", "/decision-tool/city"],
      },
    ],
    sitemap: "https://immigratealberta.ca/sitemap.xml",
  };
}
