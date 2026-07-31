'use client'

import { getCalApi } from '@calcom/embed-react'
import { useEffect } from 'react'

export default function CalEmbedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi()
      cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#072F34' } },
        hideEventTypeDetails: false,
      })
    })()
  }, [])

  return <>{children}</>
}
