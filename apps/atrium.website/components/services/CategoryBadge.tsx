import { CATEGORY_COLOR } from './utils'

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-flex items-center w-fit rounded-full text-xs font-semibold leading-none px-3 py-2"
      style={{
        background: `color-mix(in srgb, ${CATEGORY_COLOR[category]} 72%, white)`,
        color: 'var(--teal-800)',
      }}
    >
      {category}
    </span>
  )
}
