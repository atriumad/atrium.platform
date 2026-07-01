import type { Metadata } from 'next'
import Footer from '@/components/ui/Footer'
import GSAPProvider from '@/components/ui/GSAPProvider'
import Navbar from '@/components/ui/Navbar'
import { instrumentSerif, interTight, nothingYouCouldDo } from '@/lib/fonts'

import './globals.css'

export const metadata: Metadata = {
  title: 'Atrium — Hospitality Marketing',
  description: 'Smart creative for restaurants, hotels, and food brands.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${instrumentSerif.variable} ${nothingYouCouldDo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GSAPProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </GSAPProvider>
      </body>
    </html>
  )
}
