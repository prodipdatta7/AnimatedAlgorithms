# AGENTS.md — Agent Instruction & Repository Context Blueprint (Svelte Edition)

> **Project Name:** Segment Tree Interactive Studio
> **Tech Stack:** Svelte 5 (Runes), Vite, native SVG, `d3-hierarchy` (layout only), Svelte Motion (`tweened`/`spring`) + custom playback clock, Shiki (code highlighting), TypeScript, Tailwind CSS
> **Architecture Policy:** Pure Client-Side / Serverless (Zero Backend Infrastructure)
> **Target Audience for File:** Autonomous AI Coding Agents, LLMs, and Human Developers

---

## 1. Project Overview & Core Mission

This repository contains the **Segment Tree Interactive Studio**—a high-performance, web-based visual learning environment designed to help computer science students and competitive programmers master Segment Trees and Lazy Propagation.

### Primary Goal for AI Agents

When generating code, implementing components, or refactoring, AI Agents **must** follow the specifications in this document. All features must prioritize **purely client-side execution**, **zero backend dependencies**, **fluid visual feedback**, and **line-by-line C++ code synchronization**.

This is a **Svelte port of the same product spec** originally written for Angular. The business logic, modules, color semantics, and data model are unchanged — only the framework, reactivity model, and animation mechanism differ. If you have generated code from the Angular edition of this file before, note: Svelte's stores/runes replace Signals, and native motion primitives replace WAAPI/GSAP — see §4.6.

---

## 2. Architecture & Tech Stack Rules

AI Agents working in this repository must strictly adhere to the following technological guidelines:

| Layer                           | Approved Technology / Pattern                                                                                                                            | Constraint / Guideline                                                                                                                                                                                                                                                                                                                                                                                                              |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**                   | Svelte 5 with Runes (`$state`, `$derived`, `$effect`)                                                                                                    | Use runes for all component-local and shared reactive state. Do **NOT** reach for Redux-style external state libraries (nanostores, Zustand-for-Svelte, etc.) — Svelte's built-in stores (`writable`, `readable`, `derived` from `svelte/store`) combined with runes cover every state need in this app. Use plain `.svelte.ts` module-level runes for cross-component shared state (the Svelte 5 replacement for a "service").     |
| **Build Tooling**               | Vite + `@sveltejs/vite-plugin-svelte`                                                                                                                    | Plain Vite SPA, **not** SvelteKit — this app has no routes, no SSR, and no backend, so SvelteKit's file-based routing and server hooks add nothing here. If future requirements introduce multi-page navigation, re-evaluate; do not add SvelteKit speculatively.                                                                                                                                                                   |
| **Rendering Engine**            | Native Svelte-bound SVG                                                                                                                                  | Given $N \le 16$ (≤31 tree nodes), Canvas/WebGL are explicitly disallowed — unnecessary complexity at this scale, and it loses free DOM accessibility (keyboard focus, `aria-label`s, test hooks required by §4.2 and §4.3.2). Bind SVG attributes directly, e.g. `<circle fill={nodeState.color} />` — Svelte's reactivity handles the re-render, no manual DOM patching.                                                          |
| **Tree Layout Math**            | `d3-hierarchy` (import only `hierarchy` + `tree`, never the full `d3` bundle)                                                                            | Use the Reingold–Tilford layout (`tree<TreeNode>().size([w, h])`) to compute $(x, y)$ per node from array length. Pure data transform — must live outside component files, in `lib/tree-layout.ts`, and must never read/write a rune or store directly. See §4.6.                                                                                                                                                                   |
| **Playback / Animation Engine** | Svelte Motion (`tweened`, `spring` from `svelte/motion`) for per-node visual interpolation, driven by a custom playback clock for the transport controls | Required because the Playback Control Deck (§3, Module C) must **seek to an arbitrary step** and **change playback rate live** (`0.25×`–`2.0×`). Svelte's `transition:`/`animate:` directives are for enter/exit and list-reorder only — they cannot seek — so the transport itself is a small hand-written clock; only the per-node color/position smoothing uses `tweened`. See §4.6 for the full split and required API surface. |
| **Styling & Aesthetics**        | Tailwind CSS / Custom CSS                                                                                                                                | Cyberpunk / CP Dark Theme palette (`#0b0f19` background, `#00f2fe` electric cyan, emerald greens, amber warnings, electric purple accents).                                                                                                                                                                                                                                                                                         |
| **Code Workbench**              | Shiki                                                                                                                                                    | Highlighting must synchronize line-by-line with algorithm step state via the `codeLine` field on `AlgorithmStep` (§4.3). Shiki produces static highlighted HTML with minimal bundle weight — no full editor (Monaco) needed for this read-only workbench.                                                                                                                                                                           |
| **Backend Dependencies**        | **NONE (Pure Client-Side)**                                                                                                                              | All algorithmic dry-runs, step generations, state tracking, and export utilities MUST execute inside the browser.                                                                                                                                                                                                                                                                                                                   |

