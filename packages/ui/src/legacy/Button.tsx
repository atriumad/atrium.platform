'use client'

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, type ReactNode, useState } from 'react'

type ButtonVariant = 'primary' | 'mint' | 'amber' | 'outline' | 'ghost' | 'ghostLight'
type ButtonSize    = 'sm' | 'md' | 'lg'

type SharedProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  disabled?: boolean
  children?: ReactNode
  style?: CSSProperties
}

type ButtonAsButton = SharedProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps | 'style'>
type ButtonAsAnchor = SharedProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps | 'style' | 'href'>

type ButtonProps = ButtonAsButton | ButtonAsAnchor

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '8px 16px',  fontSize: '13px', gap: '6px' },
  md: { padding: '12px 24px', fontSize: '15px', gap: '8px' },
  lg: { padding: '16px 34px', fontSize: '17px', gap: '10px' },
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary:    { background: 'var(--teal-800)', color: 'var(--mint-400)',  border: '1.5px solid var(--teal-800)' },
  mint:       { background: 'var(--mint-400)', color: 'var(--teal-800)',  border: '1.5px solid var(--mint-400)' },
  amber:      { background: 'var(--amber-500)',color: 'var(--teal-800)',  border: '1.5px solid var(--amber-500)' },
  outline:    { background: 'transparent',     color: 'var(--teal-800)',  border: '1.5px solid var(--teal-800)' },
  ghost:      { background: 'transparent',     color: 'var(--teal-800)',  border: '1.5px solid transparent' },
  ghostLight: { background: 'transparent',     color: 'var(--cloud-300)', border: '1.5px solid var(--teal-300)' },
}

const hoverBg: Record<ButtonVariant, string> = {
  primary:    'var(--teal-900)',
  mint:       'var(--mint-500)',
  amber:      'var(--amber-600)',
  outline:    'var(--teal-800)',
  ghost:      'var(--cloud-300)',
  ghostLight: 'rgba(228,238,240,0.10)',
}

const hoverColor: Partial<Record<ButtonVariant, string>> = {
  outline:    'var(--mint-400)',
  ghostLight: 'var(--mint-300)',
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '0.01em',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
}

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled = false,
    children,
    style,
    ...rest
  } = props

  const [pressed, setPressed] = useState(false)
  const [hover,   setHover]   = useState(false)

  const computed: CSSProperties = {
    ...base,
    ...sizes[size],
    ...variantStyles[variant],
    ...(fullWidth ? { width: '100%' } : {}),
    opacity: disabled ? 0.45 : 1,
    cursor:  disabled ? 'not-allowed' : 'pointer',
    transform: pressed ? 'scale(0.97)' : 'scale(1)',
    ...(hover && !disabled ? { background: hoverBg[variant], color: hoverColor[variant] } : {}),
    ...style,
  }

  const events = {
    onPointerDown:  () => setPressed(true),
    onPointerUp:    () => setPressed(false),
    onPointerLeave: () => { setPressed(false); setHover(false) },
    onPointerEnter: () => setHover(true),
  }

  if ('href' in props && props.href !== undefined) {
    const { href } = props
    return (
      <a href={disabled ? undefined : href} style={computed} aria-disabled={disabled} {...events} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {iconLeft}{children}{iconRight}
      </a>
    )
  }

  return (
    <button disabled={disabled} style={computed} {...events} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {iconLeft}{children}{iconRight}
    </button>
  )
}
