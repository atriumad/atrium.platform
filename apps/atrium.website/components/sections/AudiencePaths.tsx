'use client'

import { Eyebrow } from '@atrium/ui'
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
        {/* Headline left, the qualifier beside it — the same two-column opener
            every other section on the page uses. The decorative portrait that
            used to sit here was the page's last Cloudinary asset, and it broke
            the grid as badly as it broke the visual: a tall box hanging off the
            right edge with nothing under it. */}
        <div className="mb-14 grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:items-end lg:gap-16 md:mb-20">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">Built for your stage</Eyebrow>
            <h2 className="max-w-[13ch] text-[clamp(2.6rem,4.5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em]">
              Different footprint. <em className="font-serif italic">Different first move.</em>
            </h2>
          </div>
          <p className="m-0 max-w-md text-base leading-relaxed text-muted lg:col-span-5">
            A single dining room, a regional group, and a national rollout should not enter through the same scope. Start with the operating problem that matches your footprint.
          </p>
        </div>

        <div className="border-y border-line">
          {paths.map((path, index) => (
            <TransitionLink
              key={path.label}
              href={path.href}
              className="group grid gap-7 border-b border-line py-9 no-underline last:border-b-0 md:grid-cols-[10rem_minmax(0,0.8fr)_minmax(0,1.2fr)_14rem] md:items-center md:gap-10 md:py-11"
            >
              {/* nowrap and a column wide enough for the longest count: at the
                  old size "3–10" broke over two lines, which doubled that row's
                  height and knocked its copy out of line with the other two. */}
              <p className="m-0 whitespace-nowrap font-serif text-[clamp(3rem,4.6vw,4.75rem)] font-normal leading-none tracking-[-0.05em] text-charcoal">
                {path.count}
              </p>
              <div>
                <Eyebrow>Path {String(index + 1).padStart(2, '0')}</Eyebrow>
                <h3 className="mt-3 text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.15] text-charcoal">
                  {path.label}
                </h3>
              </div>
              <div>
                <p className="m-0 max-w-xl text-base leading-relaxed text-body">{path.tension}</p>
                <p className="mt-3 text-[0.875rem] text-charcoal">{path.outcome}</p>
              </div>
              <span className="inline-flex items-center justify-between gap-3 whitespace-nowrap text-[0.875rem] text-charcoal">
                <span>{path.cta}</span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true">→</span>
              </span>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  )
}
