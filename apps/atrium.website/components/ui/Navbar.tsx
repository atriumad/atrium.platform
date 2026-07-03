'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Button from './Button'

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons: Record<string, React.ReactNode> = {
  gem: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 6L8 14L13 6L10.5 2H5.5L3 6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 6H13M5.5 2L8 6L10.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  camera: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 5V4C5.5 3.4 6 3 6.5 3H9.5C10 3 10.5 3.4 10.5 4V5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  grid: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  chat: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2H14C14.6 2 15 2.4 15 3V10C15 10.6 14.6 11 14 11H5L1 15V3C1 2.4 1.4 2 2 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  target: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  ),
  search: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10 6H15L11 9L12.5 14.5L8 11.5L3.5 14.5L5 9L1 6H6L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  sparkle: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1V4M8 12V15M1 8H4M12 8H15M3.5 3.5L5.5 5.5M10.5 10.5L12.5 12.5M12.5 3.5L10.5 5.5M5.5 10.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  mail: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 4L8 9L15 4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 13C1 10.8 3 9 5.5 9S10 10.8 10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13C13 11.3 12 10 11 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 14H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="2" y="8" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6.5" y="4" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="1" width="3" height="13" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
}

// ─── Service data ──────────────────────────────────────────────────────────────
const leftGroup = {
  label: 'Generate Demand',
  services: [
    { label: 'Brand Strategy & Creative Direction', href: '/services/brand-strategy', desc: 'Identity, voice, and visual system', icon: 'gem' },
    { label: 'Film & Photo Production', href: '/services/film-photo', desc: 'Cinematic content for every channel', icon: 'camera' },
    { label: 'Social Content', href: '/services/social-content', desc: 'Scroll-stopping creative at scale', icon: 'grid' },
    { label: 'Social Media Management', href: '/services/social-management', desc: 'Always-on channel management', icon: 'chat' },
    { label: 'Paid Media Strategies', href: '/services/paid-media', desc: 'Campaigns that drive real revenue', icon: 'target' },
  ],
}

const rightGroups = [
  {
    label: 'Convert Demand',
    services: [
      { label: 'Google & Local SEO', href: '/services/google-seo', desc: 'Dominate local search and maps', icon: 'search' },
      { label: 'Reputation Management & Reviews', href: '/services/reputation', desc: 'Turn reviews into a growth engine', icon: 'star' },
      { label: 'Experiential & Collabs', href: '/services/experiential', desc: 'Events and partnerships that convert', icon: 'sparkle' },
    ],
  },
  {
    label: 'Retain Demand',
    services: [
      { label: 'Email & SMS Marketing', href: '/services/email-sms', desc: 'Direct channels that retain guests', icon: 'mail' },
      { label: 'CRM & Loyalty', href: '/services/crm-loyalty', desc: 'Systems that bring guests back', icon: 'users' },
      { label: 'Analytics & Reporting', href: '/services/analytics', desc: 'One dashboard. Everything visible.', icon: 'chart' },
    ],
  },
]

