'use client'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
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
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--color-primary)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
        <div className="flex-1 flex flex-col gap-6">
          {eyebrow && <Eyebrow style={{ color: 'var(--color-surface)' } as React.CSSProperties}>{eyebrow}</Eyebrow>}
          <h2 className="type-section-title max-w-lg" style={{ color: 'var(--color-text-light)' }}>{headline}</h2>
          <p className="type-body max-w-sm" style={{ color: 'var(--color-text-light)', opacity: 0.74 }}>{body}</p>
          <div className="mt-2"><Button href={ctaHref} variant="ghostLight">{cta}</Button></div>
          <div className="flex gap-10 mt-8 pt-8" style={{ borderTop: '1px solid rgba(228,238,240,0.08)' }}>
            {stats.map((s) => (
              <div key={`${s.number}-${s.label}`}>
                <p className="text-4xl font-medium" style={{ color: 'var(--color-accent)' }}>{s.number}</p>
                <p className="type-caption mt-1 max-w-[120px]" style={{ color: 'var(--color-text-light)', opacity: 0.68 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div ref={stepsRef} className="flex-1 flex flex-col gap-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="process-step flex gap-6 p-6 rounded-2xl transition-all duration-300 hover:translate-x-1"
              style={{ background: 'rgba(228,238,240,0.04)', border: '1px solid rgba(228,238,240,0.06)', opacity: 0 }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-medium" style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)' }}>
                {i + 1}
              </div>
              <div className="space-y-1.5">
                <p className="type-eyebrow" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>{step.eyebrow}</p>
                <p className="type-card-title" style={{ color: 'var(--color-text-light)' }}>{step.title}</p>
                <p className="type-caption" style={{ color: 'var(--color-text-light)', opacity: 0.72 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
