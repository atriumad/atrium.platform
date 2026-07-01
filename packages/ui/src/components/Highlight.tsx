import type { CSSProperties, ReactNode } from 'react'

type HighlightColor = 'amber' | 'mint' | 'teal'

type HighlightProps = {
  children?: ReactNode
  color?: HighlightColor
  style?: CSSProperties
}

const band: Record<HighlightColor, string> = {
  amber: 'var(--amber-400)',
  mint:  'var(--mint-400)',
  teal:  'var(--teal-800)',
}

export function Highlight({ children, color = 'amber', style }: HighlightProps) {
  const bandColor = band[color]
  const ink = color === 'teal' ? 'var(--mint-400)' : 'inherit'
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${bandColor}, ${bandColor})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 62%',
        backgroundPosition: '0 74%',
        padding: '0 0.12em',
        color: ink,
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
