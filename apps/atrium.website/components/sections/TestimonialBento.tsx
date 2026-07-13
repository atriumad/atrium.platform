'use client'
import { useEffect, useRef } from 'react'
import Eyebrow from '@/components/ui/Eyebrow'
import { gsap } from '@/lib/gsap'

export type BentoCard =
  | { type: 'stat'; stat: string; statLabel: string; bg?: string }
  | { type: 'testimonial'; quote: string; author: string; role: string; company: string; bg?: string }

type Props = { items: BentoCard[]; eyebrow?: string }

export default function TestimonialBento({ items, eyebrow }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.tb-card')
    const ctx = gsap.context(() => {
      gsap.fromTo(cards,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current as HTMLElement, start: 'top 80%', once: true },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto">
        {eyebrow && <Eyebrow className="mb-14">{eyebrow}</Eyebrow>}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((card, i) => {
            const key = card.type === 'stat' ? `${card.stat}-${i}` : `${card.quote}-${i}`
            const bg = card.bg ?? (card.type === 'stat' ? 'var(--color-forest)' : 'var(--color-primary)')
            if (card.type === 'stat') {
              return (
                <div key={key} className="tb-card rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[260px]" style={{ background: bg, opacity: 0 }}>
                  <p className="text-6xl md:text-7xl font-medium leading-none" style={{ color: 'var(--color-accent)' }}>{card.stat}</p>
                  <p className="type-caption mt-4" style={{ color: 'var(--color-text-light)', opacity: 0.8 }}>{card.statLabel}</p>
                </div>
              )
            }
            return (
              <div key={key} className="tb-card rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[260px] md:col-span-2" style={{ background: bg, opacity: 0 }}>
                <p className="type-lead italic" style={{ color: 'var(--color-text-light)', fontFamily: 'var(--font-serif)' }}>
                  &ldquo;{card.quote}&rdquo;
                </p>
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(228,238,240,0.1)' }}>
                  <p className="type-caption font-medium" style={{ color: 'var(--color-accent)' }}>{card.author}</p>
                  <p className="type-eyebrow mt-1 opacity-60" style={{ color: 'var(--color-text-light)' }}>{card.role} · {card.company}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
