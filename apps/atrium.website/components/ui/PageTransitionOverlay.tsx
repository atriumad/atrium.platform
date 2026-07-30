'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { usePageTransition } from './PageTransitionProvider'

const COVER_DURATION = 0.5
const REVEAL_DURATION = 0.45

export default function PageTransitionOverlay() {
  const { phase, origin, onCoverComplete, onRevealComplete } = usePageTransition()
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight)

    if (phase === 'covering') {
      el.style.setProperty('--x', `${origin.x}px`)
      el.style.setProperty('--y', `${origin.y}px`)
      const tween = { r: 0 }
      gsap.to(tween, {
        r: maxRadius,
        duration: COVER_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => el.style.setProperty('--r', `${tween.r}px`),
        onComplete: onCoverComplete,
      })
    }

    if (phase === 'revealing') {
      const tween = { r: maxRadius }
      gsap.to(tween, {
        r: 0,
        duration: REVEAL_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => el.style.setProperty('--r', `${tween.r}px`),
        onComplete: onRevealComplete,
      })
    }
  }, [phase, origin, onCoverComplete, onRevealComplete])

  const isActive = phase !== 'idle'

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--color-primary)',
        clipPath: 'circle(var(--r, 0px) at var(--x, 50%) var(--y, 50%))',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    />
  )
}
