'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

type Props = {
  clients: string[]
  bg?: string
  label?: string
  size?: 'default' | 'compact'
}

export default function LogoTicker({ clients, bg, label, size = 'default' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const secondSetRef = useRef<HTMLSpanElement>(null)
  const compact = size === 'compact'

  useEffect(() => {
    if (!trackRef.current || !secondSetRef.current) return
    // Measure the exact pixel offset to the first item of the duplicated
    // set (not scrollWidth/2) so the loop point lines up perfectly — a
    // width/2 estimate is off by half a gap whenever the item count is
    // odd, which shows up as a visible stutter/gap at the seam.
    const distance = secondSetRef.current.getBoundingClientRect().left - trackRef.current.getBoundingClientRect().left
    const tween = gsap.to(trackRef.current, {
      x: -distance, duration: compact ? 22 : 28, ease: 'none', repeat: -1,
    })
    return () => { tween.kill() }
  }, [compact])

  const doubled = [
    ...clients.map((name) => ({ name, cycle: 'first' })),
    ...clients.map((name) => ({ name, cycle: 'second' })),
  ]

  if (compact) {
    return (
      <div className="relative py-2" style={{ background: bg ?? 'var(--color-surface-alt)' }}>
        <div className="max-w-[var(--container-max)] mx-auto px-[var(--gutter)]">
          {label && (
            <p className="m-0 mb-[1.4rem] text-center text-[0.82rem] font-semibold" style={{ color: 'var(--color-text-dark)' }}>
              {label}
            </p>
          )}
          <div className="overflow-hidden">
            <div ref={trackRef} className="flex gap-10 whitespace-nowrap will-change-transform">
              {doubled.map(({ name, cycle }, i) => (
                <span
                  key={`${cycle}-${name}`}
                  ref={i === clients.length ? secondSetRef : undefined}
                  className="text-sm font-semibold tracking-wide shrink-0"
                  style={{ color: 'var(--color-text-dark)', opacity: 0.28 }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden py-8" style={{ background: bg ?? 'var(--color-surface-alt)' }}>
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, var(--color-accent) 0%, transparent 70%)`,
        }}
      />
      {label && (
        <p className="m-0 mb-6 text-center text-[0.82rem] font-semibold" style={{ color: 'var(--color-text-dark)' }}>
          {label}
        </p>
      )}
      <div className="border-t border-b py-6" style={{ borderColor: 'rgba(7,47,52,0.06)' }}>
        <div ref={trackRef} className="flex gap-16 whitespace-nowrap will-change-transform">
          {doubled.map(({ name, cycle }, i) => (
            <span
              key={`${cycle}-${name}`}
              ref={i === clients.length ? secondSetRef : undefined}
              className="text-sm font-medium tracking-wide shrink-0"
              style={{ color: 'var(--color-text-dark)', opacity: i % 3 === 0 ? 0.4 : 0.55 }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)', opacity: 0.3 }} />
    </div>
  )
}
