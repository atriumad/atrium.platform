import { cn } from '../lib/cn'

type Variant = 'mark' | 'wordmark' | 'lockup'

const WORDMARK_RATIO = 819.21 / 225.63

export function Logo({
  variant = 'wordmark',
  height = 32,
  className,
}: {
  variant?: Variant
  height?: number
  className?: string
}) {
  const mask = (file: string, width: number) => (
    <span
      aria-hidden="true"
      className="block bg-current"
      style={{
        height,
        width,
        maskImage: `url(${file})`,
        WebkitMaskImage: `url(${file})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )

  if (variant === 'mark') {
    return <span className={cn('inline-flex text-ink', className)}>{mask('/logos/atrium-mark.svg', height)}</span>
  }

  if (variant === 'wordmark') {
    return (
      <span className={cn('inline-flex text-ink', className)}>
        {mask('/logos/atrium-wordmark.svg', height * WORDMARK_RATIO)}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-[0.5em] text-ink', className)}>
      {mask('/logos/atrium-mark.svg', height * 1.05)}
      {mask('/logos/atrium-wordmark.svg', height * WORDMARK_RATIO)}
    </span>
  )
}