const otherLinks = [
  { label: 'Our Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
]

// ─── Service item ──────────────────────────────────────────────────────────────
function ServiceItem({
  svc,
  onClose,
}: {
  svc: { label: string; href: string; desc: string; icon: string }
  onClose: () => void
}) {
  return (
    <Link
      href={svc.href}
      onClick={onClose}
      className="flex items-start gap-3 group rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-white/5"
      style={{ color: 'var(--color-surface)' }}
    >
      <span
        className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[rgba(181,242,219,0.18)]"
        style={{
          background: 'rgba(181,242,219,0.09)',
          color: 'var(--color-accent)',
        }}
      >
        {icons[svc.icon]}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium leading-tight group-hover:opacity-70 transition-opacity">
          {svc.label}
        </span>
        <span className="text-xs leading-tight" style={{ color: 'var(--color-surface)', opacity: 0.4 }}>
          {svc.desc}
        </span>
      </span>
    </Link>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [bgOpacity, setBgOpacity] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const heroH = window.innerHeight
        setBgOpacity(Math.min(window.scrollY / heroH, 1))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const onEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const onLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 140)
  }
  const close = () => setOpen(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14 transition-shadow duration-300"
      style={{
        background: `rgba(7,47,52,${bgOpacity})`,
        backdropFilter: bgOpacity > 0.05 ? `blur(${Math.round(bgOpacity * 14)}px)` : 'none',
        WebkitBackdropFilter: bgOpacity > 0.05 ? `blur(${Math.round(bgOpacity * 14)}px)` : 'none',
        borderBottom: bgOpacity > 0.3 ? `1px solid rgba(228,238,240,${bgOpacity * 0.08})` : '1px solid transparent',
        boxShadow: bgOpacity > 0.6 ? `0 1px 24px rgba(4,32,36,${bgOpacity * 0.4})` : 'none',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <img
          src="/logos/atrium-wordmark.svg"
          alt="Atrium"
          style={{ height: '24px', width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onFocus={onEnter}
          onBlur={onLeave}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-surface)' }}
        >
          Services
          <svg
            aria-hidden="true"
            focusable="false"
            width="10" height="6" viewBox="0 0 10 6" fill="none"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ opacity: 0.5 }}
          >
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {otherLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="relative text-sm font-medium transition-opacity hover:opacity-70 after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px after:bg-[var(--color-accent)] after:transition-all after:duration-300 hover:after:w-full"
            style={{ color: 'var(--color-surface)' }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Button href="/contact" variant="primary" className="text-xs px-4 py-2">
        Let&apos;s Talk
      </Button>

      {/* ── Mega menu — absolute child of fixed header = full-width ── */}
      <div
        className={`absolute left-0 right-0 top-full transition-all duration-200 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        role="menu"
      >
        <div className="flex justify-center px-6 pt-2 pb-6">
          <div
            className="w-full max-w-5xl rounded-2xl overflow-hidden flex shadow-2xl border"
            style={{
              background: 'var(--color-primary)',
              borderColor: 'var(--color-border-subtle)',
              boxShadow: '0 24px 80px rgba(4,32,36,0.7)',
            }}
          >
            {/* Left feature panel */}
            <div
              className="flex flex-col justify-between p-8 w-[248px] flex-shrink-0"
              style={{ background: 'var(--color-primary-900)' }}
            >
              <div>
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--color-accent)', opacity: 0.65 }}
                >
                  11 disciplines
                </span>
                <h2
                  className="mt-4 text-[1.6rem] font-medium leading-snug"
                  style={{ color: 'var(--color-surface)' }}
                >
                  Smart creative.{' '}
                  <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontStyle: 'italic' }}>
                    Full spectrum.
                  </em>
                </h2>
                <p
                  className="mt-4 text-xs leading-relaxed"
                  style={{ color: 'var(--color-surface)', opacity: 0.4 }}
                >
                  From brand strategy to CRM — one team, no hand-offs, no explaining yourself twice.
                </p>
              </div>

              <Link
                href="/services"
                onClick={close}
                className="mt-8 inline-flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-70 w-fit"
                style={{ color: 'var(--color-accent)' }}
              >
                Explore all services
                <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Right columns */}
            <div className="flex flex-1 divide-x" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {/* Generate Demand */}
              <div className="flex-1 p-6 flex flex-col gap-1">
                <p
                  className="text-[10px] uppercase tracking-widest font-semibold mb-4"
                  style={{ color: 'var(--color-accent)', opacity: 0.55 }}
                >
                  {leftGroup.label}
                </p>
                {leftGroup.services.map((svc) => (
                  <ServiceItem key={svc.href} svc={svc} onClose={close} />
                ))}
              </div>

              {/* Convert + Retain stacked */}
              <div className="flex-1 p-6 flex flex-col">
                {rightGroups.map((group, gi) => (
                  <div
                    key={group.label}
                    className={gi > 0 ? 'mt-5 pt-5 border-t' : ''}
                    style={{ borderColor: 'var(--color-border-subtle)' }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-widest font-semibold mb-4"
                      style={{ color: 'var(--color-accent)', opacity: 0.55 }}
                    >
                      {group.label}
                    </p>
                    <div className="flex flex-col gap-1">
                      {group.services.map((svc) => (
                        <ServiceItem key={svc.href} svc={svc} onClose={close} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
