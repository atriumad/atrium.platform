import type { SystemDefinition } from "@/lib/health/types"

export const llmProviders: SystemDefinition = {
  id: "llm-providers",
  name: "LLM providers",
  category: "third-party",
  criticality: "normal",
  summary: "OpenRouter, Anthropic or Google — whichever writes the grader's narrative.",
  overview: `One completion per scan turns the numbers into prose. \`GRADER_AI_PROVIDER\` picks the
provider at request time and each one needs its own key:

- \`openrouter\` — the default, model from \`GRADER_AI_MODEL\` (falls back to \`openrouter/free\`)
- \`google\` — gemini-2.0-flash
- \`anthropic\` — claude-haiku-4-5

The report is not blocked on it: if the completion fails, the narrative comes back null and the
scored report renders without prose.`,
  sections: [
    {
      title: "The anthropic path is a trap today",
      body: `\`ANTHROPIC_API_KEY\` is read at \`lib/report-agent.ts:156\` but exists in no \`.env\`
and no \`.env.example\`. Switching \`GRADER_AI_PROVIDER=anthropic\` therefore throws at model init,
the error is swallowed, and every report quietly loses its narrative. The failure looks like a
content problem, not a config problem.`,
    },
    {
      title: "Model choice is a cost lever",
      body: `\`GRADER_AI_MODEL\` is only consulted on the OpenRouter path, and its default is a free
model. Any paid model set there multiplies directly by scan volume, which is unbounded — the rate
limiter is per-process and the Google spend guard is off.`,
    },
  ],
  runbook: [
    {
      symptom: "Reports render but the narrative is missing",
      check: "GRADER_AI_PROVIDER, then the matching key, then the provider's own status page.",
      fix: "Set the key or switch back to openrouter. Nothing else in a scan depends on this.",
    },
  ],
  links: [
    { label: "OpenRouter status", href: "https://status.openrouter.ai" },
    { label: "Anthropic status", href: "https://status.anthropic.com" },
  ],
  monitors: [
    {
      id: "openrouter-models",
      label: "OpenRouter reachable",
      meaning: "The default narrative provider is unavailable.",
      url: "https://openrouter.ai/api/v1/models",
      expectStatus: [200],
      degradedAboveMs: 3000,
      timeoutMs: 12_000,
    },
  ],
  tags: ["ai", "grader"],
}