---

## 3. Core Modules & Feature Breakdown

AI Agents must implement the project following these 4 core product modules — **unchanged from the original spec**:

### Module A: Custom Scenario & Operation Builder

- **Custom Input Support**: User array inputs ($N \in [2, 16]$) with numerical validation.
- **Array Presets**:
  - _Classic CP Array_: e.g., `[2, 5, 1, 4, 9, 3, 7, 6]`
  - _Uniform Array_: e.g., `[5, 5, 5, 5]`
  - _Peaks & Valleys_: Alternating high/low values for Min/Max visual contrast.
- **Operation Controls**:
  - **Range Query**: Bounds $[qL, qR]$.
  - **Point Update**: Index $i$ and replacement value.
  - **Range Update (Lazy)**: Bounds $[qL, qR]$ and delta/set value.
- **Global Toggles**: Aggregate function (**Sum**, **Min**, **Max**), indexing mode (**0-based** vs. **1-based**), and Lazy Propagation toggle.
- **Validation & Error UX**: All invalid input (out-of-range $N$, non-numeric array entries, $qL > qR$, out-of-bounds indices) must be caught **before** simulation start via inline field-level error text under the offending input — never a toast/alert and never a silently disabled submit button with no explanation. The "Run" action stays enabled but clicking it while invalid re-focuses the first invalid field.

### Module B: Visual Simulation & Motion Canvas

- **Dynamic Binary Tree Engine**: Calculates coordinates $(x, y)$ for tree levels dynamically based on array length $N$.
- **Semantic Color Coding** (color is a secondary channel, never the only signal — see §4.2 for the required redundant encoding):
  - `Visiting`: Yellow pulse ring (`#f59e0b`).
  - `Full Overlap / Active Match`: Emerald green fill (`#10b981`).
  - `Partial Overlap`: Amber orange fill (`#d97706`).
  - `Out of Range`: Muted slate fill (`#334155`).
  - `Updated Value`: Electric purple flash (`#8b5cf6`).
- **Lazy Propagation Droplet Motion**: Smooth parent→child cascade motion, implemented per §4.6 (Svelte `tweened` positions, not CSS keyframes).
- **1D Synchronized Leaf Array**: Horizontal bar matching array indices mapped visually to tree leaf nodes.

### Module C: Synchronized Workbench & Time-Travel Debugger

- **C++20 Code Synchronizer**: Displays modern C++20 Segment Tree implementation, auto-highlighting active execution lines corresponding to step state.
- **Plain-English Step Narrative**: Generates human-readable descriptions of why recursive paths are explored or pruned.
- **Playback Control Deck**:
  - Controls: `Play`, `Pause`, `Step Forward`, `Step Backward`, `Jump to Start`, `Jump to End`.
  - Scrubbing timeline slider.
  - Speed selector: $0.25\times, 0.5\times, 1.0\times, 1.5\times, 2.0\times$.

### Module D: Gamified Learning & CP Vault

- **Interactive Prediction Pauses (Micro-Quizzes)**: Optional mode pausing playback at critical decision branches, asking users to predict outcome (_Full Overlap_, _Partial Overlap_, _No Overlap_).
- **CP C++20 Template Vault**: Generates production-ready, contest-tested C++20 template headers customized by current options (Fast I/O, 0-indexed/1-indexed, Lazy).
- **Export Utilities**: SVG tree export and URL state sharing (format defined in §4.4).

