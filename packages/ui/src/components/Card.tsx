'use client'

import { type CSSProperties, type ReactNode, useState } from 'react'

type CardTone      = 'light' | 'cloud' | 'mint' | 'amber' | 'teal' | 'aurora' | 'aurora-warm' | 'aurora-cool' | 'aurora-deep'
type CardElevation = 'none' | 'soft' | 'float'

type CardProps = {
  children?: ReactNode
  tone?: CardTone
  padding?: string
  radius?: string
  bordered?: boolean
  hover?: boolean
  elevation?: CardElevation
  style?: CSSProperties
}

const tones: Record<CardTone, CSSProperties> = {
  'light':       { background: 'var(--surface-card)',  color: 'var(--text-body)' },
  'cloud':       { background: 'var(--cloud-300)',      color: 'var(--text-body)' },
  'mint':        { background: 'var(--mint-400)',       color: 'var(--teal-800)' },
  'amber':       { background: 'var(--amber-500)',      color: 'var(--teal-800)' },
  'teal':        { background: 'var(--teal-800)',       color: 'var(--text-on-dark)' },
  'aurora':      { backgroundImage: 'var(--grad-aurora)',      backgroundColor: 'var(--mint-200)', color: 'var(--text-body)' },
  'aurora-warm': { backgroundImage: 'var(--grad-aurora-warm)', backgroundColor: 'var(--mint-200)', color: 'var(--text-body)' },
  'aurora-cool': { backgroundImage: 'var(--grad-aurora-cool)', backgroundColor: 'var(--mint-200)', color: 'var(--text-body)' },
  'aurora-deep': { backgroundImage: 'var(--grad-aurora-deep)', backgroundColor: 'var(--teal-800)', color: 'var(--text-on-dark)' },
}

const elevationShadow: Record<CardElevation, string> = {
  none:  'none',
  soft:  'var(--shadow-soft)',
  float: 'var(--shadow-float)',
}

export function Card({
  children,
  tone = 'light',
  padding = '28px',
  radius = 'var(--radius-md)',
  bordered = false,
  hover = false,
  elevation = 'none',
  style,
}: CardProps) {
  const [h, setH] = useState(false)

  return (
    <div
      onPointerEnter={() => hover && setH(true)}
      onPointerLeave={() => hover && setH(false)}
      style={{
        position: 'relative',
        borderRadius: radius,
        padding,
        overflow: 'hidden',
        border: bordered && tone === 'light' ? '1px solid var(--cloud-400)' : '1px solid transparent',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        transform: h ? 'translateY(-5px)' : 'none',
        boxShadow: h ? 'var(--shadow-float)' : elevationShadow[elevation],
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </div>
  )
}
