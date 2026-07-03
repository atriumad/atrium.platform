'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export type Stat = { number: string; label: string }

type Props = { stats: Stat[]; bg?: string; textColor?: string }

export default function StatsStrip({ stats, bg, textColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const numbers = containerRef.current.querySelectorAll('.stat-number')
    const ctx = gsap.context(() => {
      for (const el of numbers) {
        gsap.fromTo(el as HTMLElement,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: el as HTMLElement, start: 'top 85%', once: true },
          }
        )
      }
      const labels = containerRef.current?.querySelectorAll('.stat-label')
      if (labels) {
        gsap.fromTo(labels,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 0.7, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'power2.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 85%', once: true },
          }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="px-6 md:px-12 py-24 md:py-32" style={{ background: bg ?? 'var(--color-primary)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
        {stats.map((stat) => (
          <div key={`${stat.number}-${stat.label}`} className="flex flex-col gap-3">
            <p className="stat-number text-6xl md:text-7xl font-medium tracking-tight leading-none" style={{ color: 'var(--color-accent)', opacity: 0 }}>
              {stat.number}
            </p>
            <p className="stat-label text-sm leading-relaxed max-w-xs" style={{ color: textColor ?? 'var(--color-text-light)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
