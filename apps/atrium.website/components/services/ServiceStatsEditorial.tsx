'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { StatItem } from '@/lib/services'

export default function ServiceStatsEditorial({ stats }: { stats: StatItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ctx = gsap.context(() => {
      const numbers = container.querySelectorAll('.stat-number')
      for (const el of numbers) {
        gsap.fromTo(
          el as HTMLElement,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: el as HTMLElement, start: 'top 85%', once: true },
          }
        )
      }
      const labels = container.querySelectorAll('.stat-label')
      if (labels) {
        gsap.fromTo(labels,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 0.7, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 85%', once: true },
          }
        )
      }
    }, container)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative px-[var(--gutter)] py-24 md:py-32"
      style={{ background: 'var(--teal-900)' }}
    >
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 max-w-[var(--container-max)] mx-auto">
        {stats.map(stat => (
          <div key={`${stat.number}-${stat.label}`} className="flex flex-col gap-3">
            <strong
              className="stat-number text-6xl md:text-7xl font-medium italic tracking-tight leading-none"
              style={{ color: 'var(--mint-400)', fontFamily: 'var(--font-serif)', opacity: 0 }}
            >
              {stat.number}
            </strong>
            <p
              className="stat-label text-sm leading-relaxed max-w-xs m-0"
              style={{ color: 'var(--text-on-dark)', opacity: 0 }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
