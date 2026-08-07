import type { CSSProperties, ReactNode } from 'react'

type EyebrowTone = 'default' | 'mint' | 'amber' | 'onDark' | 'muted'

type EyebrowProps = {
  children: ReactNode
  tone?: EyebrowTone
  style?: CSSProperties
  className?: string
}

const toneColor: Record<EyebrowTone, string> = {
  default: 'var(--teal-500)',
  muted:   'var(--teal-500)',
  mint:    'var(--mint-400)',
  amber:   'var(--amber-500)',
  onDark:  'var(--teal-300)',
}

export function Eyebrow({ children, tone = 'default', style, className = '' }: EyebrowProps) {
  const color = toneColor[tone]
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', ...style }}>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: '0.75rem',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color,
        }}
      >
        {children}
      </p>
    </div>
  )
}
