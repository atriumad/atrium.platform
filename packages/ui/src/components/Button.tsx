import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'light' | 'outlineLight'
type Size = 'sm' | 'md' | 'lg' | 'pill'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-mint shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  secondary: 'bg-card text-ink border border-line shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  accent: 'bg-amber text-ink shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  // For dark grounds. `light` is the solid counterpart to `primary`;
  // `outlineLight` is the quiet one beside it.
  light: 'bg-cream text-ink shadow-soft hover:-translate-y-0.5 hover:shadow-float',
  outlineLight: 'bg-transparent text-cream border border-cream/25 hover:border-cream/50 hover:bg-cream/[0.06]',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.82rem] gap-1.5',
  md: 'px-6 py-3.5 text-[0.92rem] gap-2',
  lg: 'px-8 py-4 text-[1.02rem] gap-2.5',
  // Carries a trailing badge: the right padding is small so the badge sits
  // inset against the pill's edge rather than floating inside it.
  pill: 'py-1.5 pr-1.5 pl-7 text-[1.02rem] gap-5',
}

const base = [
  'inline-flex items-center justify-center rounded-full font-sans font-semibold leading-none',
  'cursor-pointer no-underline transition duration-200 ease-atrium',
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-green-fill',
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
].join(' ')

type Shared = { variant?: Variant; size?: Size; className?: string; children?: ReactNode }

type ButtonProps = Shared & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Shared>
type AnchorProps = Shared & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Shared | 'href'>

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('href' in props && props.href !== undefined) {
    return <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  }

  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return <button className={classes} type={type} {...buttonRest}>{children}</button>
}
