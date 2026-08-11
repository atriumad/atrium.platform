import TransitionLink from '@/components/ui/TransitionLink'
import type { Service } from '@/lib/services'
import CategoryBadge from './CategoryBadge'
import { parseHeadline } from './utils'

/** The header of a service page. Deliberately a page header and not a hero:
 *  a service is a subpage of Services, not a landing page of its own, so it
 *  opens on the section heading scale and carries the trail that says where
 *  it sits. The page already closes on a CTABanner, so there is no CTA pair
 *  here to duplicate it. */
export default function ServiceEditorialHero({ svc }: { svc: Service }) {
  return (
    <section className="bg-dark px-[var(--gutter)] pt-[7.5rem] pb-14 max-sm:pt-[6rem]">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[0.8125rem] text-cream/[0.65]"
        >
          <TransitionLink
            className="no-underline transition-colors hover:text-mint"
            href="/services"
          >
            Services
          </TransitionLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-cream/90">
            {svc.name}
          </span>
        </nav>

        <CategoryBadge category={svc.category} />

        <h1 className="m-0 max-w-[16ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
          {parseHeadline(svc.hero.headline, 'font-serif italic')}
        </h1>

        <p className="m-0 max-w-[38rem] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-cream/[0.78]">
          {svc.hero.body}
        </p>
      </div>
    </section>
  )
}
