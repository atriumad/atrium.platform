import { CATEGORY_COLOR } from './utils'

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full px-3 py-[0.55rem] text-[0.7rem] uppercase tracking-[0.14em] text-charcoal"
      style={{ background: `color-mix(in srgb, ${CATEGORY_COLOR[category]} 72%, white)` }}
    >
      {category}
    </span>
  )
}
