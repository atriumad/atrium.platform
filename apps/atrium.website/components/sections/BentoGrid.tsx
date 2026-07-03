'use client'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Eyebrow from '@/components/ui/Eyebrow'
import { gsap } from '@/lib/gsap'

export type BentoItem = {
  size: 'large' | 'medium' | 'small'
  title: ReactNode
  body: string
  cover: string
  bg?: string
  dark?: boolean
}

type Props = {
  items: BentoItem[]
  eyebrow?: string
  headline?: ReactNode
}

const sizeClass: Record<BentoItem['size'], string> = {
  large:  'md:col-span-2 md:row-span-2',
  medium: 'md:col-span-1 md:row-span-2',
  small:  'md:col-span-1 md:row-span-1',
}

export default function BentoGrid({ items, eyebrow, headline }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.bento-card')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: 'var(--surface-page)' }}>
      <div className="max-w-6xl mx-auto">
        {(eyebrow || headline) && (
          <div className="mb-16 max-w-3xl">
            {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
            {headline && (
              <h2 className="text-3xl md:text-5xl font-medium leading-tight">
                {headline}
              </h2>
            )}
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-5">
          {items.map((item, i) => {
            const isDark = item.dark ?? (i % 3 !== 1)
            return (
              <div
                key={item.title as unknown as string}
                className={`bento-card rounded-[var(--radius-bento)] overflow-hidden flex flex-col justify-between p-6 md:p-8 relative atr-lift ${sizeClass[item.size]}`}
                style={{
                  backgroundImage: isDark ? 'var(--grad-aurora-deep)' : 'var(--grad-aurora-cool)',
                  backgroundColor: isDark ? 'var(--teal-800)' : 'var(--mint-200)',
                  opacity: 0,
                  color: isDark ? 'var(--text-on-dark)' : 'var(--text-strong)',
                  boxShadow: isDark ? 'var(--shadow-float)' : 'var(--shadow-soft)',
                }}
              >
                {/* grain overlay */}
                <div className="atr-grain-overlay--soft atr-grain-overlay" />

                <div>
                  <h3
                    className="text-xl md:text-2xl font-medium leading-snug mb-3"
                    style={{ color: isDark ? 'var(--mint-400)' : 'var(--teal-800)' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: isDark ? 'var(--cloud-300)' : 'var(--ink-700)', opacity: 0.75 }}
                  >
                    {item.body}
                  </p>
                </div>

                <div className="mt-4 text-xs">
                  <span
                    className="inline-block px-3 py-1.5 rounded-full"
                    style={{
                      background: isDark ? 'rgba(228,238,240,0.07)' : 'rgba(7,47,52,0.06)',
                      border: isDark ? '1px solid rgba(228,238,240,0.12)' : '1px solid rgba(7,47,52,0.10)',
                      color: isDark ? 'var(--cloud-300)' : 'var(--teal-500)',
                    }}
                  >
                    {item.cover}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
