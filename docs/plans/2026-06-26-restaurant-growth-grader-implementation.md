# Restaurant Growth Grader Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Atrium's restaurant growth grader as a public diagnostic flow backed by reusable application-layer scoring logic.

**Architecture:** The grader logic lives in `packages/application/src/diagnostics`. The public diagnostic product lives in its own Next.js app at `apps/grader`, with thin route handlers for open business-data lookup and report generation. The authenticated webapp stays in `apps/web`.

**Tech Stack:** Bun test, TypeScript, Next.js App Router, React, Tailwind CSS, existing monorepo packages.

---

### Task 1: Application Diagnostic Engine

**Files:**
- Create: `packages/application/src/diagnostics/restaurant-growth-grader.test.ts`
- Create: `packages/application/src/diagnostics/restaurant-growth-grader.ts`
- Modify: `packages/application/src/index.ts`

**Step 1: Write failing tests**

Test that the grader:
- returns an overall score from weighted sub-scores,
- identifies missing conversion paths as a high-priority issue,
- creates a reputation recommendation when rating is weak,
- rejects invalid input.

**Step 2: Run failing test**

Run:

```bash
bun test packages/application/src/diagnostics/restaurant-growth-grader.test.ts
```

Expected: fail because the module does not exist.

**Step 3: Implement minimal engine**

Create types for profile input, sub-scores, issues, recommendations, and report output. Implement deterministic scoring with weighted sub-scores.

**Step 4: Verify**

Run:

```bash
bun test packages/application/src/diagnostics/restaurant-growth-grader.test.ts
```

Expected: pass.

### Task 2: Grader API Route

**Files:**
- Create: `apps/grader/app/api/grader/route.test.ts`
- Create: `apps/grader/app/api/grader/route.ts`
- Create: `apps/grader/app/api/grader/search/route.test.ts`
- Create: `apps/grader/app/api/grader/search/route.ts`
- Create: `apps/grader/lib/open-data-places.ts`

**Step 1: Write failing route tests**

Test that:
- a known demo business returns a report,
- an unknown business returns 404,
- missing business id returns 400.

**Step 2: Run failing test**

Run:

```bash
bun test apps/grader/app/api/grader/route.test.ts apps/grader/app/api/grader/search/route.test.ts
```

Expected: fail because the route does not exist.

**Step 3: Implement route**

Use OpenStreetMap/Nominatim for restaurant search and lookup, Overpass for nearby competitor signals, optional manual reputation inputs, and a lightweight website scan for conversion signals. Keep the route thin: parse JSON, load the profile, call `gradeRestaurantGrowth`, return JSON.

**Step 4: Verify**

Run:

```bash
bun test apps/grader/app/api/grader/route.test.ts apps/grader/app/api/grader/search/route.test.ts
```

Expected: pass.

### Task 3: Public Grader UI

**Files:**
- Create: `apps/grader/app/grader-client.tsx`
- Create: `apps/grader/app/page.tsx`

**Step 1: Implement page**

Build a public first-screen grader:
- restaurant search/select,
- scan progress states,
- result panel,
- overall score,
- four sub-scores,
- issues,
- opportunities,
- recommendations,
- CTA for full report/strategy review.

**Step 2: Verify manually**

Start the grader dev server and open its root URL:

```bash
bun run dev:grader
```

Expected: the user can search/select a real restaurant and receive a report.

### Task 4: Quality Checks

Run:

```bash
bun test packages/application/src/diagnostics/restaurant-growth-grader.test.ts apps/grader/app/api/grader/route.test.ts apps/grader/app/api/grader/search/route.test.ts
bun run typecheck
bun run lint
```

Expected:
- new tests pass,
- typecheck passes,
- lint passes.

If running the full test suite, use:

```bash
bun test --timeout 20000
```

because the existing bcrypt cost-12 tests can exceed Bun's default timeout.
