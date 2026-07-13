'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export type Stat = { number: string; label: string }

type Props = { stats: Stat[]; bg?: string; textColor?: string }

export default function StatsStrip({ stats, bg, textColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current?.querySelectorAll('.metric-reveal') ?? [],
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 78%', once: true },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="px-[var(--gutter)] py-24 md:py-36" style={{ background: bg ?? 'var(--surface-page)' }}>
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="metric-reveal max-w-4xl pb-14 md:pb-20">
          <p className="type-eyebrow m-0" style={{ color: 'var(--teal-500)' }}>
            Proof in the numbers
          </p>
          <h2 className="type-section-title m-0 mt-5" style={{ color: 'var(--text-strong)' }}>
            Growth you can feel.<br />
            <em style={{ fontFamily: 'var(--font-serif)' }}>Results you can prove.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
          {stats.map(stat => (
            <article
              key={`${stat.number}-${stat.label}`}
              className="metric-reveal grid min-h-[15rem] grid-cols-1 items-center gap-7 border-t py-10 md:min-h-[17rem] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-8 md:py-12"
              style={{ borderColor: 'rgba(7,47,52,0.16)' }}
            >
              <p
                className="stat-number m-0 text-[clamp(5rem,13vw,11.5rem)] font-normal leading-[0.72] tracking-[-0.055em] md:order-2 md:text-right md:text-[clamp(4.5rem,7.5vw,8.5rem)]"
                style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-serif)' }}
              >
                {stat.number}
              </p>
              <div className="md:order-1">
                <p className="stat-label type-body m-0 max-w-sm" style={{ color: textColor ?? 'var(--text-muted)' }}>
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
