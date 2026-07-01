import { type ReactNode, type CSSProperties, type MouseEvent } from 'react'

type ChipVariant = 'outline' | 'outline-light' | 'outline-soft' | 'mint' | 'mint-soft' | 'teal' | 'ink' | 'amber'
type ChipSize    = 'sm' | 'md' | 'lg'

type ChipProps = {
  children?: ReactNode
  variant?: ChipVariant
  selected?: boolean
  size?: ChipSize
  onClick?: (e: MouseEvent) => void
  style?: CSSProperties
}

const sizes: Record<ChipSize, CSSProperties> = {
  sm: { padding: '5px 14px',  fontSize: '13px' },
  md: { padding: '9px 20px',  fontSize: '15px' },
  lg: { padding: '12px 26px', fontSize: '17px' },
}

const palettes: Record<ChipVariant, CSSProperties> = {
  'outline':       { background: 'transparent',      color: 'var(--teal-800)', border: '1.5px solid var(--teal-800)' },
  'outline-light': { background: 'transparent',      color: 'var(--mint-400)', border: '1.5px solid var(--teal-500)' },
  'outline-soft':  { background: 'var(--cloud-100)', color: 'var(--teal-800)', border: '1.5px solid var(--cloud-400)' },
  'mint':          { background: 'var(--mint-400)',  color: 'var(--teal-800)', border: '1.5px solid var(--mint-400)' },
  'mint-soft':     { background: 'var(--mint-300)',  color: 'var(--teal-800)', border: '1.5px solid transparent' },
  'teal':          { background: 'var(--teal-800)',  color: 'var(--mint-400)', border: '1.5px solid var(--teal-800)' },
  'ink':           { background: 'var(--teal-800)',  color: 'var(--cloud-300)',border: '1.5px solid var(--teal-800)' },
  'amber':         { background: 'var(--amber-500)', color: 'var(--teal-800)', border: '1.5px solid var(--amber-500)' },
}

const selectedStyle: CSSProperties = {
  background: 'var(--teal-800)',
  color: 'var(--mint-400)',
  borderColor: 'var(--teal-800)',
}

export function Chip({ children, variant = 'outline', selected = false, size = 'md', onClick, style }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: 'var(--radius-pill)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        ...sizes[size],
        ...palettes[variant],
        ...(selected ? selectedStyle : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}
