import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Variant = 'outline' | 'filled' | 'solid' | 'mint' | 'on-dark'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  outline: 'bg-transparent text-charcoal border border-line',
  filled: 'bg-amber text-charcoal',
  solid: 'bg-ink text-cream',
  mint: 'bg-lime text-charcoal',
  'on-dark': 'bg-cream/[0.07] text-lime border border-cream/15',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1 text-[0.72rem] gap-1.5',
  md: 'px-4 py-[7px] text-[0.82rem] gap-2',
}

export function Tag({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...rest
}: { variant?: Variant; size?: Size; className?: string; children?: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-sans font-semibold leading-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
