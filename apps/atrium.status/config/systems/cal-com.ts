import type { SystemDefinition } from "@/lib/health/types"

export const calCom: SystemDefinition = {
  id: "cal-com",
  name: "Cal.com booking",
  category: "third-party",
  criticality: "high",
  summary: "Every call-to-action on the site ends here. If it is down, inbound stops.",
  overview: `Booking is an embed, not a page we own. \`CalEmbedProvider\` lazy-loads the Cal script
only when a \`[data-cal-link]\` node exists, so most of the site never touches it — but every
conversion path does.

Two account handles currently coexist in the codebase, which is the real risk here: a working embed
pointing at the wrong calendar looks perfectly healthy from the outside.`,
  sections: [
    {
      title: "The two-account problem",
      body: `\`lib/cal.ts\` holds \`sergio-dev/*\` slugs with an in-file note calling them
placeholders on a personal account. \`lib/cta.ts\` links to \`cal.com/atrium-meet/30min\`. Both ship.
Whichever a visitor hits depends on which component rendered the CTA — so bookings can land in a
personal calendar with nothing broken to detect.

The monitor below watches the agency account, because that is the one that should exist.`,
    },
  ],
  runbook: [
    {
      symptom: "Booking widget does not open",
      check: "Cal.com status, then the browser console for a blocked script.",
      fix: "Nothing to deploy on our side. The CTAs remain visible; consider a mailto fallback if the outage is long.",
    },
    {
      symptom: "Bookings arriving on the wrong calendar",
      check: "lib/cal.ts vs lib/cta.ts — they name different accounts.",
      fix: "Pick one account, put it in lib/cal.ts, and have lib/cta.ts read from there.",
    },
  ],
  links: [{ label: "Cal.com status", href: "https://status.cal.com" }],
  monitors: [
    {
      id: "cal-booking-page",
      label: "Agency booking page",
      meaning: "Nobody can book a call — every CTA on the site dead-ends.",
      url: "https://cal.com/atrium-meet/30min",
      expectStatus: [200],
      degradedAboveMs: 3000,
      timeoutMs: 12_000,
    },
  ],
  tags: ["booking", "conversion"],
}
