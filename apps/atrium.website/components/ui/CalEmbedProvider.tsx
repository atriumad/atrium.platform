'use client'

import { getCalApi } from '@calcom/embed-react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

let calInitialized = false

export default function CalEmbedProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname isn't read in the body — it's the re-run trigger so a client-side nav to a page with [data-cal-link] re-checks the DOM.
  useEffect(() => {
    // Only load the Cal.com embed script on the pages that actually use it —
    // no reason to ship it (and its third-party cookies/requests) site-wide.
    if (calInitialized) return
    if (!document.querySelector('[data-cal-link]')) return
    calInitialized = true
    ;(async () => {
      const cal = await getCalApi()
      cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#072F34' } },
        hideEventTypeDetails: false,
      })
    })()
  }, [pathname])

  return <>{children}</>
}