---

## 4. Agent Code Execution Rules & Guidelines

### 4.1 State Management (Runes, not Signals)

- Use `$state()` for primitive/object state, `$derived()` for computed values (active node, progress percentage, total step count), and `$effect()` only for genuine side effects (e.g., syncing to the URL) — never to synchronize two pieces of state that could instead be one `$derived`.
- Shared/cross-component state lives in plain `.svelte.ts` files exporting runed objects (Svelte 5's direct replacement for an Angular "store service") — e.g. `lib/stores/playback.svelte.ts` exporting a `playbackState` object built with `$state`. Do not wrap these in classes unless the object needs encapsulated methods; a plain exported `$state` object is preferred for simple cases.
- Never mutate shared state from inside a component's markup expression — mutations happen in `<script>` blocks or exported functions only.

### 4.2 Accessibility & Layout

- Layouts must be compact and scannable on standard widescreen desktop resolutions ($1920\times1080$ and $1440\times900$) — code panel, visual canvas, and narratives must be viewable side-by-side without vertical page scrolling.
- Because Module B's overlap states rely on color, every colored node state must carry a **second, non-color signal**: a distinct border stroke pattern (solid / dashed / dotted) or a small glyph badge, so the visualization remains legible for colorblind users and in grayscale screenshots.
- All interactive controls (playback deck, scrubbing slider, operation inputs) must be reachable via keyboard (`Tab`/`Enter`/`Space`/arrow keys for the slider) and expose `aria-label`s — this is distinct from the desktop-resolution layout constraint above and should not be conflated with it.

### 4.3 Step Generation & Data Model

- Algorithms must non-destructively pre-generate array/tree snapshots (`AlgorithmStep[]`) on simulation start so users can scrub backward and forward instantly without re-computing state from scratch.
- All modules (B, C, D) must consume the **same** `AlgorithmStep` shape. Agents must not invent module-local variants. Minimum required shape (identical to the Angular edition — this is the framework-agnostic contract):

```typescript
interface AlgorithmStep {
  stepIndex: number;
  operation: "query" | "pointUpdate" | "rangeUpdate";
  nodeId: number; // index into the flattened tree array
  range: { l: number; r: number };
  state:
    | "visiting"
    | "fullOverlap"
    | "partialOverlap"
    | "outOfRange"
    | "updated";
  value: number | null; // node's aggregate value at this step, if resolved
  lazyTag: number | null; // pending lazy value being pushed, if any
  codeLine: number; // 1-indexed line in the synced C++20 snippet
  narrative: string; // plain-English explanation for Module C
  quizPause?: {
    // present only when Module D quiz mode is active
    prompt: string;
    correctAnswer: "fullOverlap" | "partialOverlap" | "noOverlap";
  };
}
```

- `AlgorithmStep[]` generation must be covered by unit tests at minimum for: $N = 2$ (lower bound), $N = 16$ (upper bound), a Lazy Propagation push spanning 3+ tree levels, and a query that starts with `partialOverlap` before resolving to `fullOverlap` on a child. A module is not "done" until these pass.

#### 4.3.1 Reference Test Suite (must be included, not just described)

Svelte's test story is **Vitest** (shares Vite's config, no separate test bundler) + `@testing-library/svelte` for component tests. The step generator itself is framework-agnostic TypeScript, so it's tested directly with Vitest, no Testing Library needed.

Agents must add this spec at `src/lib/step-generator.test.ts` and keep it passing as the generator evolves:

