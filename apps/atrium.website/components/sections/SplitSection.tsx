'use client'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'
import { gsap } from '@/lib/gsap'

type Props = {
  eyebrow?: string
  headline: ReactNode
  body: string
  cta: string
  ctaHref: string
  coverAlt: string
  bg?: string
  flip?: boolean
}

export default function SplitSection({ eyebrow, headline, body, cta, ctaHref, coverAlt, bg, flip = false }: Props) {
  const textRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current || !visualRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current,
        { x: flip ? 40 : -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: textRef.current as HTMLElement, start: 'top 80%', once: true },
        }
      )
      gsap.fromTo(visualRef.current,
        { x: flip ? -40 : 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: visualRef.current as HTMLElement, start: 'top 80%', once: true },
        }
      )
    })
    return () => ctx.revert()
  }, [flip])

  const isDark = bg === 'dark'
  const bg_ = isDark ? 'var(--color-primary)' : (bg ?? 'var(--color-surface)')
  const textColor = isDark ? 'var(--color-text-light)' : 'var(--color-text-dark)'

  return (
    <section className="px-6 md:px-12 py-20 md:py-28 overflow-hidden" style={{ background: bg_ }}>
      <div className={`max-w-6xl mx-auto flex flex-col ${flip ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>
        <div ref={textRef} className="flex-1 flex flex-col gap-6 max-w-lg" style={{ opacity: 0 }}>
          {eyebrow && <Eyebrow style={{ color: textColor } as React.CSSProperties}>{eyebrow}</Eyebrow>}
          <h2 className="text-3xl md:text-5xl font-medium leading-tight" style={{ color: textColor }}>{headline}</h2>
          <p className="text-base leading-relaxed" style={{ color: textColor, opacity: 0.7 }}>{body}</p>
          <div className="mt-2"><Button href={ctaHref} variant={isDark ? 'primary' : 'ghost'}>{cta}</Button></div>
        </div>
        <div ref={visualRef} className="flex-1 w-full" style={{ opacity: 0 }}>
          <div
            className="rounded-3xl aspect-[4/3] flex items-center justify-center text-sm text-center p-10"
            style={{
              background: isDark ? 'rgba(228,238,240,0.06)' : 'var(--color-surface-alt)',
              color: isDark ? 'rgba(228,238,240,0.3)' : 'rgba(7,47,52,0.3)',
              border: isDark ? '1px solid rgba(228,238,240,0.1)' : '1px solid rgba(7,47,52,0.08)',
            }}
          >
            <span className="max-w-xs leading-relaxed">[{coverAlt}]</span>
          </div>
        </div>
      </div>
    </section>
  )
}
