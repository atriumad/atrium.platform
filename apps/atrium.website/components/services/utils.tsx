import type { ReactNode } from 'react'

export function parseHeadline(raw: string): ReactNode[] {
  return raw.split('*').map((part, i) =>
    i % 2 === 1 ? <em key={part}>{part}</em> : part
  )
}

export const CATEGORY_COLOR: Record<string, string> = {
  'Generate Demand': 'var(--mint-400)',
  'Convert Demand':  'var(--amber-500)',
  'Retain Demand':   'var(--teal-300)',
}
