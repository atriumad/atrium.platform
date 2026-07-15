'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { TimelineStep } from '@/lib/services'

type Props = { steps: TimelineStep[] }

export default function ServiceTimeline({ steps }: Props) {
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('.timeline-item')
    const ctx = gsap.context(() => {
      gsap.fromTo(items,
        { x: -32, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: listRef.current, start: 'top 78%', once: true },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--teal-800)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
        <div className="md:w-80 flex-shrink-0 md:sticky md:top-[8rem] md:self-start">
          <h2 className="type-section-title" style={{ color: 'var(--text-on-dark)' }}>
            Your plug-in brand team, <em>from kickoff to rollout.</em>
          </h2>
          <p className="type-body mt-5 max-w-[22rem]" style={{ color: 'var(--text-on-dark)', opacity: 0.66 }}>
            We work side-by-side with your team to shape, evolve, and scale your brand
            without the slowdowns of traditional agencies.
          </p>
        </div>
        <ol
          ref={listRef}
          className="flex-1 flex flex-col divide-y"
          style={{ borderColor: 'rgba(228,238,240,0.10)' }}
        >
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="timeline-item flex gap-6 py-8 first:pt-0 last:pb-0"
              style={{ opacity: 0 }}
            >
              <span
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  background: 'rgba(181,242,219,0.12)',
                  color: 'var(--mint-400)',
                  border: '1px solid rgba(181,242,219,0.20)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1.5">
                <p className="type-card-title" style={{ color: 'var(--text-on-dark)' }}>
                  {step.title}
                </p>
                <p className="type-caption" style={{ color: 'var(--text-on-dark)', opacity: 0.72 }}>
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
