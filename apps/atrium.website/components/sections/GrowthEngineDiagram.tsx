import { Eyebrow } from '@atrium/ui'
import Image from 'next/image'
import { caseStudies } from '@/lib/work'

// ─── Atrium Growth Engine (doc vs.md §2.1 / §5 / §7.5) ──────────────────────
// Generate → Convert → Retain, read as three cards rather than a rail. Each
// one is a picture with a caption strip; hovering fills the strip with lime
// and opens it to the copy underneath, so the section is scannable at rest and
// explains itself on demand.
//
// The serif accent falls on `rest`, not `lead`: across the site the sans sets
// up and the italic delivers, so the stress belongs on what the stage produces
// — demand, interest, the guest — not on the verb, which is the generic half.
export const stages = [
  {
    n: '01',
    id: 'Generate',
    // Consumed by app/services/page.tsx for its stage markers.
    dot: 'var(--stage-generate)',
    lead: 'Generate',
    rest: 'demand',
    tagline: 'Create awareness and desire.',
    caps: ['Film & Photo', 'Social', 'Paid Media'],
  },
  {
    n: '02',
    id: 'Convert',
    // Consumed by app/services/page.tsx for its stage markers.
    dot: 'var(--stage-convert)',
    lead: 'Convert',
    rest: 'interest',
    tagline: 'Turn interest into reservations.',
    caps: ['Google & Local SEO', 'Reputation', 'Offers & Campaigns'],
  },
  {
    n: '03',
    id: 'Retain',
    // Consumed by app/services/page.tsx for its stage markers.
    dot: 'var(--stage-retain)',
    lead: 'Retain',
    rest: 'the guest',
    tagline: 'Bring guests back.',
    caps: ['Email & SMS', 'CRM & Loyalty', 'Win-back Flows'],
  },
]

export default function GrowthEngineDiagram() {
  // Only the clients served from our own CDN, and only their absolute URLs:
  // everyone else still points at the disabled Cloudinary account, and
  // next/image cannot take a bare public ID. next-cloudinary's CldImage would
  // pull client-only code into this server component.
  const covers = ['taco-naco', 'taha', 'taco-naco']
    .map((slug, i) => {
      const gallery = caseStudies.find((c) => c.slug === slug)?.galleryIds ?? []
      return gallery.filter((id) => /^https?:\/\//i.test(id))[i === 2 ? 6 : 1]
    })
    .filter(Boolean)

  return (
    <section className="bg-dark px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-14 grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6" tone="on-dark">
              The Atrium Growth Engine
            </Eyebrow>
            <h2 className="max-w-[14ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
              Not eleven services. <em className="font-serif italic">One system.</em>
            </h2>
          </div>
          <p className="max-w-lg border-cream/20 border-t pt-6 text-base leading-relaxed text-cream/[0.78] lg:col-span-5">
            The services are just the components. What you buy is the engine that runs them — on a
            28-day cycle, measured end to end.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {stages.map((stage, i) => {
            const cover = covers[i]
            return (
              <article
                className="group relative aspect-[3/4] overflow-hidden rounded-card bg-charcoal"
                key={stage.id}
              >
                {cover && (
                  <Image
                    alt=""
                    className="object-cover transition-transform duration-700 ease-atrium group-hover:scale-[1.04]"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    src={cover}
                  />
                )}
                <span className="absolute top-5 left-5 z-10 font-serif text-[1.1rem] text-cream/70 italic">
                  {stage.n}
                </span>

                {/* Anchored to the bottom of a fixed-ratio card, so opening it
                    grows the panel up over the picture instead of making the
                    card taller — the row keeps one height at rest and hover. */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-cream p-6 transition-colors duration-300 group-hover:bg-lime md:p-7">
                  <h3 className="m-0 text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15] text-charcoal">
                    {stage.lead} <em className="font-serif italic">{stage.rest}</em>
                  </h3>

                  {/* 0fr → 1fr is the one height transition that works without
                      hardcoding a max-height that would clip longer copy. */}
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-atrium group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-charcoal/80">
                        {stage.tagline}
                      </p>
                      <p className="mt-2 text-[0.8125rem] text-charcoal/60">
                        {stage.caps.join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
