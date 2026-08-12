'use client'

import { Button } from '@atrium/ui'
import { usePathname } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'
import { resolveClickIntent } from '@/lib/pageTransitionClick'
import { usePageTransition } from './PageTransitionProvider'

type Props = ComponentProps<typeof Button> & { href: string }

/** The design-system Button with the page-transition wipe attached.
 *
 *  TransitionCTA does the same for the legacy Button and keeps its own variant
 *  list, so it cannot render the design system's variants — this is the
 *  equivalent for surfaces that have moved over. */
export default function TransitionButton({ href, onClick, ...rest }: Props) {
  const pathname = usePathname()
  const { navigate } = usePageTransition()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event as never)
    const intent = resolveClickIntent(event, href, pathname)
    if (!intent.intercept) return
    event.preventDefault()
    navigate(href, intent.x, intent.y)
  }

  return <Button href={href} onClick={handleClick} {...rest} />
}
