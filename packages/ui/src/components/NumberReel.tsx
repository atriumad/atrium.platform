'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/** Renders a figure whose digits roll into place like a mechanical wheel.
 *  Non-digit characters ($, %, ., x) are rendered statically alongside.
 *
 *  Each digit is a vertical strip that ends on its target: a few full 0-9
 *  turns, then the digits up to the value. The strip translates by whole
 *  cells, so what shows through the window is always a whole glyph.
 *
 *  The value is exposed once through a visually hidden span; the strips are
 *  hidden from assistive tech, which would otherwise read every digit of
 *  every turn. */
export function NumberReel({
  value,
  turns = 2,
  duration = 1400,
  stagger = 110,
  className,
}: {
  value: string
  /** Full 0-9 rotations before settling. More turns read as more momentum. */
  turns?: number
  /** Roll duration in ms for the first digit. */
  duration?: number
  /** Delay added per digit, left to right. */
  stagger?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [rolled, setRolled] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No animation to run: land on the value immediately.
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      setRolled(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRolled(true)
            io.disconnect()
          }
        }
      },
      // threshold 0 so a figure taller than the viewport still fires
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  let digitIndex = -1

  return (
    <span className={cn('inline-flex items-baseline', className)} ref={ref}>
      <span className="visually-hidden">{value}</span>
      {[...value].map((char, i) => {
        if (!/\d/.test(char)) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: characters repeat within a figure, so position is the identity
            <span aria-hidden="true" key={i}>
              {char}
            </span>
          )
        }

        digitIndex += 1
        const target = Number(char)
        const strip = [...Array.from({ length: turns }, () => DIGITS).flat(), ...DIGITS.slice(0, target + 1)]
        const offset = strip.length - 1

        return (
          <span
            aria-hidden="true"
            className="inline-block h-[1em] overflow-hidden leading-none tracking-normal"
            // biome-ignore lint/suspicious/noArrayIndexKey: characters repeat within a figure, so position is the identity
            key={i}
          >
            <span
              className="flex flex-col will-change-transform motion-reduce:transition-none"
              style={{
                transform: `translateY(${rolled ? -offset : 0}em)`,
                transition: `transform ${duration + digitIndex * stagger}ms cubic-bezier(.16, 1, .3, 1)`,
              }}
            >
              {strip.map((digit, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: the strip is a fixed sequence with repeats
                <span className="block h-[1em] leading-none" key={j}>
                  {digit}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
