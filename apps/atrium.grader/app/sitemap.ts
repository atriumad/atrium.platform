import type { MetadataRoute } from "next"
import { siteUrl } from "./seo"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: siteUrl,
    },
  ]
}
