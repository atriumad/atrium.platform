import type { SystemDefinition } from "@/lib/health/types"

/**
 * Copy this file to `config/systems/<id>.ts`, fill it in, and add one line to
 * `config/systems/index.ts`. Nothing else needs to change — the dashboard, the
 * system page, the cron, the uptime maths and /api/health all read the registry.
 *
 * Rules worth knowing before you start:
 * - `id` and every `monitors[].id` must be unique across the whole registry;
 *   monitor ids are the storage keys, so renaming one starts its history over.
 * - A monitor that cannot be checked is `enabled: false` **with** a
 *   `disabledReason`. A silent gap is worse than a documented one.
 * - `expectStatus` should describe what healthy looks like for that endpoint,
 *   not what a browser would like. A 405 on a POST-only route proves it is
 *   deployed and costs nothing.
 * - Write `meaning` from the user's side: what does someone lose when this
 *   check fails? That sentence is what shows up on the dashboard.
 */
export const templateSystem: SystemDefinition = {
  id: "template",
  name: "Template system",
  category: "client",
  criticality: "normal",
  summary: "One line — what this is, in the words you would use to a colleague.",
  overview: `A paragraph or three of markdown. What it is, why it exists, and the one thing a
newcomer would otherwise learn the hard way.`,
  sections: [
    {
      title: "A heading per topic",
      body: `Markdown. Lists, \`code\`, **bold**, links — all render. Keep each section about one
thing; the page is read by someone at 2am who needs one answer.`,
    },
  ],
  runbook: [
    {
      symptom: "What you would notice.",
      check: "Where to look first.",
      fix: "What actually resolves it.",
    },
  ],
  dependsOn: [],
  links: [{ label: "Production", href: "https://example.com" }],
  monitors: [
    {
      id: "template-home",
      label: "Homepage",
      meaning: "Nobody can reach the site.",
      url: "https://example.com",
      expectStatus: [200],
      degradedAboveMs: 2500,
      enabled: false,
      disabledReason: "Template — not a real system.",
    },
  ],
  tags: [],
}
