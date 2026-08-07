import type { CSSProperties } from 'react'

type LogoVariant = 'mark' | 'wordmark' | 'lockup'

type LogoProps = {
  variant?: LogoVariant
  color?: string
  height?: number
  assetBase?: string
  gap?: number
  style?: CSSProperties
}

const WORDMARK_RATIO = 819.21 / 225.63

export function Logo({
  variant = 'wordmark',
  color = 'var(--teal-800)',
  height = 32,
  assetBase = '/logos',
  gap = 14,
  style,
}: LogoProps) {
  const mask = (file: string, ratio: number): CSSProperties => ({
    display: 'block',
    height: `${height}px`,
    width: `${height * ratio}px`,
    background: color,
    WebkitMask: `url(${assetBase}/${file}) left center / contain no-repeat`,
    mask: `url(${assetBase}/${file}) left center / contain no-repeat`,
  })

  if (variant === 'mark') {
    return <span role="img" aria-label="Atrium" style={{ ...mask('atrium-mark.svg', 1), ...style }} />
  }
  if (variant === 'wordmark') {
    return <span role="img" aria-label="atrium" style={{ ...mask('atrium-wordmark.svg', WORDMARK_RATIO), ...style }} />
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, ...style }} aria-label="Atrium" role="img">
      <span style={mask('atrium-mark.svg', 1)} />
      <span style={mask('atrium-wordmark.svg', WORDMARK_RATIO)} />
    </span>
  )
}