```typescript
import { describe, it, expect } from "vitest";
import { generateSteps } from "./step-generator";
import type { AlgorithmStep } from "./algorithm-step.types";

describe("generateSteps", () => {
  describe("boundary array sizes", () => {
    it("generates a valid, non-empty step sequence for N = 2 (lower bound)", () => {
      const steps: AlgorithmStep[] = generateSteps({
        array: [3, 7],
        operation: "query",
        range: { l: 0, r: 1 },
        aggregate: "sum",
        indexing: "0-based",
        lazy: false,
      });

      expect(steps.length).toBeGreaterThan(0);
      steps.forEach((s, i) => expect(s.stepIndex).toBe(i));
    });

    it("generates a valid step sequence for N = 16 (upper bound) without truncation", () => {
      const array = Array.from({ length: 16 }, (_, i) => i + 1);
      const steps = generateSteps({
        array,
        operation: "query",
        range: { l: 0, r: 15 },
        aggregate: "sum",
        indexing: "0-based",
        lazy: false,
      });

      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.state).toBe("fullOverlap");
    });
  });

  describe("lazy propagation", () => {
    it("cascades a pending lazy tag across at least 3 tree levels on push()", () => {
      const array = Array.from({ length: 8 }, () => 1);
      const steps = generateSteps({
        array,
        operation: "rangeUpdate",
        range: { l: 0, r: 7 },
        delta: 5,
        aggregate: "sum",
        indexing: "0-based",
        lazy: true,
      });

      const pushSteps = steps.filter((s) => s.lazyTag !== null);
      expect(pushSteps.length).toBeGreaterThan(0);

      const touchedNodeIds = new Set(pushSteps.map((s) => s.nodeId));
      const depths = new Set(
        Array.from(touchedNodeIds).map((id) => Math.floor(Math.log2(id + 1))),
      );
      expect(depths.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe("overlap state resolution", () => {
    it("visits a partialOverlap node before its child resolves to fullOverlap", () => {
      const array = [4, 2, 6, 8, 1, 9, 3, 5];
      const steps = generateSteps({
        array,
        operation: "query",
        range: { l: 2, r: 5 },
        aggregate: "sum",
        indexing: "0-based",
        lazy: false,
      });

      const firstPartialIdx = steps.findIndex(
        (s) => s.state === "partialOverlap",
      );
      expect(firstPartialIdx).toBeGreaterThanOrEqual(0);

      const partialNodeId = steps[firstPartialIdx].nodeId;
      const childFullOverlap = steps
        .slice(firstPartialIdx + 1)
        .find(
          (s) =>
            s.state === "fullOverlap" && isDescendant(s.nodeId, partialNodeId),
        );

      expect(childFullOverlap).toBeTruthy();
    });
  });

  describe("shared shape contract (§4.3)", () => {
    it("every generated step matches the AlgorithmStep interface exactly — no module-local fields", () => {
      const steps = generateSteps({
        array: [1, 2, 3, 4],
        operation: "pointUpdate",
        index: 1,
        newValue: 9,
        aggregate: "max",
        indexing: "0-based",
        lazy: false,
      });

      const allowedKeys = new Set([
        "stepIndex",
        "operation",
        "nodeId",
        "range",
        "state",
        "value",
        "lazyTag",
        "codeLine",
        "narrative",
        "quizPause",
      ]);
      steps.forEach((step) => {
        Object.keys(step).forEach((key) =>
          expect(allowedKeys.has(key)).toBe(true),
        );
      });
    });
  });
});

function isDescendant(nodeId: number, ancestorId: number): boolean {
  let current = nodeId;
  while (current > ancestorId) {
    current = Math.floor((current - 1) / 2);
    if (current === ancestorId) return true;
  }
  return false;
}
```

Run with `vitest run` (or `vitest` in watch mode locally). This suite must run and pass in CI on every PR that touches `step-generator.ts` or `algorithm-step.types.ts` — a failing or skipped test in this file blocks merge.

#### 4.3.2 Interactive End-to-End Automation (drives the real UI, not just the generator)

Same rationale as any framework: unit tests prove the algorithm is correct in isolation but never touch the DOM, so a broken Play button or a scrubber that doesn't seek would still pass §4.3.1. Agents must add a **Playwright** e2e suite driving the actual rendered app.

**Setup:**

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

`playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  webServer: {
    command: "vite --port 4300",
    url: "http://localhost:4300",
    reuseExistingServer: !process.env["CI"],
  },
  use: {
    baseURL: "http://localhost:4300",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
```

Minimum required coverage — one file per flow (interaction pattern is identical to the Angular edition since Playwright drives the rendered DOM, not framework internals):

