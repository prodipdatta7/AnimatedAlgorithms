# Project Specification — Segment Tree Interactive Studio

> **Version:** 1.0.0  
> **Framework:** Svelte 5 (Runes) + Vite  
> **Target Audience:** Competitive Programmers, Computer Science Students, AI Agents  

---

## 1. Product Summary
The **Segment Tree Interactive Studio** is a pure client-side visual learning platform designed to teach Segment Trees and Lazy Propagation through interactive dry-runs, visual tree motion, line-by-line C++ code execution synchronization, and micro-quiz prediction pauses.

---

## 2. Core Functional Modules

### Module A: Scenario & Operation Builder
- **Array Input:** $N \in [2, 16]$ with presets (*Classic CP*, *Uniform*, *Peaks & Valleys*).
- **Operation Types:**
  - Range Query $[qL, qR]$
  - Point Update (index $i$, value $val$)
  - Range Update with Lazy Propagation ($[qL, qR]$, delta/set value)
- **Toggles:** Aggregation Function (**Sum**, **Min**, **Max**), Indexing Mode (**0-based** vs **1-based**), Lazy Propagation Toggle.
- **Validation:** Pre-flight inline input validation preventing invalid execution while keeping the Run button accessible.

### Module B: Visual Simulation & Motion Canvas
- **Tree Layout:** Dynamic 2D tree graph calculated via `d3-hierarchy` Reingold–Tilford engine.
- **Visual Encoding:** Color + redundant visual signals (stroke dashes, badges) for accessibility:
  - `visiting`: `#f59e0b` (Yellow ring)
  - `fullOverlap`: `#10b981` (Emerald green fill)
  - `partialOverlap`: `#d97706` (Amber orange fill)
  - `outOfRange`: `#334155` (Muted slate fill)
  - `updated`: `#8b5cf6` (Electric purple flash)
- **Droplet Cascade:** `spring`-animated droplet tracking lazy propagation tag pushes from parent to child.

### Module C: Workbench & Time-Travel Debugger
- **Code Synchronizer:** Shiki-rendered modern C++20 Segment Tree template with active line highlight (`data-line`).
- **Narrative Engine:** Human-readable explanations of recursive operations and pruning logic.
- **Playback Control Deck:** Play, Pause, Step Forward, Step Backward, Jump Start, Jump End, Scrubbing Slider, Speed Select ($0.25\times$ to $2.0\times$).

### Module D: CP Vault & Learning Utilities
- **Micro-Quizzes:** Interactive prediction pauses requiring user prediction before exploring tree sub-branches.
- **Template Vault:** Custom C++20 boilerplate code generator with Fast I/O and Lazy options.
- **URL Sharing:** Base64-encoded query parameters enabling scenario bookmarking and sharing.

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

## 4. Verification & Quality Assurance
- **Unit Testing:** Vitest coverage for boundary $N=2, 16$, multi-level lazy pushes, and partial-to-full overlap transitions.
- **E2E Testing:** Playwright automated browser test suite covering playback scrubbing, accessibility state markers, URL sharing, and quiz pauses.
