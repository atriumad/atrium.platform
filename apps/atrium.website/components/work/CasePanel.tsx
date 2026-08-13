import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import type { CaseStudy } from '@/lib/work'

const PANEL =
  'group relative block aspect-[16/10] overflow-hidden no-underline transition-opacity duration-500 md:aspect-auto md:h-full md:flex-1 md:basis-0'

// Every sibling but the hovered one drops back. Written as one selector —
// `.row:hover .panel:not(:hover)` — so there is no rule racing another to
// restore the panel under the cursor.
const DIM = 'md:group-hover/row:[&:not(:hover)]:opacity-40'

/** Wraps a row of panels. Panels read the hover state from here to dim. */
export function CaseRow({
  children,
  tall = false,
}: {
  children: React.ReactNode
  /** Two-up rows are taller than three-up rows. */
  tall?: boolean
}) {
  return (
    <div
      className={`group/row flex w-full flex-col md:flex-row ${tall ? 'md:h-[52vh]' : 'md:h-[44vh]'}`}
    >
      {children}
    </div>
  )
}

/** One panel of a full-bleed case gallery. At rest the photograph sits under a
 *  dark veil with the client's name on it; hovering lifts the veil and the
 *  picture comes forward, while its neighbours fall back. */
export default function CasePanel({
  study,
  detail,
  revealClass = '',
}: {
  study: CaseStudy
  /** The headline claim — a result, a metric. Held back until hover. */
  detail: string
  /** Hook and starting opacity for a scroll reveal. Panels without a reveal
   *  driving them must not start hidden, or they never appear. */
  revealClass?: string
}) {
  return (
    <TransitionLink className={`${PANEL} ${DIM} ${revealClass}`} href={`/work/${study.slug}`}>
      <CaseCover
        scrimClassName="bg-black/55 transition-opacity duration-500 ease-atrium md:group-focus-visible:opacity-0 md:group-hover:opacity-0"
        study={study}
      />

      {/* Above CaseCover's scrim and logo, which end at z-20. The gradient
          stays through the hover — it is what keeps the type legible once the
          veil is gone. */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6 pt-20 md:p-8 md:pt-28">
        <p className="m-0 text-[1.0625rem] leading-snug text-white md:text-[1.25rem]">
          {study.client}
        </p>
        <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-white/80 transition-all duration-500 md:max-h-0 md:translate-y-2 md:overflow-hidden md:opacity-0 md:group-focus-within:max-h-24 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:max-h-24 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          {detail}
        </p>
      </div>
    </TransitionLink>
  )
}

/** Splits a list into gallery rows, cycling through a pattern of row sizes. */
export function chunkRows<T>(items: T[], pattern: number[]): T[][] {
  const rows: T[][] = []
  let index = 0
  let step = 0

  while (index < items.length) {
    const size = pattern[step % pattern.length] ?? 2
    rows.push(items.slice(index, index + size))
    index += size
    step += 1
  }

  return rows
}
