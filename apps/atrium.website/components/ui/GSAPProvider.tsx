'use client'
import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'

export default function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    refresh()
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])
  return <>{children}</>
}
