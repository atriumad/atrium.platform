'use client'
import { Eyebrow, NumberReel } from '@atrium/ui'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import TransitionCTA from '@/components/ui/TransitionCTA'
import { gsap } from '@/lib/gsap'

export type ProcessStep = { eyebrow: string; title: string; body: string }
export type ProcessStat = { number: string; label: string }

type Props = {
  eyebrow?: string
  headline: ReactNode
  body: string
  cta: string
  ctaHref: string
  steps: ProcessStep[]
  stats: ProcessStat[]
}

export default function DarkProcess({ eyebrow, headline, body, cta, ctaHref, steps, stats }: Props) {
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stepsRef.current) return
    const stepEls = stepsRef.current.querySelectorAll('.process-step')
    const ctx = gsap.context(() => {
      gsap.fromTo(stepEls,
        { x: 32, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 75%', once: true },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-cream px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 md:flex-row md:gap-24">
        <div className="flex flex-1 flex-col gap-6">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="max-w-lg text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
            {headline}
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-body">{body}</p>
          <div className="mt-2"><TransitionCTA href={ctaHref} variant="outline">{cta}</TransitionCTA></div>
          <div className="mt-8 flex gap-10 border-t border-line pt-8">
            {stats.map((s) => (
              <div key={`${s.number}-${s.label}`}>
                <p className="m-0 font-serif text-[clamp(2.6rem,4vw,3.4rem)] font-normal leading-none tracking-[-0.03em] text-ink">
                  <NumberReel value={s.number} />
                </p>
                <p className="mt-3 max-w-[140px] text-[0.875rem] leading-relaxed text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div ref={stepsRef} className="flex flex-1 flex-col gap-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="process-step flex gap-5 rounded-card-sm bg-card p-6 opacity-0 shadow-soft transition-shadow duration-300 hover:shadow-float motion-reduce:transition-none"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-soft text-[0.95rem] font-medium text-green-ink">
                {i + 1}
              </div>
              <div className="space-y-1.5">
                <Eyebrow as="p">{step.eyebrow}</Eyebrow>
                <p className="text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15] text-ink">{step.title}</p>
                <p className="text-[0.875rem] text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
