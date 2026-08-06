import { cn } from '../lib/cn'

type Tone = 'hi' | 'mid' | 'lo'

const fills: Record<Tone, string> = {
  hi: 'bg-green-fill',
  mid: 'bg-amber-fill',
  lo: 'bg-red-fill',
}

const badges: Record<Tone, string> = {
  hi: 'bg-green-soft text-green-ink',
  mid: 'bg-amber-soft text-amber-ink',
  lo: 'bg-red-soft text-red-ink',
}

export function Meter({
  value,
  label,
  description,
  tone = 'hi',
  className,
}: {
  value: number
  label: string
  description?: string
  tone?: Tone
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div
      className={cn(
        'grid items-center gap-6 rounded-2xl border-t border-line py-4',
        'grid-cols-[190px_1fr_96px]',
        'max-[980px]:grid-cols-[minmax(150px,1fr)_minmax(120px,1.4fr)_auto] max-[980px]:gap-[18px]',
        'max-[560px]:grid-cols-[1fr_auto] max-[560px]:gap-x-3.5 max-[560px]:gap-y-3',
        className,
      )}
    >
      <div className="font-sans text-[1rem] font-medium max-[560px]:col-span-full">
        {label}
        {description ? <small className="mt-0.5 block text-[0.8rem] font-normal text-muted">{description}</small> : null}
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: <meter> cannot host custom fill span */}
      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={clamped}
        aria-label={label}
        className="h-3.5 overflow-hidden rounded-full bg-track"
        role="meter"
      >
        <span className={cn('atr-fill', fills[tone])} data-w={`${clamped}%`} />
      </div>
      <div
        className={cn(
          'justify-self-end rounded-xl px-3.5 py-2 font-sans text-[1.5rem] font-medium tracking-[-0.02em]',
          'max-[560px]:px-3 max-[560px]:py-1.5 max-[560px]:text-[1.25rem]',
          badges[tone],
        )}
      >
        {clamped}
      </div>
    </div>
  )
}
