// ─── CTA system (doc vs.md §13) ─────────────────────────────────────────────
// Single source of truth for the three-tier CTA hierarchy. Replaces the generic
// "Let's Talk" that led only to email. `primary.href` points at /contact today;
// once the qualified form + diagnostic booking (Fase 1) land, only this changes.

export type Cta = {
  label: string
  href: string
  external?: boolean
}

export const CTA = {
  // High-intent — the commercial next step.
  primary: {
    label: 'Book a Growth Diagnostic',
    href: '/contact',
  },
  // Proof — send the visitor to real client outcomes.
  proof: {
    label: 'See Client Results',
    href: '/work',
  },
  // Low-intent — for visitors not ready to talk yet.
  lowIntent: {
    label: 'Check My Growth Score',
    href: 'https://atrium-grader.vercel.app',
    external: true,
  },
} satisfies Record<string, Cta>
