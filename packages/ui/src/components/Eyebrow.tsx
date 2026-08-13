import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'default' | 'on-dark'

const tones: Record<Tone, string> = {
  default: 'text-green',
  'on-dark': 'text-lime',
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
        // max-w-none because the website caps `main :where(p)` at a 72ch
        // prose measure. An eyebrow is a label, not prose, and inside a
        // centred block that cap left it sitting off to one side with its text
        // centred inside its own short box.
        'm-0 max-w-none font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
