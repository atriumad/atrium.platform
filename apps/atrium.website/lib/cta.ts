// ─── CTA system (doc vs.md §13) ─────────────────────────────────────────────
// Single source of truth for the CTA hierarchy. Conversion routes visitors OUT:
// the primary CTA books a call on Cal.com (high intent, low friction, captures
// the lead in Cal); email is the secondary fallback. No on-page lead form.

export type Cta = {
  label: string
  href: string
  external?: boolean
}

// External destinations — change these in one place.
export const CAL_URL = 'https://cal.com/atrium-meet/30min'
export const CONTACT_EMAIL = 'hello@atriumad.com'

export const CTA = {
  // High-intent — books the Growth Diagnostic call on Cal.com.
  primary: {
    label: "Let's Talk",
    href: CAL_URL,
    external: true,
  },
  // Proof — send the visitor to real client outcomes.
  proof: {
    label: 'See Client Results',
    href: '/work',
  },
  // Secondary fallback — for visitors who prefer to write.
  email: {
    label: 'Or email us',
    href: `mailto:${CONTACT_EMAIL}`,
  },
} satisfies Record<string, Cta>
