import type { MetadataRoute } from "next"
import { siteUrl } from "./seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
