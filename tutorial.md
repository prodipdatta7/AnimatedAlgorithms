# Segment Tree Interactive Studio — Step-by-Step Architecture & Tutorial

Welcome to the **Segment Tree Interactive Studio** tutorial and build log! This document provides an intuitive, step-by-step breakdown of how the application is architected, how each module works, and how to understand and extend the codebase.

---

## Table of Contents
1. [Overview & Architectural Vision](#1-overview--architectural-vision)
2. [Phase 1: Project Setup & Package Configuration](#2-phase-1-project-setup--package-configuration)
3. [Phase 2: Core Data Types & Algorithmic Engine](#3-phase-2-core-data-types--algorithmic-engine) *(Upcoming)*
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

### Key Tech Stack Decisions
- **Framework:** Svelte 5 with Runes (`$state`, `$derived`, `$effect`) for fine-grained reactivity.
- **Build Tool:** Vite (port `4300`) SPA mode without backend infrastructure.
- **Styling:** Cyberpunk Dark Theme built with Tailwind CSS v4 and HSL color variables.
- **Tree Layout:** `d3-hierarchy` (Reingold–Tilford layout algorithm) for node $(x, y)$ calculation.
- **Animation:** Svelte Motion (`tweened` / `spring`) driven by a single custom transport clock.
- **Code Highlighting:** Shiki static highlighting synchronized line-by-line with execution steps.

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

### Essential Commands
- **Install Dependencies:** `npm install` (inside `./app`)
- **Start Dev Server:** `npm run dev` (runs on `http://localhost:4300`)
- **Type & Template Check:** `npm run check`
- **Run Unit Tests:** `npm run test:unit`
- **Run E2E Tests:** `npm run test:e2e`

---

*(This document is updated at the conclusion of each project phase).*
