import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'default' | 'on-dark'

const tones: Record<Tone, string> = {
  default: 'text-green',
  'on-dark': 'text-mint',
}

export function Eyebrow({
  tone = 'default',
  as: Component = 'p',
  className,
  children,
  ...rest
}: {
  tone?: Tone
  as?: 'p' | 'span' | 'div'
  className?: string
  children?: ReactNode
} & HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn(
        'm-0 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
