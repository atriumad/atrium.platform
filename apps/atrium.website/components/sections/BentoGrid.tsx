'use client'
import { Card, Eyebrow } from '@atrium/ui'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export type BentoItem = {
  size: 'large' | 'medium' | 'small'
  title: ReactNode
  body: string
  /** Describes the picture. Alt text on the tiles that carry one. */
  cover?: string
  bg?: string
  dark?: boolean
  /** Overrides the alternating tone with a solid brand fill. */
  fill?: 'lime' | 'coral' | 'cool'
  /** Absolute URL. Fills the tile behind a scrim; the copy inverts to cream. */
  image?: string
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
            // A photo tile carries its own ground, so it takes the dark tone
            // and reads as one of the dark cards for text purposes.
            const isDark = item.image ? true : item.fill ? false : (item.dark ?? i === 0)
            const tone = item.image ? 'dark' : (item.fill ?? (isDark ? 'dark' : i % 2 === 0 ? 'warm' : 'surface'))
            return (
              <Card
                key={item.title as unknown as string}
                tone={tone}
                elevation={isDark ? 'float' : 'soft'}
                // Title top, copy bottom, so the copy works the whole tile
                // rather than leaving the bottom empty. The medium tiles are
                // the exception: they are tall and narrow, and spreading them
                // opens a gap nothing fills.
                className={`bento-card group relative flex flex-col overflow-hidden opacity-0 ${
                  item.size === 'medium' ? 'gap-3' : 'justify-between gap-6'
                } ${sizeClass[item.size]}`}
              >
                {item.image && (
                  <>
                    <Image
                      alt={item.cover ?? ''}
                      className="object-cover transition-transform duration-700 ease-atrium group-hover:scale-[1.04]"
                      fill
                      // The first tile is the LCP element on the home page.
                      priority={i === 0}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      src={item.image}
                    />
                    {/* Two layers: a light flat wash so the copy holds anywhere
                        on the tile, and a gradient that deepens under the
                        heading without burying the picture. */}
                    <div className="absolute inset-0 bg-charcoal/30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-transparent to-charcoal/35" />
                  </>
                )}

                <h3
                  className={`relative m-0 ${titleClass[item.size]} ${
                    item.image ? 'text-cream' : isDark ? 'text-lime' : ''
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`relative m-0 text-sm leading-relaxed ${copyWidthClass[item.size]} ${
                    // Over a photo, 75% opacity gives out wherever the picture
                    // goes bright; cream at 90% holds against both.
                    item.image ? 'text-cream/90' : 'opacity-75'
                  }`}
                >
                  {item.body}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
