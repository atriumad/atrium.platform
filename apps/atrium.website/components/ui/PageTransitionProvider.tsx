'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import PageTransitionOverlay from './PageTransitionOverlay'

type Phase = 'idle' | 'covering' | 'covered' | 'revealing'

type PageTransitionContextValue = {
  phase: Phase
  origin: { x: number; y: number }
  navigate: (href: string, x: number, y: number) => void
  onCoverComplete: () => void
  onRevealComplete: () => void
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null)

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) throw new Error('usePageTransition must be used within PageTransitionProvider')
  return ctx
}

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('idle')
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const pendingHrefRef = useRef<string | null>(null)
  const isTransitioningRef = useRef(false)
  const hasCoveredRef = useRef(false)
  const hasRevealedRef = useRef(false)

  const navigate = useCallback(
    (href: string, x: number, y: number) => {
      if (isTransitioningRef.current) return
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href)
        return
      }
      isTransitioningRef.current = true
      hasCoveredRef.current = false
      hasRevealedRef.current = false
      pendingHrefRef.current = href
      setOrigin({ x, y })
      setPhase('covering')
    },
    [router],
  )

  const onCoverComplete = useCallback(() => {
    if (hasCoveredRef.current) return
    const href = pendingHrefRef.current
    if (!href) return
    hasCoveredRef.current = true
    router.push(href)
    setPhase('covered')
  }, [router])

  const onRevealComplete = useCallback(() => {
    if (hasRevealedRef.current) return
    hasRevealedRef.current = true
    pendingHrefRef.current = null
    isTransitioningRef.current = false
    setPhase('idle')
  }, [])

  useEffect(() => {
    if (phase !== 'covered') return
    const targetPath = pendingHrefRef.current?.split('#')[0]?.split('?')[0]
    if (targetPath !== pathname) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('revealing'))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [phase, pathname])

  // Safety net: if `pathname` never matches the pending href (e.g. a
  // popstate/back navigation lands somewhere else while covered), force the
  // reveal anyway so the overlay can never wedge the site permanently.
  useEffect(() => {
    if (phase !== 'covered') return
    const timeout = window.setTimeout(() => {
      setPhase((prev) => (prev === 'covered' ? 'revealing' : prev))
    }, 5000)
    return () => window.clearTimeout(timeout)
  }, [phase])

  return (
    <PageTransitionContext.Provider value={{ phase, origin, navigate, onCoverComplete, onRevealComplete }}>
      {children}
      <PageTransitionOverlay />
    </PageTransitionContext.Provider>
  )
}
