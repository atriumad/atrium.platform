import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'surface' | 'warm' | 'dark' | 'amber'
type Elevation = 'none' | 'soft' | 'float'

const tones: Record<Tone, string> = {
  surface: 'bg-card text-ink',
  warm: 'bg-off-white text-ink',
  dark: 'bg-dark text-cream',
  amber: 'bg-amber-soft text-ink',
}

const elevations: Record<Elevation, string> = {
  none: '',
  soft: 'shadow-soft',
  float: 'shadow-float',
}

export function Card({
  tone = 'surface',
  elevation = 'soft',
  hairline = false,
  as: Component = 'div',
  className,
  children,
  ...rest
}: {
  tone?: Tone
  elevation?: Elevation
  hairline?: boolean
  as?: 'div' | 'section' | 'article' | 'aside'
  className?: string
  children?: ReactNode
} & HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn(
        'rounded-card p-[34px] max-[980px]:p-7 max-[560px]:px-5 max-[560px]:py-[22px]',
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
