'use client'

import { Eyebrow } from '@atrium/ui'
import CldImage from '@/components/media/CldImage'
import TransitionLink from '@/components/ui/TransitionLink'

const paths = [
  {
    count: '1',
    label: 'Independent restaurant',
    tension: 'Fill the room consistently without handing your voice to another generic agency.',
    outcome: 'Build a dependable local demand system.',
    href: '/pricing#foundation',
    cta: 'See the Foundation model',
  },
  {
    count: '3–10',
    label: 'Multi-location group',
    tension: 'Stop asking five operators and five vendors to execute one brand differently.',
    outcome: 'Run every location from one accountable system.',
    href: '/pricing#growth',
    cta: 'See the Growth model',
  },
  {
    count: '10+',
    label: 'Franchise or enterprise',
    tension: 'Keep national consistency while each market stays locally relevant and measurable.',
    outcome: 'Create a playbook that repeats without flattening the brand.',
    href: '/pricing#full-system',
    cta: 'See the Full System model',
  },
]

export default function AudiencePaths() {
  return (
    <section className="bg-cream px-[var(--gutter)] py-24 md:py-36">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-14 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16 md:mb-20">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <Eyebrow className="mb-6">Built for your stage</Eyebrow>
            <h2 className="max-w-[13ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em]">
              Different footprint. <em className="font-serif italic">Different first move.</em>
            </h2>
            <p className="mt-6 max-w-lg border-t border-line pt-6 text-base leading-relaxed text-muted">
              A single dining room, a regional group, and a national rollout should not enter through the same scope. Start with the operating problem that matches your footprint.
            </p>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:ml-auto lg:aspect-[4/5] lg:max-w-[22rem]">
              <CldImage
                publicId="v1784220815/AHAA_FEB13_CREATIVE_POST_PHOTO_3_juwr7s"
                alt=""
                fill
                sizes="(min-width: 1024px) 22rem, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="border-y border-line">
          {paths.map((path, index) => (
            <TransitionLink
              key={path.label}
              href={path.href}
              className="group grid gap-7 border-b border-line py-9 no-underline last:border-b-0 md:grid-cols-[8rem_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-10 md:py-11"
            >
              <p className="m-0 font-serif text-[clamp(4rem,7vw,7rem)] font-normal leading-none tracking-[-0.05em] text-ink">
                {path.count}
              </p>
              <div>
                <Eyebrow>Path {String(index + 1).padStart(2, '0')}</Eyebrow>
                <h3 className="mt-3 text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.15] text-ink">
                  {path.label}
                </h3>
              </div>
              <div>
                <p className="m-0 max-w-xl text-base leading-relaxed text-body">{path.tension}</p>
                <p className="mt-3 text-[0.875rem] font-medium text-ink">{path.outcome}</p>
              </div>
              <span className="inline-flex items-center gap-3 text-[0.875rem] font-medium text-ink">
                <span className="max-w-[10rem]">{path.cta}</span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true">→</span>
              </span>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  )
}
