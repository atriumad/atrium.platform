'use client'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { StatItem } from '@/lib/services'

type Props = {
  stats: StatItem[]
  eyebrow?: string
  headline?: ReactNode
}

export default function ServiceStatsEditorial({
  stats,
  eyebrow = 'The business case',
  headline = (
    <>
      Not more activity.<br />
      <em style={{ fontFamily: 'var(--font-serif)' }}>More momentum.</em>
    </>
  ),
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.querySelectorAll('.metric-reveal'),
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: container, start: 'top 78%', once: true },
        }
      )
    }, container)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative px-[var(--gutter)] py-24 md:py-36"
      style={{ background: 'var(--teal-900)' }}
    >
      <div className="relative mx-auto max-w-[var(--container-max)]">
        <div className="metric-reveal max-w-4xl pb-14 md:pb-20">
          <p className="type-eyebrow m-0" style={{ color: 'var(--mint-400)' }}>
            {eyebrow}
          </p>
          <h2 className="type-section-title m-0 mt-5" style={{ color: 'var(--text-on-dark)' }}>
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
          {stats.map(stat => (
            <article
              key={`${stat.number}-${stat.label}`}
              className="metric-reveal grid min-h-[15rem] grid-cols-1 items-center gap-7 border-t py-10 md:min-h-[17rem] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-8 md:py-12"
              style={{ borderColor: 'rgba(181,242,219,0.22)' }}
            >
              <strong
                className="stat-number m-0 text-[clamp(5rem,13vw,11.5rem)] font-normal italic leading-[0.72] tracking-[-0.055em] md:order-2 md:text-right md:text-[clamp(4.5rem,7.5vw,8.5rem)]"
                style={{ color: 'var(--mint-400)', fontFamily: 'var(--font-serif)' }}
              >
                {stat.number}
              </strong>
              <div className="md:order-1">
                <p className="stat-label type-body m-0 max-w-sm" style={{ color: 'var(--text-on-dark)', opacity: 0.76 }}>
                  {stat.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
