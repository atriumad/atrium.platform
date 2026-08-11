import TransitionLink from '@/components/ui/TransitionLink'
import CaseCover from '@/components/work/CaseCover'
import type { CaseStudy } from '@/lib/work'

/** How far a hovered panel grows. A two-up row starts from a wider share, so
 *  it needs less growth than a three-up row to read as the same gesture.
 *  Written as whole literal classes because Tailwind scans for them as text. */
export const GROW_TWO_UP = 'md:hover:grow-[1.7] md:focus-within:grow-[1.7]'
export const GROW_THREE_UP = 'md:hover:grow-[2.2] md:focus-within:grow-[2.2]'

const PANEL =
  'group relative block aspect-[16/10] overflow-hidden no-underline md:aspect-auto md:h-full md:flex-1 md:basis-0 md:transition-[flex-grow] md:duration-700 md:ease-atrium'

/** One panel of a full-bleed case gallery. Panels share their row until one is
 *  hovered, which takes the space from its siblings rather than from the page,
 *  so the row expands without reflowing anything below it. */
export default function CasePanel({
  study,
  detail,
  growClass,
  revealClass = '',
}: {
  study: CaseStudy
  /** The line held back until hover — a result, a metric, a sector. */
  detail: string
  growClass: string
  /** Hook and starting opacity for a scroll reveal. Panels without a reveal
   *  driving them must not start hidden, or they never appear. */
  revealClass?: string
}) {
  return (
    <TransitionLink
      className={`${PANEL} ${growClass} ${revealClass}`}
      href={`/work/${study.slug}`}
    >
      <CaseCover study={study} />

      {/* Sits above CaseCover's own scrim and logo layers, which end at z-20. */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6 pt-20 md:p-8 md:pt-28">
        <p className="m-0 text-[1.0625rem] font-medium leading-snug text-white md:text-[1.25rem]">
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
