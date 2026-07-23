import type { Metadata } from 'next'
import Footer from '@/components/ui/Footer'
import GSAPProvider from '@/components/ui/GSAPProvider'
import Navbar from '@/components/ui/Navbar'
import TabTitleSwitcher from '@/components/ui/TabTitleSwitcher'
import { instrumentSerif, interTight, nothingYouCouldDo } from '@/lib/fonts'

import './globals.css'

const title = 'Atrium — Hospitality Marketing'
const description = 'Smart creative for restaurants, hotels, and food brands.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atriumad.com'),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'Atrium',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${instrumentSerif.variable} ${nothingYouCouldDo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TabTitleSwitcher />
        <GSAPProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </GSAPProvider>
      </body>
    </html>
  )
}
