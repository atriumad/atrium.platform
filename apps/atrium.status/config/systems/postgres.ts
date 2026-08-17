import type { SystemDefinition } from "@/lib/health/types"

export const postgres: SystemDefinition = {
  id: "postgres",
  name: "Postgres (Prisma)",
  category: "infrastructure",
  criticality: "low",
  workspace: "@atrium/infrastructure",
  summary: "Schema, repositories and mappers exist. No app calls them yet.",
  overview: `The persistence layer of the hexagonal architecture: Prisma schema, repositories,
mappers and a dev-safe client that survives HMR. It is fully tested (51 tests) and completely
unused — neither Next app opens a connection today.

That makes it low criticality right now and high leverage later: auth, saved grader scans and
anything multi-user land here when they land.`,
  sections: [
    {
      title: "Why it is dormant",
      body: `The website is static and the grader is stateless — a scan is computed, returned and
forgotten (\`GRADER_SCAN_STORE=file\` writes evidence to \`.tmp/\` in non-production only). Nothing
has needed durable storage yet, so the adapter exists ahead of its first consumer.`,
    },
    {
      title: "First things that will need it",
      body: `- Grader scan history, so a restaurant can be re-scanned and compared over time.
- A durable rate limiter and spend guard, replacing the in-memory counters.
- Anything with accounts: \`packages/application\` already holds RegisterOwner and AuthenticateUser use cases with 79 passing tests.`,
    },
  ],
  runbook: [
    {
      symptom: "Migrations fail locally",
      check: "DATABASE_URL and DIRECT_URL in packages/infrastructure/.env.",
      fix: "bun run db:generate then bun run db:migrate from the repo root.",
    },
  ],
  env: [
    {
      name: "DATABASE_URL",
      where: "packages/infrastructure/.env",
      purpose: "Pooled Prisma connection.",
      status: "set",
    },
    {
      name: "DIRECT_URL",
      where: "packages/infrastructure/.env",
      purpose: "Direct connection for migrations.",
      status: "set",
    },
  ],
  entryPoints: [
    { label: "Prisma client", path: "packages/infrastructure/src/client.ts" },
    { label: "Repositories", path: "packages/infrastructure/src/repositories" },
  ],
  monitors: [
    {
      id: "postgres-connection",
      label: "Database connection",
      meaning: "Nothing user-facing yet — no app reads or writes.",
      url: "postgres://",
      enabled: false,
      disabledReason:
        "No HTTP surface to probe and no consumer to break. Turn this on when the first app opens a connection.",
    },
  ],
  tags: ["prisma", "dormant"],
}
