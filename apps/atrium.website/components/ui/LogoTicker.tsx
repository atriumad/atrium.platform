'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

type Props = { clients: string[]; bg?: string }

export default function LogoTicker({ clients, bg }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trackRef.current) return
    const totalWidth = trackRef.current.scrollWidth / 2
    const tween = gsap.to(trackRef.current, {
      x: -totalWidth, duration: 28, ease: 'none', repeat: -1,
    })
    return () => { tween.kill() }
  }, [])

  const doubled = [
    ...clients.map((name) => ({ name, cycle: 'first' })),
    ...clients.map((name) => ({ name, cycle: 'second' })),
  ]

  return (
    <div className="relative overflow-hidden py-8" style={{ background: bg ?? 'var(--color-surface-alt)' }}>
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, var(--color-accent) 0%, transparent 70%)`,
        }}
      />
      <div className="border-t border-b py-6" style={{ borderColor: 'rgba(7,47,52,0.06)' }}>
        <div ref={trackRef} className="flex gap-16 whitespace-nowrap will-change-transform">
          {doubled.map(({ name, cycle }, i) => (
            <span key={`${cycle}-${name}`} className="text-sm font-medium tracking-wide shrink-0" style={{ color: 'var(--color-text-dark)', opacity: i % 3 === 0 ? 0.4 : 0.55 }}>
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)', opacity: 0.3 }} />
    </div>
  )
}
