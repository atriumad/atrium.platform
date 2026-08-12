'use client'

import { Button } from '@atrium/ui'
import type { ReactNode } from 'react'
import TransitionButton from './TransitionButton'

type Props = {
  href: string
  children: ReactNode
  /** Which ground it sits on. Drives the fill, not the shape. */
  tone?: 'on-dark' | 'on-light'
  /** Opens in a new tab and skips the page-transition wipe. */
  external?: boolean | undefined
  className?: string
}

/** The site's lead call to action: a pill with the arrow inset against its
 *  right edge. Kept in one place because the badge is markup, not a variant —
 *  repeating it per call site is how the two drift apart. */
export function PillCTA({ href, children, tone = 'on-light', external, className }: Props) {
  const onDark = tone === 'on-dark'

  const inner = (
    <>
      {children}
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 ${
          onDark ? 'bg-ink text-cream' : 'bg-cream text-ink'
        }`}
      >
        →
      </span>
    </>
  )

  const shared = {
    className: `group ${className ?? ''}`,
    size: 'pill' as const,
    variant: (onDark ? 'light' : 'primary') as 'light' | 'primary',
  }

  if (external) {
    return (
      <Button href={href} rel="noopener noreferrer" target="_blank" {...shared}>
        {inner}
      </Button>
    )
  }

  return (
    <TransitionButton href={href} {...shared}>
      {inner}
    </TransitionButton>
  )
}

/** The quiet one that sits beside PillCTA. */
export function OutlineCTA({ href, children, tone = 'on-light', external, className }: Props) {
  const onDark = tone === 'on-dark'

  const inner = (
    <>
      {children}
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${onDark ? 'bg-cream' : 'bg-ink'}`}
      />
    </>
  )

  const shared = {
    className: className ?? '',
    size: 'lg' as const,
    variant: (onDark ? 'outlineLight' : 'secondary') as 'outlineLight' | 'secondary',
  }

  if (external) {
    return (
      <Button href={href} rel="noopener noreferrer" target="_blank" {...shared}>
        {inner}
      </Button>
    )
  }

  return (
    <TransitionButton href={href} {...shared}>
      {inner}
    </TransitionButton>
  )
}
