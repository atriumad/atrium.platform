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
      className="flex gap-3 items-start px-2 py-2 -mx-2 rounded-lg transition-colors group hover:bg-white/5"
      style={{ color: 'var(--color-surface)' }}
    >
      <span
        className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[color-mix(in_srgb,var(--mint-400)_18%,transparent)]"
        style={{
          background: 'color-mix(in srgb, var(--mint-400) 9%, transparent)',
          color: 'var(--color-accent)',
        }}
      >
        {icons[svc.icon]}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium leading-tight transition-opacity group-hover:opacity-70">
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
  const [mobileOpen, setMobileOpen] = useState(false)
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const onEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const onLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 140)
  }
  const close = () => setOpen(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full z-50 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-6 md:px-12 h-14"
      style={{
        borderBottom: bgOpacity > 0.3 ? `1px solid color-mix(in srgb, var(--cloud-300) ${bgOpacity * 8}%, transparent)` : '1px solid transparent',
        boxShadow: bgOpacity > 0.6 ? `0 1px 24px color-mix(in srgb, var(--teal-900) ${bgOpacity * 40}%, transparent)` : 'none',
      }}
    >
      {/* Blur backdrop — separate element so it doesn't make header a fixed containing block */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 transition-opacity duration-300"
        style={{
          background: `color-mix(in srgb, var(--teal-800) ${bgOpacity * 100}%, transparent)`,
          /* Intentionally dynamic (animates 0→14px with scroll); peak tracks --blur-lg (18px) loosely. Kept literal because it's scroll-driven, not a static tier. */
          backdropFilter: bgOpacity > 0.05 ? `blur(${Math.round(bgOpacity * 14)}px)` : 'none',
          WebkitBackdropFilter: bgOpacity > 0.05 ? `blur(${Math.round(bgOpacity * 14)}px)` : 'none',
        }}
      />
      {/* Logo */}
      <Link href="/" className="flex justify-self-start items-center">
        <img
          src="/logos/atrium-wordmark.svg"
          alt="Atrium"
          style={{ height: '24px', width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </Link>

      {/* Nav links — centered column */}
      <nav className="hidden gap-8 justify-self-center items-center md:flex">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onFocus={onEnter}
          onBlur={onLeave}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="flex gap-1 items-center text-sm font-medium transition-opacity hover:opacity-70"
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

      {/* Right column — CTA on desktop, menu toggle on mobile */}
      <div className="flex gap-4 justify-end justify-self-end items-center">
        <div className="hidden md:flex">
          <Button href="/contact" variant="ghostLight" className="px-4 py-2 text-xs">
            Let&apos;s Talk
          </Button>
        </div>

        {/* Mobile menu toggle — icon-only, morphs into an X when open */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex justify-center items-center -mr-1.5 w-11 h-11 md:hidden"
          style={{ color: 'var(--color-surface)' }}
        >
          <span
            className="relative flex-shrink-0 w-4 h-4"
            style={{ color: 'var(--color-accent)' }}
          >
            <span
              className={`absolute left-0 top-1/2 w-full h-px transition-transform duration-200 ${mobileOpen ? 'rotate-45' : '-translate-y-[3px]'}`}
              style={{ background: 'currentColor' }}
            />
            <span
              className={`absolute left-0 top-1/2 w-full h-px transition-transform duration-200 ${mobileOpen ? '-rotate-45' : 'translate-y-[3px]'}`}
              style={{ background: 'currentColor' }}
            />
          </span>
        </button>
      </div>

      {/* Backdrop — dims and blurs the page while the services mega menu is open */}
      <div
        aria-hidden="true"
        onMouseEnter={close}
        className={`fixed inset-0 -z-10 transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'color-mix(in srgb, var(--teal-900) 55%, transparent)',
          backdropFilter: 'blur(var(--blur-md))',
          WebkitBackdropFilter: 'blur(var(--blur-md))',
        }}
      />

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
            className="flex overflow-hidden w-full max-w-5xl rounded-[var(--radius-lg)] border"
            style={{
              background: 'var(--color-primary)',
              borderColor: 'var(--color-border-subtle)',
              boxShadow: 'var(--shadow-dark)',
            }}
          >
            {/* Left feature panel — Growth Grader promo */}
            <div
              className="flex flex-col justify-between p-8 w-[248px] flex-shrink-0"
              style={{ background: 'var(--color-primary-900)' }}
            >
              <div>
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--color-accent)', opacity: 0.65 }}
                >
                  Free tool
                </span>
                <h2
                  className="mt-4 text-[1.6rem] font-medium leading-snug"
                  style={{ color: 'var(--color-surface)' }}
                >
                  Know your score.{' '}
                  <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontStyle: 'italic' }}>
                    In 2 minutes.
                  </em>
                </h2>
                <p
                  className="mt-4 text-xs leading-relaxed"
                  style={{ color: 'var(--color-surface)', opacity: 0.4 }}
                >
                  The Atrium Growth Grader scores your Google presence, website, and social — then shows you exactly what&apos;s leaking revenue.
                </p>
              </div>

              <a
                href="https://atrium-grader.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="inline-flex gap-2 items-center mt-8 text-xs font-medium transition-opacity hover:opacity-70 w-fit"
                style={{ color: 'var(--color-accent)' }}
              >
                Try the Growth Grader
                <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Right columns */}
            <div className="flex flex-1 divide-x" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {/* Generate Demand */}
              <div className="flex flex-col flex-1 gap-1 p-6">
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
              <div className="flex flex-col flex-1 p-6">
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

      {/* Mobile full-screen panel */}
      <div
        className={`md:hidden fixed inset-0 top-14 overflow-y-auto transition-opacity duration-200 ease-out ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'var(--color-primary)' }}
        role="menu"
      >
        <div className="flex flex-col gap-8 px-6 pt-8 pb-10">
          <div
            className="flex flex-col gap-4 pb-6 border-b"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {otherLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="text-lg font-medium"
                style={{ color: 'var(--color-surface)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p
              className="text-[10px] uppercase tracking-widest font-semibold mb-3"
              style={{ color: 'var(--color-accent)', opacity: 0.55 }}
            >
              {leftGroup.label}
            </p>
            {leftGroup.services.map((svc) => (
              <ServiceItem key={svc.href} svc={svc} onClose={closeMobile} />
            ))}
          </div>

          {rightGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p
                className="text-[10px] uppercase tracking-widest font-semibold mb-3"
                style={{ color: 'var(--color-accent)', opacity: 0.55 }}
              >
                {group.label}
              </p>
              {group.services.map((svc) => (
                <ServiceItem key={svc.href} svc={svc} onClose={closeMobile} />
              ))}
            </div>
          ))}

          <Button href="/contact" variant="primary" onClick={closeMobile} className="justify-center px-4 py-3 w-full text-xs">
            Let&apos;s Talk
          </Button>
        </div>
      </div>
    </header>
  )
}
