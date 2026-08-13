import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'surface' | 'warm' | 'dark' | 'amber' | 'lime' | 'coral' | 'cool'
type Elevation = 'none' | 'soft' | 'float'
type Padding = 'sm' | 'md'

const tones: Record<Tone, string> = {
  surface: 'bg-card text-charcoal',
  warm: 'bg-off-white text-charcoal',
  dark: 'bg-dark text-cream',
  amber: 'bg-amber-soft text-charcoal',
  // Solid brand fills. Charcoal clears 4.5:1 on both — 11.49:1 on lime,
  // 5.63:1 on coral — so the copy inside needs no special casing.
  lime: 'bg-lime text-charcoal',
  coral: 'bg-coral text-charcoal',
  // The sheet's Pale Blue-Gray — a neutral that is neither the page nor the
  // white cards, so a tile can sit apart without taking a brand colour.
  cool: 'bg-cool text-charcoal',
}

const elevations: Record<Elevation, string> = {
  none: '',
  soft: 'shadow-soft',
  float: 'shadow-float',
}

const paddings: Record<Padding, string> = {
  sm: 'p-[26px] max-[560px]:p-5',
  md: 'p-[34px] max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]',
}

export function Card({
  tone = 'surface',
  elevation = 'soft',
  padding = 'md',
  hairline = false,
  as: Component = 'div',
  className,
  children,
  ...rest
}: {
  tone?: Tone
  elevation?: Elevation
  padding?: Padding
  hairline?: boolean
  as?: 'div' | 'section' | 'article' | 'aside'
  className?: string
  children?: ReactNode
} & HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn(
        'rounded-card',
        paddings[padding],
        tones[tone],
        elevations[elevation],
        hairline && (tone === 'dark' ? 'ring-1 ring-cream/20' : 'ring-1 ring-line'),
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
