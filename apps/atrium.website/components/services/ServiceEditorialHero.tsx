import type { Service } from '@/lib/services'
import CategoryBadge from './CategoryBadge'
import { parseHeadline } from './utils'

export default function ServiceEditorialHero({ svc }: { svc: Service }) {
  return (
    <section
      className="relative overflow-hidden px-[var(--gutter)] pt-[9.5rem] pb-[5.5rem] max-md:pt-[7.5rem] max-sm:pt-[6.5rem] max-sm:pb-[3.5rem]"
      style={{ background: 'var(--teal-800)' }}
    >
      <div className="flex flex-col gap-5 max-w-[var(--container-wide)] mx-auto">
        <CategoryBadge category={svc.category} />

        <h1
          className="type-page-title m-0 max-w-[13ch]"
          style={{ color: 'var(--text-on-dark)' }}
        >
          {parseHeadline(svc.hero.headline)}
        </h1>

        <p
          className="type-lead m-0 max-w-[38rem]"
          style={{ color: 'var(--text-on-dark)', opacity: 0.74 }}
        >
          {svc.hero.body}
        </p>
      </div>
    </section>
  )
}
