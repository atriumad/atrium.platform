import type { Service } from '@/lib/services'
import CategoryBadge from './CategoryBadge'
import ServiceMarquee from './ServiceMarquee'
import { parseHeadline } from './utils'

/** The header of a service page. Deliberately a page header and not a hero:
 *  a service is a subpage of Services, not a landing page of its own, so it
 *  opens on the section heading scale. The page already closes on a
 *  CTABanner, so there is no CTA pair here to duplicate it. */
export default function ServiceEditorialHero({ svc }: { svc: Service }) {
  return (
    <section className="bg-dark pt-[7.5rem] pb-12 max-sm:pt-[6rem]">
      {/* Gutter and container nest rather than share an element, so the header
          starts at the same left edge as every section below it. */}
      <div className="px-[var(--gutter)]">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-5">
          <CategoryBadge category={svc.category} />

          <h1 className="m-0 max-w-[16ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
            {parseHeadline(svc.hero.headline, 'font-serif italic')}
          </h1>

          <p className="m-0 max-w-[38rem] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/[0.78]">
            {svc.hero.body}
          </p>
        </div>
      </div>

      {/* Full-bleed, so it stays outside the gutter wrapper. */}
      <div className="mt-12 max-sm:mt-9">
        <ServiceMarquee svc={svc} />
      </div>
    </section>
  )
}
