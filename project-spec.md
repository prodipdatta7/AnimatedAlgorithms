# Project Specification — Segment Tree Interactive Studio

> **Version:** 1.4.0 (Final Release)  
> **Framework:** Svelte 5 (Runes) + Vite  
> **Target Audience:** Competitive Programmers, Computer Science Students, AI Agents  

---

## 1. Product Summary
The **Segment Tree Interactive Studio** is a pure client-side visual learning platform designed to teach Segment Trees and Lazy Propagation through interactive dry-runs, visual tree motion, line-by-line C++ code execution synchronization, and micro-quiz prediction pauses.

---

## 2. Core Functional Modules

### Module A: Scenario & Operation Builder
- **Array Input:** $N \in [2, 16]$ with presets (*Classic CP*, *Uniform*, *Peaks & Valleys*, *Minimal N=2*).
- **Operation Types:** Range Query $[qL, qR]$, Point Update, Range Update (Lazy).
- **Toggles:** Aggregation Function (**Sum**, **Min**, **Max**), Indexing Mode (**0-based** vs **1-based**), Lazy Propagation Toggle.
- **Validation:** Pre-flight inline field validation (`builder.svelte.ts`, `ScenarioBuilder.svelte`).

### Module B: Visual Simulation & Motion Canvas
- **Tree Layout:** Dynamic 2D tree graph calculated via `d3-hierarchy` Reingold–Tilford engine (`tree-layout.ts`, `TreeCanvas.svelte`).
- **Visual Encoding:** Color + redundant visual signals (stroke dashes, badges) for accessibility (`theme.ts`, `TreeNodeElement.svelte`):
  - `visiting`: `#1e293b` fill, `#f59e0b` yellow dashed stroke, badge `[V]`
  - `fullOverlap`: `#064e3b` fill, `#10b981` emerald solid stroke, badge `[F]`
  - `partialOverlap`: `#78350f` fill, `#d97706` amber dashed stroke, badge `[P]`
  - `outOfRange`: `#1e293b` fill, `#475569` slate dotted stroke, badge `[X]`
  - `updated`: `#4c1d95` fill, `#8b5cf6` electric purple stroke, badge `[U]`
- **Droplet Cascade:** `spring`-animated droplet tracking lazy propagation tag pushes from parent to child (`LazyDroplet.svelte`).
- **Leaf Array Bar:** 1D horizontal leaf array mapped to tree leaf nodes (`LeafArrayBar.svelte`).

### Module C: Workbench & Time-Travel Debugger
- **Code Synchronizer:** Shiki-rendered modern C++20 Segment Tree template with active line highlight (`CodeWorkbench.svelte`).
- **Narrative Engine:** Human-readable explanations of recursive operations and pruning logic (`StepNarrative.svelte`).
- **Playback Control Deck:** Seekable transport clock with Play, Pause, Step Forward, Step Backward, Jump Start, Jump End, Scrubbing Slider, Speed Select ($0.25\times$ to $2.0\times$) (`PlaybackDeck.svelte`).

### Module D: CP Vault & Learning Utilities
- **Micro-Quizzes:** Interactive prediction pauses requiring user prediction before exploring tree sub-branches (`QuizModal.svelte`).
- **Template Vault:** Custom C++20 boilerplate code generator with Fast I/O and Lazy options (`TemplateVault.svelte`).
- **URL Sharing:** Base64-encoded query parameters enabling scenario bookmarking and sharing (`ShareModal.svelte`).

---

## 3. Data Model Contract (`AlgorithmStep`)

```typescript
interface AlgorithmStep {
  stepIndex: number;
  operation: "query" | "pointUpdate" | "rangeUpdate";
  nodeId: number;
  range: { l: number; r: number };
  state: "visiting" | "fullOverlap" | "partialOverlap" | "outOfRange" | "updated";
  value: number | null;
  lazyTag: number | null;
  codeLine: number;
  narrative: string;
  quizPause?: {
    prompt: string;
    correctAnswer: "fullOverlap" | "partialOverlap" | "noOverlap";
  };
}
```

---

## 4. Verification & Quality Assurance Summary
- **Type Checking (`npm run check`):** Passed with 0 errors and 0 warnings.
- **Unit Testing (`npm run test:unit`):** 17 tests passed across 6 test suites (100% pass rate).
- **E2E Automation (`npm run test:e2e`):** 8 Playwright browser tests passed across 4 spec files (100% pass rate).
