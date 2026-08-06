import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Tone = 'good' | 'warn' | 'bad'

const tones: Record<Tone, string> = {
  good: 'border-green-fill/35 text-green-ink',
  warn: 'border-amber/50 text-amber-ink',
  bad: 'border-red-fill/50 text-red-ink',
}

export function Stat({
  value,
  label,
  tone = 'good',
  className,
  ...rest
}: {
  value: number | string
  label: string
  tone?: Tone
  className?: string
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 rounded-full border-[1.5px] bg-transparent',
        'py-[7px] pl-3 pr-[13px] font-sans text-[0.8rem] text-body',
        tones[tone],
        className,
      )}
      {...rest}
    >
      <strong className="text-[0.92rem] font-semibold">{value}</strong> {label}
    </span>
  )
}
