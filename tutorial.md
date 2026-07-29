# Segment Tree Interactive Studio — Step-by-Step Architecture & Tutorial

Welcome to the **Segment Tree Interactive Studio** tutorial and build log! This document provides an intuitive, step-by-step breakdown of how the application is architected, how each module works, and how to understand and extend the codebase.

---

## Table of Contents
1. [Overview & Architectural Vision](#1-overview--architectural-vision)
2. [Phase 1: Project Setup & Package Configuration](#2-phase-1-project-setup--package-configuration)
3. [Phase 2: Core Data Types & Algorithmic Engine](#3-phase-2-core-data-types--algorithmic-engine)
4. [Phase 3: Svelte 5 Runes & Playback Clock](#4-phase-3-svelte-5-runes--playback-clock)
5. [Phase 4: UI Design System & Interactive Modules](#5-phase-4-ui-design-system--interactive-modules) *(Upcoming)*
6. [Phase 5: Automated Testing & End-to-End Verification](#6-phase-5-automated-testing--end-to-end-verification) *(Upcoming)*

---

## 1. Overview & Architectural Vision

The **Segment Tree Interactive Studio** is a high-performance visual learning environment for computer science students and competitive programmers. It visualizes:
- **Segment Tree Construction & Operations** (Point Update, Range Query)
- **Lazy Propagation Cascade** (Parent to child delayed pushes)
- **Line-by-Line C++ Code Synchronization** via Shiki
- **Gamified Micro-Quizzes & CP C++ Template Vault**

---

## 2. Phase 1: Project Setup & Package Configuration

In Phase 1, we initialized the project directory structure under `./app`:

```
d:\Local-Projects\AnimatedAlgorithms\
├── AGENTS.md                   # Core product blueprint & agent rules
├── implementation_plan.md      # Phased execution plan
├── project-spec.md             # Formal product specifications
├── tutorial.md                 # This architecture & build guide
└── app/                        # Main Svelte 5 Web Application
    ├── package.json            # Project manifest & npm scripts
    ├── vite.config.ts          # Vite configuration with Svelte & Tailwind plugins
    ├── playwright.config.ts    # End-to-end test runner configuration
    ├── tsconfig.json           # TypeScript configuration
    └── src/
        ├── App.svelte          # Root application component
        ├── app.css             # Tailwind v4 import & custom styles
        └── main.ts             # Application entry point
```

---

## 3. Phase 2: Core Data Types & Algorithmic Engine

Phase 2 constructed the core TypeScript domain models, mathematical tree layout calculator, non-destructive step generation engine, and URL state encoding.

### 3.1 Data Contracts (`src/lib/algorithm-step.types.ts`)
The `AlgorithmStep` interface serves as the universal contract across all UI modules:

```typescript
export interface AlgorithmStep {
  stepIndex: number;
  operation: 'query' | 'pointUpdate' | 'rangeUpdate';
  nodeId: number;       // 0-indexed flattened tree array position
  range: { l: number; r: number };
  state: 'visiting' | 'fullOverlap' | 'partialOverlap' | 'outOfRange' | 'updated';
  value: number | null; // Node's aggregate value at this step
  lazyTag: number | null; // Pending lazy tag being pushed
  codeLine: number;     // 1-indexed C++ line highlight index
  narrative: string;    // Human-readable step explanation
  quizPause?: QuizPauseData; // Micro-quiz prompt
}
```

### 3.2 Non-Destructive Step Generation (`src/lib/step-generator.ts`)
`generateSteps(options)` pre-computes an array snapshot of `AlgorithmStep[]` on simulation start for instant forward/backward scrubbing.

---

## 4. Phase 3: Svelte 5 Runes & Playback Clock

Phase 3 established reactive stores powered by Svelte 5 Runes (`$state`, `$derived`, `$derived.by`).

### 4.1 Custom Transport Clock (`src/lib/stores/playback.svelte.ts`)
Per AGENTS.md §4.6, Svelte's built-in enter/exit transitions cannot seek to arbitrary steps or adjust speed live. We built `createPlaybackClock(getTotalSteps, stepDurationMs)`:
- **`currentTime` ($state):** Seekable timestamp in milliseconds.
- **`playbackRate` ($state):** Variable speed rate ($0.25\times$ to $2.0\times$).
- **`currentStepIndex` ($derived):** Single source of truth derived as $\min(\text{totalSteps}-1, \lfloor\text{currentTime}/\text{stepDurationMs}\rfloor)$.
- **Transport Actions:** `play()`, `pause()`, `seek(ms)`, `seekToStep(stepIdx)`, `setRate(rate)`, `reset()`.

### 4.2 Scenario Builder Store (`src/lib/stores/builder.svelte.ts`)
- **`options` ($state):** Active scenario configuration.
- **`steps` ($derived):** Automatically recomputes `AlgorithmStep[]` via `generateSteps(options)`.
- **`layout` ($derived):** Automatically recomputes `TreeNodePosition[]` via `calculateTreeLayout(options.array)`.
- **`validationErrors` ($derived.by):** Inline field-level input validation preventing invalid executions.

### 4.3 Vault Store (`src/lib/stores/vault.svelte.ts`)
Generates production-ready C++20 Segment Tree templates (with Fast I/O, Lazy, and 0-based/1-based options) and manages interactive micro-quiz states.

---

*(This document is updated at the conclusion of each project phase).*
