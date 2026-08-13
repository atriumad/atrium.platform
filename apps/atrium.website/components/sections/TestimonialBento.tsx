'use client'
import { Eyebrow } from '@atrium/ui'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export type BentoCard =
  | { type: 'stat'; stat: string; statLabel: string }
  | { type: 'testimonial'; quote: string; author: string; role: string; company: string }

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
    <section className="bg-dark px-[var(--gutter)] py-20 md:py-28">
      <div className="mx-auto max-w-[var(--container-max)]">
        {eyebrow && <Eyebrow className="mb-14" tone="on-dark">{eyebrow}</Eyebrow>}
        <div ref={gridRef} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((card, i) => {
            const key = card.type === 'stat' ? `${card.stat}-${i}` : `${card.quote}-${i}`
            if (card.type === 'stat') {
              return (
                <div
                  key={key}
                  className="tb-card flex min-h-[260px] flex-col justify-between rounded-2xl border border-cream/20 bg-cream/[0.06] p-8 opacity-0 md:p-10"
                >
                  <p className="text-6xl font-medium leading-none text-lime md:text-7xl">{card.stat}</p>
                  <p className="mt-4 text-[0.875rem] text-cream/70">{card.statLabel}</p>
                </div>
              )
            }
            return (
              <div
                key={key}
                className="tb-card flex min-h-[260px] flex-col justify-between rounded-2xl border border-cream/20 bg-cream/[0.06] p-8 opacity-0 md:col-span-2 md:p-10"
              >
                <p className="font-serif text-[clamp(1.05rem,1.4vw,1.25rem)] italic leading-relaxed text-cream">
                  &ldquo;{card.quote}&rdquo;
                </p>
                <div className="mt-8 border-t border-cream/20 pt-6">
                  {card.author && <p className="text-[0.875rem] font-medium text-lime">{card.author}</p>}
                  <Eyebrow as="p" tone="on-dark" className="mt-1">
                    {card.role} · {card.company}
                  </Eyebrow>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
