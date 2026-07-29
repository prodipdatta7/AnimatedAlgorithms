# Segment Tree Interactive Studio — Step-by-Step Architecture & Tutorial

Welcome to the **Segment Tree Interactive Studio** tutorial and build log! This document provides an intuitive, step-by-step breakdown of how the application is architected, how each module works, and how to understand and extend the codebase.

---

## Table of Contents
1. [Overview & Architectural Vision](#1-overview--architectural-vision)
2. [Phase 1: Project Setup & Package Configuration](#2-phase-1-project-setup--package-configuration)
3. [Phase 2: Core Data Types & Algorithmic Engine](#3-phase-2-core-data-types--algorithmic-engine)
4. [Phase 3: Svelte 5 Runes & Playback Clock](#4-phase-3-svelte-5-runes--playback-clock) *(Upcoming)*
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
The `AlgorithmStep` interface serves as the universal contract across all UI modules (Canvas, Code Synchronizer, Micro-Quiz, Playback Deck):

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
Instead of computing tree state live during visual playback, `generateSteps(options)` pre-computes an array snapshot of `AlgorithmStep[]` on simulation start:
- **Operations Supported:** Range Query, Point Update, Lazy Range Update.
- **Aggregates Supported:** Sum ($\sum$), Min ($\min$), Max ($\max$).
- **Lazy Propagation:** When visiting a node with a pending lazy tag, `pushLazy(...)` cascades the tag to left (`2*node+1`) and right (`2*node+2`) children while recording explicit animation steps.

### 3.3 Reingold–Tilford Tree Layout (`src/lib/tree-layout.ts`)
Uses `d3-hierarchy` (`hierarchy` + `tree`) to convert a 1D Segment Tree array into 2D Cartesian coordinates $(x, y)$ mapped onto SVG viewBox boundaries. It is a pure, side-effect-free data transform.

### 3.4 Base64 URL State Encoding (`src/lib/url-state.ts`)
`encodeScenarioToUrl` and `decodeScenarioFromUrl` serialize scenario parameters into a Base64 URL query parameter `?s=<base64>`. Malformed inputs trigger safe fallback to `DEFAULT_SCENARIO` without throwing unhandled exceptions.

### 3.5 Automated Unit Testing (`src/lib/step-generator.test.ts`)
Verified with **Vitest**:
- Boundary array sizes $N = 2$ and $N = 16$.
- Lazy tag push cascading across $\ge 3$ tree levels.
- Partial overlap to child full overlap recursive traversal order.
- Full `AlgorithmStep` interface key compliance.

---

*(This document is updated at the conclusion of each project phase).*
