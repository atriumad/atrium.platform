'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { resolveClickIntent } from '@/lib/pageTransitionClick'
import { usePageTransition } from './PageTransitionProvider'

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { children?: ReactNode }

export default function TransitionLink({ href, onClick, children, ...rest }: TransitionLinkProps) {
  const pathname = usePathname()
  const { navigate } = usePageTransition()
  const hrefStr = typeof href === 'string' ? href : (href.pathname ?? '')

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    const intent = resolveClickIntent(event, hrefStr, pathname)
    if (!intent.intercept) return
    event.preventDefault()
    navigate(hrefStr, intent.x, intent.y)
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
