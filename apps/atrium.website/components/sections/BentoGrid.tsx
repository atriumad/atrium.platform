'use client'
import { Card, Eyebrow } from '@atrium/ui'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
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

const titleClass: Record<BentoItem['size'], string> = {
  large: 'text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15]',
  medium: 'text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15]',
  small: 'text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15]',
}

const copyWidthClass: Record<BentoItem['size'], string> = {
  large: 'max-w-3xl',
  medium: 'max-w-sm',
  small: 'max-w-xs',
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
    <section className="bg-cream px-[var(--gutter)] py-20 md:py-28">
      <div className="mx-auto max-w-[var(--container-max)]">
        {(eyebrow || headline) && (
          <div className="mb-16 max-w-3xl">
            {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
            {headline && (
              <h2 className="text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em]">
                {headline}
              </h2>
            )}
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-5">
          {items.map((item, i) => {
            const isDark = item.dark ?? i === 0
            const tone = isDark ? 'dark' : i % 2 === 0 ? 'warm' : 'surface'
            return (
              <Card
                key={item.title as unknown as string}
                tone={tone}
                elevation={isDark ? 'float' : 'soft'}
                className={`bento-card flex flex-col justify-between overflow-hidden opacity-0 ${sizeClass[item.size]}`}
              >
                <div>
                  <h3 className={`${titleClass[item.size]} mb-3 font-medium ${isDark ? 'text-lime' : ''}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed opacity-75 ${copyWidthClass[item.size]}`}>
                    {item.body}
                  </p>
                </div>

                <div className="mt-4 text-xs">
                  <span
                    className={`inline-block max-w-full rounded-full border px-3 py-1.5 text-[0.68rem] font-medium uppercase leading-[1.25] tracking-[0.16em] ${
                      isDark ? 'border-cream/15 bg-cream/[0.07] text-cream/75' : 'border-line bg-ink/[0.04] text-muted'
                    }`}
                  >
                    {item.cover}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
