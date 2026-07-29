# Project Specification — Segment Tree Interactive Studio

> **Version:** 1.2.0  
> **Framework:** Svelte 5 (Runes) + Vite  
> **Target Audience:** Competitive Programmers, Computer Science Students, AI Agents  

---

## 1. Product Summary
The **Segment Tree Interactive Studio** is a pure client-side visual learning platform designed to teach Segment Trees and Lazy Propagation through interactive dry-runs, visual tree motion, line-by-line C++ code execution synchronization, and micro-quiz prediction pauses.

---

## 2. Core Functional Modules

### Module A: Scenario & Operation Builder
- **Array Input:** $N \in [2, 16]$ with presets (*Classic CP*, *Uniform*, *Peaks & Valleys*).
- **Operation Types:** Range Query $[qL, qR]$, Point Update, Range Update (Lazy).
- **Toggles:** Aggregation Function (**Sum**, **Min**, **Max**), Indexing Mode (**0-based** vs **1-based**), Lazy Propagation Toggle.
- **Validation:** Pre-flight inline field validation (`builder.svelte.ts`).

### Module B: Visual Simulation & Motion Canvas
- **Tree Layout:** Dynamic 2D tree graph calculated via `d3-hierarchy` Reingold–Tilford engine (`src/lib/tree-layout.ts`).
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
- **Playback Control Deck:** Seekable transport clock (`playback.svelte.ts`) with Play, Pause, Step Forward, Step Backward, Jump Start, Jump End, Scrubbing Slider, Speed Select ($0.25\times$ to $2.0\times$).

### Module D: CP Vault & Learning Utilities
- **Micro-Quizzes:** Interactive prediction pauses requiring user prediction before exploring tree sub-branches (`vault.svelte.ts`).
- **Template Vault:** Custom C++20 boilerplate code generator with Fast I/O and Lazy options.
- **URL Sharing:** Base64-encoded query parameters enabling scenario bookmarking and sharing (`url-state.ts`).

---

## 3. Implementation Status (Phase 3 Complete)
- `src/lib/stores/playback.svelte.ts`: Custom `createPlaybackClock` with seekable transport controls.
- `src/lib/stores/builder.svelte.ts`: Runed store for options, derived steps, layout, and validation.
- `src/lib/stores/vault.svelte.ts`: Runed store for template generator and quiz state.
- `src/lib/**/*.test.ts`: 100% passing Vitest unit test suite (17 tests total across 6 files).
