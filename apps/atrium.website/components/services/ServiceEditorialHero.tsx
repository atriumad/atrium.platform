import Button from '@/components/ui/Button'
import type { Service } from '@/lib/services'
import { relatedCaseBySlug } from '@/lib/services'
import CategoryBadge from './CategoryBadge'
import ServiceMarquee from './ServiceMarquee'
import { parseHeadline } from './utils'

export default function ServiceEditorialHero({ svc }: { svc: Service }) {
  return (
    <section
      className="relative overflow-hidden pt-[9.5rem] pb-[3rem] max-md:pt-[7.5rem] max-sm:pt-[6.5rem] max-sm:pb-[2rem]"
      style={{ background: 'var(--teal-800)' }}
    >
      <div className="px-[var(--gutter)]">
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

          <div className="mt-3 flex flex-wrap gap-4">
            <Button href={`/contact?service=${svc.slug}`} variant="mint">See how this works for my brand</Button>
            <Button href={`/work/${relatedCaseBySlug[svc.slug]}`} variant="ghostLight">See a related result</Button>
          </div>
        </div>
      </div>

      {/* Perks marquee — full-bleed, transparent, over the hero's green */}
      <div className="mt-[3.5rem] max-sm:mt-[2.5rem]">
        <ServiceMarquee svc={svc} />
      </div>
    </section>
  )
}