**`e2e/playback-deck.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Playback Deck interactive automation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /classic cp array/i }).click();
    await page.getByRole("spinbutton", { name: /query left bound/i }).fill("1");
    await page
      .getByRole("spinbutton", { name: /query right bound/i })
      .fill("5");
    await page.getByRole("button", { name: /run/i }).click();
  });

  test("Step Forward advances exactly one AlgorithmStep and updates code-line highlight", async ({
    page,
  }) => {
    const codeLine = page.locator('[data-testid="active-code-line"]');
    const before = await codeLine.getAttribute("data-line");
    await page.getByRole("button", { name: /step forward/i }).click();
    const after = await codeLine.getAttribute("data-line");
    expect(after).not.toBe(before);
  });

  test("Play advances steps automatically and Pause halts it", async ({
    page,
  }) => {
    const stepCounter = page.locator('[data-testid="step-index"]');
    const atStart = await stepCounter.innerText();

    await page.getByRole("button", { name: /^play$/i }).click();
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: /^pause$/i }).click();
    const afterPlay = await stepCounter.innerText();
    expect(Number(afterPlay)).toBeGreaterThan(Number(atStart));

    await page.waitForTimeout(1000);
    const afterPause = await stepCounter.innerText();
    expect(afterPause).toBe(afterPlay); // confirms Pause actually stopped the playback clock
  });

  test("Scrubbing timeline jumps directly to the target step", async ({
    page,
  }) => {
    const slider = page.getByRole("slider", { name: /timeline/i });
    await slider.fill("4");
    await expect(page.locator('[data-testid="step-index"]')).toHaveText("4");
  });

  test("Jump to Start / Jump to End land on the correct boundary steps", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /jump to end/i }).click();
    const last = await page.locator('[data-testid="step-index"]').innerText();
    await page.getByRole("button", { name: /jump to start/i }).click();
    await expect(page.locator('[data-testid="step-index"]')).toHaveText("0");
    expect(Number(last)).toBeGreaterThan(0);
  });
});
```

**`e2e/visual-state-redundancy.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test("overlap states expose both a fill color AND a non-color signal on the SVG node", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /classic cp array/i }).click();
  await page.getByRole("button", { name: /run/i }).click();
  await page.getByRole("button", { name: /step forward/i }).click();

  const visitedNode = page
    .locator('[data-node-state="partialOverlap"]')
    .first();
  await expect(visitedNode).toHaveAttribute("fill", "#d97706");
  const strokeDasharray = await visitedNode.getAttribute("stroke-dasharray");
  const badge = page.locator(
    '[data-node-state="partialOverlap"] [data-testid="state-badge"]',
  );
  expect(strokeDasharray || (await badge.count()) > 0).toBeTruthy();
});
```

**`e2e/url-state-sharing.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test("sharing a URL and reloading restores the exact same scenario", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /uniform array/i }).click();
  await page.getByRole("button", { name: /run/i }).click();
  await page.getByRole("button", { name: /share/i }).click();

  const shareUrl = await page
    .locator('[data-testid="share-url-output"]')
    .inputValue();
  expect(shareUrl).toMatch(/[?&]s=[A-Za-z0-9+/=]+/);

  await page.goto(shareUrl);
  await expect(page.locator('[data-testid="active-preset-label"]')).toHaveText(
    /uniform array/i,
  );
});

test("a tampered/malformed share link falls back to default preset with a visible notice", async ({
  page,
}) => {
  await page.goto("/?s=not-valid-base64-json");
  await expect(
    page.locator('[data-testid="malformed-link-notice"]'),
  ).toBeVisible();
  await expect(page.locator('[data-testid="active-preset-label"]')).toHaveText(
    /classic cp array/i,
  );
});
```

**`e2e/quiz-pause.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test("prediction pause halts playback until the user answers", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: /prediction pauses/i }).check();
  await page.getByRole("button", { name: /classic cp array/i }).click();
  await page.getByRole("button", { name: /run/i }).click();
  await page.getByRole("button", { name: /^play$/i }).click();

  const quizModal = page.locator('[data-testid="quiz-pause-modal"]');
  await expect(quizModal).toBeVisible({ timeout: 10_000 });

  const stepBefore = await page
    .locator('[data-testid="step-index"]')
    .innerText();
  await page.waitForTimeout(2000);
  await expect(page.locator('[data-testid="step-index"]')).toHaveText(
    stepBefore,
  );

  await quizModal.getByRole("button", { name: /full overlap/i }).click();
  await expect(quizModal).toBeHidden();
});
```

