import type { ReactNode, CSSProperties } from 'react'

type ScriptAccentProps = {
  children?: ReactNode
  underline?: boolean
  color?: string
  style?: CSSProperties
}

export function ScriptAccent({ children, underline = true, color = 'inherit', style }: ScriptAccentProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-script)',
        fontWeight: 400,
        color,
        textDecoration: underline ? 'underline' : 'none',
        textDecorationThickness: '2px',
        textUnderlineOffset: '3px',
        lineHeight: 1.1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
