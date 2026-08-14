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

/** `sm` exists for the header, whose row is 56px — the same height the default
 *  badge and its padding already add up to. Shrinking the badge is what buys
 *  the button its breathing room there; everything else is the same button. */
type PillSize = 'default' | 'sm'

const BADGE: Record<PillSize, string> = {
  default: 'h-11 w-11',
  sm: 'h-8 w-8 text-sm',
}

// Padding is set against the badge so the arrow stays inset by the same
// hairline at both sizes.
const PILL_PADDING: Record<PillSize, string> = {
  default: '',
  sm: 'py-1 pr-1 pl-5 text-xs gap-3',
}

/** The site's lead call to action: a pill with the arrow inset against its
 *  right edge. Kept in one place because the badge is markup, not a variant —
 *  repeating it per call site is how the two drift apart. */
export function PillCTA({
  href,
  children,
  tone = 'on-light',
  external,
  className,
  size = 'default',
}: Props & { size?: PillSize }) {
  const onDark = tone === 'on-dark'

  // On hover the badge grows until it has swallowed the pill, so the button
  // inverts outward from the arrow rather than cross-fading.
  //
  // It expands to lime rather than to the badge's own colour: on a dark ground
  // an ink fill is the page background, and with no border the button would
  // vanish mid-animation. Lime reads against both grounds, and charcoal on it
  // is 11.49:1.
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`-z-10 -translate-y-1/2 absolute top-1/2 right-1.5 origin-center scale-100 rounded-full bg-lime transition-transform duration-500 ease-atrium group-hover:scale-[16] motion-reduce:transition-none ${BADGE[size]}`}
      />
      <span className="relative transition-colors duration-300 group-hover:text-charcoal">
        {children}
      </span>
      <span
        aria-hidden="true"
        className={`relative flex items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-charcoal group-hover:text-lime ${BADGE[size]} ${
          onDark ? 'bg-ink text-cream' : 'bg-cream text-charcoal'
        }`}
      >
        →
      </span>
    </>
  )

  const shared = {
    className: `group relative isolate overflow-hidden ${PILL_PADDING[size]} ${className ?? ''}`,
    // The circle expanding out of the badge is the hover; lifting the whole
    // pill on top of it reads as two animations fighting.
    lift: false,
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

  // One step of the same roll NumberReel uses on the metrics: the label lifts
  // and its own copy arrives from below. No fill — the outline is the button.
  const inner = (
    <>
      <span className="relative block h-[1.25em] overflow-hidden">
        <span className="block transition-transform duration-500 ease-atrium group-hover:-translate-y-1/2 motion-reduce:transition-none">
          <span className="block h-[1.25em] leading-[1.25em]">{children}</span>
          <span aria-hidden="true" className="block h-[1.25em] leading-[1.25em]">
            {children}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full transition-transform duration-500 ease-atrium group-hover:scale-150 ${
          onDark ? 'bg-lime' : 'bg-green'
        }`}
      />
    </>
  )

  const shared = {
    className: `group ${className ?? ''}`,
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
