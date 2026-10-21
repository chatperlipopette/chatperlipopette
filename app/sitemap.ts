import type { MetadataRoute } from "next";

const siteUrl = "https://chatperlipopette-nine.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/catalogue`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
