import type { Metadata, Viewport } from "next"
import { instrumentSerif, interTight, nothingYouCouldDo } from "@/lib/fonts"
import { metaImage, seoDescription, seoKeywords, seoTitle, siteName, siteUrl } from "./seo"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: `%s | ${siteName}`,
  },
  description: seoDescription,
  applicationName: siteName,
  authors: [{ name: "Atrium" }],
  creator: "Atrium",
  keywords: seoKeywords,
  publisher: "Atrium",
  alternates: {
    canonical: "/",
  },
  icons: {
    apple: [{ type: "image/png", url: "/Atrium%20Works%20-08.png" }],
    icon: [{ type: "image/png", url: "/Atrium%20Works%20-08.png" }],
    shortcut: [{ type: "image/png", url: "/Atrium%20Works%20-08.png" }],
  },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: "/",
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: metaImage.path,
        width: metaImage.width,
        height: metaImage.height,
        alt: metaImage.alt,
        type: metaImage.type,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: [metaImage.path],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#072f34",
  colorScheme: "light",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${interTight.variable} ${instrumentSerif.variable} ${nothingYouCouldDo.variable}`}
      lang="en"
    >
      <body>{children}</body>
    </html>
  )
}
