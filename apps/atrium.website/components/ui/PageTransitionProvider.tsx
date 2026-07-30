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

  const navigate = useCallback(
    (href: string, x: number, y: number) => {
      if (phase !== 'idle') return
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href)
        return
      }
      pendingHrefRef.current = href
      setOrigin({ x, y })
      setPhase('covering')
    },
    [phase, router],
  )

  const onCoverComplete = useCallback(() => {
    const href = pendingHrefRef.current
    if (!href) return
    router.push(href)
    setPhase('covered')
  }, [router])

  const onRevealComplete = useCallback(() => {
    pendingHrefRef.current = null
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

  return (
    <PageTransitionContext.Provider value={{ phase, origin, navigate, onCoverComplete, onRevealComplete }}>
      {children}
      <PageTransitionOverlay />
    </PageTransitionContext.Provider>
  )
}
