'use client'

import {
  ArrowUpRight,
  Clapperboard,
  Compass,
  HeartHandshake,
  LineChart,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Target,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { services } from '@/lib/services'
import TransitionLink from './TransitionLink'

const MENU_ICONS: Record<string, typeof Compass> = {
  Clapperboard,
  Compass,
  HeartHandshake,
  LineChart,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Target,
  Users,
}

// Column order + pill fill per category. Text colour is picked per fill so it
// clears 4.5:1 against it (computed, not eyeballed):
//   bg-lime   (#b5f2db) vs text-charcoal   -> 11.42:1
//   bg-amber  (#ffc933) vs text-charcoal   ->  9.34:1
//   bg-green  (#0e6e64) vs text-cream ->  5.32:1
// green-fill is no longer used here: against the brand palette it measures
// 3.49:1 with ink and 3.59:1 with cream, so it cannot carry a label either way.
const MENU_CATEGORIES = [
  { category: 'Generate Demand', pillClass: 'bg-lime text-charcoal' },
  { category: 'Convert Demand', pillClass: 'bg-amber text-charcoal' },
  { category: 'Retain Demand', pillClass: 'bg-green text-cream' },
] as const

const menuColumns = MENU_CATEGORIES.map(({ category, pillClass }) => ({
  category,
  pillClass,
  services: services.filter((svc) => svc.category === category),
}))

/** The full-bleed services menu, kept as its own component so it can run beside
 *  the Navbar's existing dropdown while the two are compared. It owns its
 *  state and its own trigger; the Navbar only places it. */
export default function MegaMenu({
  label = 'Menu test',
  textColor,
}: {
  label?: string
  /** Matches the Navbar's own links, which recolour with the header. */
  textColor?: string
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = () => setOpen(false)

  // A small delay on leave, so crossing the gap between trigger and panel
  // doesn't shut it.
  const onEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const onLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover bridge only; the keyboard path is the button's own focus and Escape
    <div className="flex h-14 items-center" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        aria-controls="mega-menu-test"
        aria-expanded={open}
        className="flex items-center gap-1 font-medium text-sm transition-opacity hover:opacity-70"
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        style={textColor ? { color: textColor } : undefined}
        type="button"
      >
        {label}
        <span
          aria-hidden="true"
          className={`text-[0.7rem] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {/* Scrim. Same treatment as the Navbar's own menu: it sits behind the
          header on -z-10 and closes on enter, so leaving the panel in any
          direction dismisses it. */}
      <div
        aria-hidden="true"
        className={`-z-10 fixed inset-0 transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onMouseEnter={close}
        style={{
          background: 'color-mix(in srgb, var(--teal-900) 32%, transparent)',
          backdropFilter: 'blur(var(--blur-md))',
          WebkitBackdropFilter: 'blur(var(--blur-md))',
        }}
      />

      {/* Full-bleed panel. It is a child of the fixed header, so left/right-0
          spans the viewport rather than this trigger. */}
      <div
        aria-label="Services"
        className={`absolute right-0 left-0 top-full transition-all duration-200 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : '-translate-y-2 pointer-events-none opacity-0'
        }`}
        id="mega-menu-test"
        ref={panelRef}
        role="menu"
      >
        <div className="border-line border-b bg-cream shadow-float">
          <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-3 gap-10 px-[var(--gutter)] py-12">
            {menuColumns.map((column) => (
              <div className="flex flex-col" key={column.category}>
                <TransitionLink
                  className={`mb-5 inline-flex w-fit items-center gap-1.5 self-start rounded-full px-3 py-1.5 font-semibold text-xs uppercase tracking-wide no-underline transition-opacity hover:opacity-85 ${column.pillClass}`}
                  href="/services"
                  onClick={close}
                  role="menuitem"
                >
                  {column.category}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                </TransitionLink>

                <div className="flex flex-col divide-y divide-line">
                  {column.services.map((svc) => {
                    const Icon = MENU_ICONS[svc.menu.icon]
                    return (
                      <TransitionLink
                        className="-mx-3 flex items-center gap-4 rounded-card-sm px-3 py-3.5 no-underline transition-colors hover:bg-ink/[0.04]"
                        href={`/services/${svc.slug}`}
                        key={svc.slug}
                        onClick={close}
                        role="menuitem"
                      >
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="font-medium text-charcoal text-sm leading-tight">
                            {svc.name}
                          </span>
                          <span className="text-muted text-xs leading-snug">{svc.menu.blurb}</span>
                        </span>
                        {Icon && (
                          <Icon
                            aria-hidden="true"
                            className="h-4 w-4 flex-shrink-0 text-muted"
                            strokeWidth={1.5}
                          />
                        )}
                      </TransitionLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
