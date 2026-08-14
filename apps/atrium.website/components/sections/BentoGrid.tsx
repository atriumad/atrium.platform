'use client'
import { Card, Eyebrow } from '@atrium/ui'
import { Asterisk } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export type BentoItem = {
  size: 'large' | 'medium' | 'small'
  title: ReactNode
  /** Optional: some tiles carry the heading alone and let the picture do the
   *  rest. Leaving it out is a composition choice, not missing copy. */
  body?: string
  /** Describes the picture. Alt text on the tiles that carry one. */
  cover?: string
  bg?: string
  dark?: boolean
  /** Overrides the alternating tone with a solid brand fill. */
  fill?: 'lime' | 'coral' | 'cool'
  /** Absolute URL. Fills the tile edge to edge; the copy inverts to cream. */
  image?: string
  /** The picture is a cut-out on transparency, not a photograph filling the
   *  frame. It sits inside the tile at its own scale and the tile keeps its
   *  `fill` colour behind it, instead of the picture becoming the ground. */
  cutout?: boolean
}

type Props = {
  items: BentoItem[]
  eyebrow?: string
  headline?: ReactNode
}

// Widths out of eight, not areas: every tile is one row tall, so `size` only
// says how much of the row it takes. Each row has to add up to 8 — 4+2+2 and
// 3+3+2 are the two the home page uses.
const sizeClass: Record<BentoItem['size'], string> = {
  large: 'md:col-span-4',
  medium: 'md:col-span-3',
  small: 'md:col-span-2',
}

// Only the widest tile needs a measure; at 3 and 2 columns the tile is already
// narrower than a comfortable line.
const copyWidthClass: Record<BentoItem['size'], string> = {
  large: 'max-w-3xl',
  medium: 'max-w-none',
  small: 'max-w-none',
}

// The share of the viewport each tile actually occupies, so a 2-column tile
// does not download the 4-column tile's image.
const imageSizes: Record<BentoItem['size'], string> = {
  large: '(min-width: 768px) 50vw, 100vw',
  medium: '(min-width: 768px) 38vw, 100vw',
  small: '(min-width: 768px) 25vw, 100vw',
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

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-8 auto-rows-[22rem] gap-5">
          {items.map((item, i) => {
            // A photo tile carries its own ground, so it takes the dark tone
            // and reads as one of the dark cards for text purposes. A cut-out
            // is the exception: the picture floats on the tile rather than
            // becoming it, so the tile's own fill still decides the tone.
            const photo = Boolean(item.image) && !item.cutout
            const isDark = photo ? true : item.fill ? false : (item.dark ?? i === 0)
            const tone = photo ? 'dark' : (item.fill ?? (isDark ? 'dark' : i % 2 === 0 ? 'warm' : 'surface'))
            return (
              <Card
                key={item.title as unknown as string}
                tone={tone}
                elevation={isDark ? 'float' : 'soft'}
                // Title top, copy bottom, on every tile. Now that they are all
                // one row tall the split lands the same everywhere, so the row
                // reads as one band of headings over one band of copy.
                className={`bento-card group relative flex flex-col overflow-hidden opacity-0 ${
                  // A cut-out owns the bottom of its tile, so the copy sits
                  // straight under the heading instead of being pushed into
                  // the picture.
                  item.cutout ? 'justify-start gap-3' : 'justify-between gap-6'
                } ${sizeClass[item.size]}`}
              >
                {item.cutout && (
                  // Lime knocked back with the deep green, lightening toward
                  // the corner the object sits in. Mixed from the tokens
                  // rather than pinned to a hex, so it follows the palette.
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(to bottom right, color-mix(in srgb, var(--color-lime) 66%, var(--color-green)) 0%, color-mix(in srgb, var(--color-lime) 82%, var(--color-green)) 45%, var(--color-lime) 100%)',
                    }}
                  />
                )}

                {item.image && (
                  <>
                    <Image
                      alt={item.cover ?? ''}
                      // A cut-out is sized to sit in the lower half of the
                      // tile, clear of the heading, and is not cropped — the
                      // whole object is the point.
                      className={`transition-transform duration-700 ease-atrium group-hover:scale-[1.04] ${
                        // Clears the heading and the copy above it, then runs
                        // to the bottom edge — the object is never cropped.
                        // Flush to the bottom and right edges. The top padding
                        // is the only inset — it holds the object clear of the
                        // copy; anything on the sides would just shrink it,
                        // since `contain` already letterboxes.
                        item.cutout
                          ? 'object-contain object-right-bottom pt-[8.5rem]'
                          : 'object-cover'
                      }`}
                      fill
                      // The first tile is the LCP element on the home page.
                      priority={i === 0}
                      sizes={imageSizes[item.size]}
                      src={item.image}
                    />
                    {/* No scrim: the pictures carry the tiles at full strength.
                        The copy is cream straight onto the photograph, so a
                        tile only works if its picture stays dark where the
                        heading and the copy sit. */}
                  </>
                )}

                {/* The marker is what a plain tile has instead of a picture —
                    it gives the heading a right edge to sit against, so the
                    filled tiles keep the same top line as the photo ones. */}
                <div className="relative flex items-start justify-between gap-4">
                  <h3
                    className={`m-0 text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15] ${
                      photo ? 'text-cream' : isDark ? 'text-lime' : ''
                    }`}
                  >
                    {item.title}
                  </h3>
                  {!item.image && (
                    <Asterisk
                      aria-hidden="true"
                      className="mt-1.5 h-4 w-4 flex-shrink-0 opacity-45"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                {item.body && (
                  <p
                    className={`relative m-0 text-sm leading-relaxed ${copyWidthClass[item.size]} ${
                      // Over a photo, 75% opacity gives out wherever the picture
                      // goes bright; cream at 90% holds against both.
                      photo ? 'text-cream/90' : 'opacity-75'
                    }`}
                  >
                    {item.body}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
