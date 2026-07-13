# Editorial Value Metrics Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn every value-metric section into a prominent editorial proof point across the Atrium marketing site.

**Architecture:** Keep metric data and page composition unchanged while redesigning the four existing renderers that own metric presentation. Use the current Atrium tokens, serif display face, Tailwind utilities, and GSAP setup so the new system adds no dependency or parallel styling layer.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, GSAP 3.

---

### Task 1: Amplify the homepage metric strip

**Files:**
- Modify: `apps/atrium.website/components/sections/StatsStrip.tsx`

**Step 1: Add editorial section framing**

Add a compact eyebrow and a large two-line heading above the metrics. Use existing CSS variables and keep the component API unchanged.

**Step 2: Replace the equal-column layout**

Render each metric as a divider-separated editorial row. Pair a responsive `clamp()` numeral with its explanation and alternate their desktop placement while preserving number-first DOM order.

**Step 3: Refine entrance choreography**

Animate section framing, dividers, labels, and numerals as one restrained sequence. Ensure inline defaults leave content visible before GSAP initializes.

**Step 4: Typecheck**

Run: `bun run typecheck --filter=@atrium/website`

Expected: TypeScript exits successfully.

### Task 2: Bring service metrics into the same family

**Files:**
- Modify: `apps/atrium.website/components/services/ServiceStatsEditorial.tsx`

**Step 1: Add service-specific framing**

Introduce a proof-oriented eyebrow and heading using the dark Atrium surface.

**Step 2: Apply the editorial row system**

Use the same scale hierarchy, horizontal rules, and responsive ordering as the homepage while keeping the mint-on-teal service variant.

**Step 3: Align motion behavior**

Use the shared class hooks and GSAP sequence conventions from the homepage component.

**Step 4: Typecheck**

Run: `bun run typecheck --filter=@atrium/website`

Expected: TypeScript exits successfully.

### Task 3: Make case-study results the climax

**Files:**
- Modify: `apps/atrium.website/app/work/[slug]/page.tsx`

**Step 1: Strengthen the results introduction**

Keep the existing takeaway and heading semantics, but expand their scale contrast and spacing.

**Step 2: Replace the three-column metric grid**

Render metrics as full-width divider rows with monumental numerals and compact explanatory copy. Support long metric lists without crowding.

**Step 3: Verify static rendering**

Run: `bun run build --filter=@atrium/website`

Expected: all case-study routes compile successfully.

### Task 4: Remove timid hero stat cards

**Files:**
- Modify: `apps/atrium.website/components/pages/PageHero.tsx`

**Step 1: Replace cards with ruled rows**

Remove rounded containers and translucent card fills. Use large serif values, thin rules, and compact labels so secondary-page hero statistics echo the primary system.

**Step 2: Check all hero consumers**

Run: `bun run typecheck --filter=@atrium/website`

Expected: about, contact, pricing, process, resources, work index, and case-study pages compile without prop changes.

### Task 5: Visual and repository verification

**Files:**
- Modify after code changes: `graphify-out/*` via the graph update command.

**Step 1: Run lint and type checks**

Run: `bun run lint --filter=@atrium/website`

Expected: no new Biome errors in touched files.

Run: `bun run typecheck --filter=@atrium/website`

Expected: TypeScript exits successfully.

**Step 2: Inspect representative routes**

Capture desktop and 390px views of `/`, `/services/email-sms`, `/work/taco-naco`, and one secondary page using `PageHero`. Confirm scale, overflow, contrast, dividers, and mobile ordering.

**Step 3: Update the knowledge graph**

Run: `graphify update .`

Expected: the graph updates successfully and reflects the changed component relationships.

