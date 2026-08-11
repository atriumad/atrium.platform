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

/** One panel of a full-bleed case gallery. At rest it is the cover with the
 *  client's name; on hover a brand-green curtain rises over the photograph and
 *  the panel becomes a record — client, headline number, services, and the way
 *  in. Touch has no hover, so below md the curtain is dropped and the detail
 *  simply stays on the label. */
export default function CasePanel({
  study,
  detail,
  tags,
  revealClass = '',
}: {
  study: CaseStudy
  /** The headline claim — a result, a metric. */
  detail: string
  /** Optional service list, shown on the curtain. */
  tags?: string
  /** Hook and starting opacity for a scroll reveal. Panels without a reveal
   *  driving them must not start hidden, or they never appear. */
  revealClass?: string
}) {
  return (
    <TransitionLink className={`${PANEL} ${DIM} ${revealClass}`} href={`/work/${study.slug}`}>
      <CaseCover study={study} />

      {/* Resting label. Above CaseCover's scrim and logo, which end at z-20. */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6 pt-20 transition-opacity duration-300 md:p-8 md:pt-28 md:group-hover:opacity-0">
        <p className="m-0 text-[1.0625rem] font-medium leading-snug text-white md:text-[1.25rem]">
          {study.client}
        </p>
        <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-white/80 md:hidden">
          {detail}
        </p>
      </div>

      {/* The curtain. green-ink rather than green: cream tops out at 4.63:1 on
          green, which leaves no headroom for the smaller type below. */}
      <div className="absolute inset-0 z-40 hidden translate-y-full flex-col justify-end bg-green-ink p-8 transition-transform duration-700 ease-atrium md:flex md:group-focus-visible:translate-y-0 md:group-hover:translate-y-0">
        <p className="m-0 text-[1.25rem] font-medium leading-snug text-cream">{study.client}</p>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-cream/90">{detail}</p>
        {tags && <p className="mt-4 text-[0.8125rem] leading-relaxed text-cream/80">{tags}</p>}
        <span className="mt-6 inline-flex items-center gap-2 text-[0.875rem] font-medium text-cream">
          Read the case
          <span aria-hidden="true">→</span>
        </span>
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
