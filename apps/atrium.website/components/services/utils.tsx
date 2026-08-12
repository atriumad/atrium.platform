import type { ReactNode } from 'react'

/** Splits `*accented*` markup into plain text and `<em>` runs. Pass
 *  `emClassName` only for a section-level headline earning the one
 *  serif-italic accent per composition; repeated card titles (bento,
 *  deliverables) stay uncoloured, inheriting the card's own text tone —
 *  matching the pattern already established in BentoGrid. */
export function parseHeadline(raw: string, emClassName?: string): ReactNode[] {
  return raw.split('*').map((part, i) =>
    i % 2 === 1 ? <em key={part} className={emClassName}>{part}</em> : part
  )
}

export const CATEGORY_COLOR: Record<string, string> = {
  'Generate Demand': 'var(--stage-generate)',
  'Convert Demand':  'var(--stage-convert)',
  'Retain Demand':   'var(--stage-retain)',
}
