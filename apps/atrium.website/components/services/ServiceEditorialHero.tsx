import { PillTags } from '@atrium/ui'
import type { Service } from '@/lib/services'
import CategoryBadge from './CategoryBadge'
import { parseHeadline } from './utils'

/** The header of a service page. It takes the case study hero's shape — the
 *  same cream ground with the glint cluster behind the type, everything
 *  centred, the tags as a pill row under the copy.
 *
 *  It stays a page header rather than becoming a landing hero — a service is a
 *  subpage of Services — so it opens on the section heading scale and carries
 *  no CTA pair, which the CTABanner at the foot of the page already does.
 *
 *  The perks used to scroll past here as a marquee of the same six tags. As a
 *  static row they say the same thing in one glance. */
export default function ServiceEditorialHero({ svc }: { svc: Service }) {
  return (
    <section className="relative isolate bg-cream pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Gutter and container nest rather than share an element, so the header
          starts at the same left edge as every section below it. */}
      <div className="px-[var(--gutter)]">
        <div className="relative mx-auto max-w-3xl text-center">
          {/* The glint layer centres on the box it is positioned against, so it
              belongs in the copy column rather than in the section. It is larger
              than the column and spills past the section — no `overflow-hidden`
              here, or the cluster reads as a clipped rectangle. */}
          <div aria-hidden="true" className="atr-hero-glints" />

          {/* Positioned so it paints over the layer above: both are positioned,
              so DOM order decides, and no negative z-index is needed. */}
          <div className="relative flex flex-col items-center">
            <CategoryBadge category={svc.category} />

            <h1 className="m-0 mt-6 text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-charcoal">
              {parseHeadline(svc.hero.headline, 'font-serif italic')}
            </h1>

            {/* mx-auto, not just text-center: globals.css caps every `main p` at
                72ch, and a capped block with default margins hugs the left edge —
                text-align only centres the text inside that narrower box. */}
            <p className="m-0 mx-auto mt-6 max-w-[38rem] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-body">
              {svc.hero.body}
            </p>

            <div className="mt-8">
              <PillTags items={svc.perks.map((perk) => perk.title)} label={`${svc.name} inclusions`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