**CI wiring:**

```yaml
# .github/workflows/e2e.yml
name: E2E
on: [pull_request]
jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

Add a parallel unit-test job running `vitest run` before the e2e job, so the fast suite fails first.

**Agent obligation:** any new interactive control added to Modules A–D must ship with at least one corresponding Playwright test in the matching `e2e/*.spec.ts` file in the same PR — a UI-only change with no e2e coverage is treated the same as a missing unit test under §4.3.1's merge-blocking rule.

### 4.4 URL State Sharing & Sanitization

- Shared state (array values, operation bounds, toggles) must be serialized into the URL as a single Base64-encoded JSON blob under one query param (e.g. `?s=<base64>`), not raw unencoded values in multiple params.
- On load, the decoded blob must be validated against the same numeric/range rules as Module A's input form before being applied to state — a malformed or tampered shared link must fall back to a default preset with a visible inline notice, never a thrown error or blank canvas.
- Because decoded state can echo back into narratives or labels, all string fields must be rendered via Svelte's default text interpolation (`{value}`) — never `{@html ...}` — to avoid reflected XSS from a crafted share link.

### 4.5 Zero External Backend Calls

- Do not write backend APIs, REST endpoints, or server-side functions. Keep all computations in browser memory.

### 4.6 Tree Layout & Animation Engine (Svelte-specific)

This section exists because Svelte's built-in `transition:`/`animate:` directives are enter/exit and FLIP-reorder primitives — they cannot **seek to an arbitrary point** or have their rate changed live mid-flight, which the Playback Control Deck requires. Agents must follow the split below rather than trying to force the transport controls through `transition:`.

**Layout (`d3-hierarchy`) — identical role to the Angular edition**

- Import only `hierarchy` and `tree` from `d3-hierarchy`.
- Layout computation lives in `lib/tree-layout.ts` and is a pure function: `(array: number[]) => TreeNode[]` with `{ x, y }` populated per node. It must not read or write a rune/store directly — components call it and store the result in `$state`.
- Recompute layout only when array length changes, not on every step — coordinates are structural, not per-step state, and must not be part of `AlgorithmStep` (§4.3).

**Two-layer animation split (this is the key Svelte-specific rule):**

1. **Transport clock (custom, drives _which step is active_)** — lives in `lib/stores/playback.svelte.ts`:

   ```typescript
   // playback.svelte.ts
   export function createPlaybackClock(
     totalSteps: number,
     stepDurationMs = 800,
   ) {
     let currentTime = $state(0); // ms, seekable
     let playbackRate = $state(1); // 0.25–2.0
     let isPlaying = $state(false);
     let rafId: number | null = null;

     const currentStepIndex = $derived(
       Math.min(totalSteps - 1, Math.floor(currentTime / stepDurationMs)),
     );

     function tick(now: number, last: number) {
       if (!isPlaying) return;
       currentTime += (now - last) * playbackRate;
       if (currentStepIndex >= totalSteps - 1) {
         isPlaying = false;
         return;
       }
       rafId = requestAnimationFrame((n) => tick(n, now));
     }

     function play() {
       isPlaying = true;
       requestAnimationFrame((n) => tick(n, n));
     }
     function pause() {
       isPlaying = false;
       if (rafId) cancelAnimationFrame(rafId);
     }
     function seek(ms: number) {
       currentTime = Math.max(0, Math.min(ms, totalSteps * stepDurationMs));
     }
     function setRate(rate: number) {
       playbackRate = rate;
     }

     return {
       get currentStepIndex() {
         return currentStepIndex;
       },
       get isPlaying() {
         return isPlaying;
       },
       play,
       pause,
       seek,
       setRate,
     };
   }
   ```

   - `Step Forward` / `Step Backward`: call `seek(currentStepIndex ± 1 step's ms)`.
   - `Play` / `Pause`: call `play()` / `pause()` directly — no separate interval timer elsewhere in the app.
   - Scrub slider: two-way bind to a value that calls `seek()` on input.
   - Speed selector: calls `setRate()`.
   - This clock is the **single source of truth** for `currentStepIndex`; every other reactive value (active node, code line, narrative) must be a `$derived` reading from it, never a parallel state variable that could drift out of sync.

2. **Per-node visual smoothing (Svelte Motion, `tweened`/`spring`)** — purely cosmetic interpolation _between_ two known step-states, not the transport itself:

   ```typescript
   import { tweened } from "svelte/motion";
   import { cubicOut } from "svelte/easing";

   const fillOpacity = tweened(0, { duration: 300, easing: cubicOut });
   // on step change: fillOpacity.set(1) to fade a node's new state in smoothly
   ```

   - Use `tweened` for fill/opacity/position changes so a step transition doesn't feel like an abrupt jump-cut.
   - Use `spring` instead of `tweened` specifically for the lazy-propagation "droplet" position, since a light spring gives the cascade a natural, slightly bouncy feel appropriate to a "droplet" metaphor — set `stiffness`/`damping` conservatively (e.g. `{ stiffness: 0.15, damping: 0.8 }`) so it settles quickly and doesn't overshoot into the next node.
   - These motion stores must always be driven **by** `currentStepIndex` from the transport clock (via an `$effect` that calls `.set(...)` when it changes) — they must never independently own timing or be scrubbable themselves. The transport clock owns "when"; motion stores only own "how it looks transitioning."
   - The lazy-tag droplet's start/end positions come directly from `d3-hierarchy`'s computed `{x, y}` for parent and child — animate a `spring`-driven `{x, y}` pair and bind it straight to the SVG element's `cx`/`cy` (or a `transform`), no `<animateMotion>` or path-based plugin needed for a straight two-point move.

- Every visual transition must be derivable from the same `AlgorithmStep[]` array (§4.3) — motion stores render that array's state, they never independently decide sequencing. This keeps Module B (canvas), Module C (code sync), and Module D (quiz pauses) frame-accurate to one source of truth.

---

## 5. Repository & File Structure

```
src/
├── lib/
│   ├── algorithm-step.types.ts   # AlgorithmStep and shared interfaces (§4.3)
│   ├── step-generator.ts          # Pure function: SegmentTreeEngine + step generation
│   ├── tree-layout.ts             # d3-hierarchy wrapper (§4.6) — pure, no runes
│   ├── url-state.ts               # Encode/decode/validate logic (§4.4)
│   └── stores/
│       ├── playback.svelte.ts     # Transport clock (§4.6)
│       ├── builder.svelte.ts       # Module A shared state
│       └── vault.svelte.ts         # Module D shared state
├── components/
│   ├── builder/                    # Module A components
│   ├── canvas/                     # Module B: SVG tree, leaf array, motion stores
│   ├── workbench/                  # Module C: code sync, narrative, playback deck
│   └── vault/                       # Module D: quiz pauses, template generator, export
├── styles/
│   └── theme.ts                     # Centralized cyberpunk palette tokens — components reference these, not raw hex
└── App.svelte
e2e/                                  # Playwright specs (§4.3.2)
```

Component naming convention: PascalCase filenames matching the exported component (e.g. `TreeCanvas.svelte`, `PlaybackDeck.svelte`) — Svelte convention, no selector prefix needed since there's no global custom-element namespace collision risk in a single-app SPA.

---

## 6. System Prompt Template for Sub-Agents

When delegating code generation tasks to sub-agents, wrap instructions using this system prompt:

```markdown
System Prompt:
You are an expert Frontend Architect building the "Segment Tree Interactive Studio" in Svelte 5 using Runes and Svelte Motion for animation.
Follow AGENTS.md strictly. Write clean, modular, client-side code with zero backend dependencies, hyper-responsive UI, dark cyberpunk styling, and precise step-by-step synchronization.
Place files according to §5's directory structure, and consume/produce the AlgorithmStep shape defined in §4.3 exactly — do not invent a module-local variant.
Drive all playback transport through the single clock in §4.6 — never build a second timer/interval loop, and never let a tweened/spring store own seek/rate logic itself.
```
