# Agent-Led Decision Report Design

## Context

The grader should stay public and lightweight: no Google Business Profile OAuth, no owner-only analytics, and no private performance data. Google Places and ScrapeCreators remain the external data sources.

The enriched data is not primarily for the final UI. Its job is to improve the agent's decision quality before the customer sees the report. The customer-facing report should be shorter, more decisive, and more direct than the current panel-heavy version.

## Decision

Use an agent-led report model.

The system should collect richer Google Places and ScrapeCreators evidence, compress that evidence into an internal decision context, ask the agent to identify the most important growth leak, then render a focused final report around that decision.

## Product Shape

The final report should read like a consultant's short diagnostic memo, not a dashboard.

Primary hierarchy:

1. Restaurant identity, score, and one sharp agent headline.
2. The growth leak: what is causing demand to leak.
3. Why it matters: operational and revenue consequence.
4. First move: the action closest to revenue.
5. 30-day plan: three ordered actions.
6. Score categories: compact supporting context.
7. Audit details: collapsible evidence and data-quality notes.

The user should not have to parse raw provider output, field masks, source limitations, or every diagnostic step before understanding the recommendation.

## Data Model

Add an internal `AgentEvidenceContext` around the existing report-agent flow. This context is not a public UI contract. It should summarize provider evidence in decision-oriented groups:

- `listing`: Google listing completeness, category, service model, hours, price, Google Maps URI, amenities.
- `market`: nearby competitors, rating/review averages, relative position, benchmark gaps.
- `website`: menu, ordering, reservations, phone, schema, Lighthouse/PageSpeed summaries.
- `reputation`: rating, review count, estimated negative review pressure, review confidence.
- `social`: detected platforms, posting cadence, recency, engagement, profile completeness, strongest channel.
- `decisionInputs`: existing scores, issues, recommendations, missing data, confidence.

The agent output should become more decision-oriented:

- `headline`
- `primaryLeak`
- `rootCause`
- `whyItMatters`
- `firstMove`
- `thirtyDayPlan`
- `evidenceHighlights`
- `scoreInterpretations`

## Provider Scope

Google Places API-key data:

- Current profile fields remain.
- Add richer Place Details fields where cost is acceptable: primary type, Google Maps URI, price, regular/current hours, service attributes, amenity attributes, editorial/review summary when enabled.
- Add Nearby/Text Search benchmark as the main path to real local context.

ScrapeCreators API-key data:

- Keep profile and posts lookups.
- Improve derived social evidence: post count in the last 30 days, newest post age, average engagement, strongest platform, missing profile basics, and top evidence snippets.
- Do not show every raw social field in the UI.

GBP:

- Explicitly out of scope for this grader iteration.

## UI Direction

The current report uses several large panels with similar visual weight. Replace that with a single decision path.

Use Tailwind-first composition in `grader-client.tsx`, while preserving Atrium's visual line: teal/mint/amber palette, Inter Tight, editorial serif emphasis, restrained motion, and the existing brand lockup.

The final report should use:

- A compact hero with score and headline.
- A prominent "Growth leak" section.
- A clear "First move" CTA/plan module.
- Score cards in a compact row.
- Evidence hidden behind a disclosure or lower-priority audit section.
- Data-quality copy at the bottom, not in the hero.

Motion should serve comprehension: short entrance, hover/press feedback, and disclosure transitions only. Avoid ambient or repeated animation in the report.

## Error Handling

If enriched provider data fails, the grader should still return a report from the available baseline data. Missing enriched fields should become agent evidence limitations, not UI-breaking errors.

The agent must be instructed not to invent market position, social engagement, or revenue impact when evidence is missing.

## Success Criteria

- The agent receives richer, structured evidence than the customer sees.
- The report's first viewport communicates the main decision without scrolling.
- The UI has a clear hierarchy: diagnosis first, evidence second.
- The implementation keeps Google-only business data and ScrapeCreators social data.
- Tests cover enriched evidence extraction, agent prompt/schema behavior, report merging, and UI rendering fallbacks.
