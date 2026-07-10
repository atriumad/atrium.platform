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
          className="max-w-[13ch] font-sans text-[4.5rem] leading-[0.93] font-medium m-0 max-lg:text-[3.8rem] max-md:text-[3.2rem] max-sm:text-[2.6rem]"
          style={{ color: 'var(--text-on-dark)' }}
        >
          {parseHeadline(svc.hero.headline)}
        </h1>

        <p
          className="max-w-[38rem] text-[1.05rem] m-0 max-sm:text-[0.95rem]"
          style={{ color: 'var(--text-on-dark)', opacity: 0.6, lineHeight: 'var(--leading-body)' }}
        >
          {svc.hero.body}
        </p>
      </div>
    </section>
  )
}
