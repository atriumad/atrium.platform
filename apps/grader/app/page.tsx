import { GraderClient } from "./grader-client"
import { metaImage, seoDescription, seoTitle, siteName, siteUrl } from "./seo"

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${siteUrl}/#organization`,
      "@type": "Organization",
      logo: `${siteUrl}/Atrium%20Works%20-08.png`,
      name: "Atrium",
      url: siteUrl,
    },
    {
      "@id": `${siteUrl}/#website`,
      "@type": "WebSite",
      description: seoDescription,
      image: `${siteUrl}${metaImage.path}`,
      name: siteName,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      url: siteUrl,
    },
    {
      "@id": `${siteUrl}/#webapp`,
      "@type": "WebApplication",
      applicationCategory: "BusinessApplication",
      description: seoDescription,
      image: `${siteUrl}${metaImage.path}`,
      name: seoTitle,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Web",
      provider: {
        "@id": `${siteUrl}/#organization`,
      },
      url: siteUrl,
    },
  ],
}

export default function GraderPage() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is static SEO metadata serialized from trusted constants.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <GraderClient />
    </>
  )
}
