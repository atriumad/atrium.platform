import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

/** The pill row that sits under a page headline — service tags on a case
 *  study, perk tags on a service page.
 *
 *  It lives here rather than in a consuming app because nothing about it is
 *  app-specific: it is the same element doing the same job wherever a hero
 *  needs to list what is included. `Tag` is the single pill for inline use;
 *  this is the set, and it owns the wrapping and the tint rotation.
 *
 *  Fills come from `.atr-pill-tags` in styles.css, which cycles four brand
 *  tints by position so a row of any length keeps its rhythm. */
export function PillTags({
  items,
  label,
  className,
  ...rest
}: { items: string[]; label: string; className?: string } & Omit<HTMLAttributes<HTMLUListElement>, 'aria-label'>) {
  if (items.length === 0) return null

  return (
    <ul
      aria-label={label}
      className={cn('atr-pill-tags m-0 flex list-none flex-wrap justify-center gap-2 p-0', className)}
      {...rest}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
