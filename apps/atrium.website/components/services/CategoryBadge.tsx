import { CATEGORY_COLOR } from './utils'

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="type-eyebrow inline-flex w-fit items-center rounded-full px-3 py-[0.55rem]"
      style={{
        background: `color-mix(in srgb, ${CATEGORY_COLOR[category]} 72%, white)`,
        color: 'var(--teal-800)',
      }}
    >
      {category}
    </span>
  )
}
