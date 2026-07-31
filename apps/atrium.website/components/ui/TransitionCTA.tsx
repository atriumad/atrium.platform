'use client'

import { usePathname } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'
import { resolveClickIntent } from '@/lib/pageTransitionClick'
import Button from './Button'
import { usePageTransition } from './PageTransitionProvider'

type ButtonVariant = 'primary' | 'mint' | 'amber' | 'outline' | 'ghost' | 'ghostLight'
type ButtonSize = 'sm' | 'md' | 'lg'

type TransitionCTAProps = {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  disabled?: boolean
  children?: ReactNode
  className?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function TransitionCTA({ href, onClick, disabled, ...rest }: TransitionCTAProps) {
  const pathname = usePathname()
  const { navigate } = usePageTransition()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) return
    onClick?.(event)
    const intent = resolveClickIntent(event, href, pathname)
    if (!intent.intercept) return
    event.preventDefault()
    navigate(href, intent.x, intent.y)
  }

  const buttonProps = disabled !== undefined ? { disabled } : {}

  return <Button href={href} onClick={handleClick} {...buttonProps} {...rest} />
}
