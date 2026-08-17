import type { SystemDefinition } from "@/lib/health/types"

const SITE = process.env.NEXT_PUBLIC_CLIENT_CHWF_URL ?? ""

/**
 * The worked example for client systems. Every other client follows this shape:
 * one file, its own monitors, its own runbook. See `_template.ts`.
 */
export const clientChickInWaffle: SystemDefinition = {
  id: "client-chick-in-waffle",
  name: "Chick-in-Waffle",
  category: "client",
  criticality: "normal",
  owner: "Atrium — account team",
  summary: "Client case study with 44 assets on the CDN; site URL not yet registered here.",
  overview: `A full case study on the Atrium site (\`/work/chick-in-waffle\`) plus 44 photos and
reels staged under \`clients/CHWF/\` on the CDN. Media is served through
\`lib/case-assets.overrides.ts\`, which means this client is unaffected by the Cloudinary outage.`,
  sections: [
    {
      title: "Where the assets live",
      body: `\`public/clients/CHWF/{photos,reels}\` in the CDN workspace, published to
\`https://cdn.atriumad.com/clients/CHWF/\`. Run \`bun run manifest\` in \`apps/atrium.cdn\` to print
the delivery URLs, and \`--snippet\` to emit the record the website pastes into its overrides file.

Several filenames contain non-breaking spaces. They work, but only with exactly one round of
percent-encoding — this client is the reason that rule is documented on the CDN page.`,
    },
    {
      title: "Turning the site monitor on",
      body: `Set \`NEXT_PUBLIC_CLIENT_CHWF_URL\` to the client's production URL in the status app's
environment and the monitor below starts running on the next cron. Until then it is paused, and the
dashboard says so rather than showing a false green.`,
    },
  ],
  runbook: [
    {
      symptom: "Case-study media 404s on the Atrium site",
      check: "The CDN client-asset monitor first — it uses this client's folder shape.",
      fix: "Re-run the manifest and repaste the URLs; double-encoding is the usual cause.",
    },
  ],
  dependsOn: ["atrium-cdn", "atrium-website"],
  links: [{ label: "Case study", href: "https://atrium.agency/work/chick-in-waffle" }],
  monitors: SITE
    ? [
        {
          id: "chwf-home",
          label: "Client site",
          meaning: "The client's own site is unreachable.",
          url: SITE,
          expectStatus: [200],
          degradedAboveMs: 3000,
        },
      ]
    : [
        {
          id: "chwf-home",
          label: "Client site",
          meaning: "The client's own site is unreachable.",
          url: "https://example.invalid",
          enabled: false,
          disabledReason: "Set NEXT_PUBLIC_CLIENT_CHWF_URL to the client's production URL.",
        },
      ],
  tags: ["restaurant", "case-study"],
}
