# AlgoViz

An enterprise-grade, **OOP**, **Three.js**-powered algorithm visualization platform built on **Next.js 15** + **TypeScript**. Classic algorithms are rendered as living, glowing 3D geometry with full transport controls (play / pause / step / scrub / speed).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # strict tsc, no emit
```

## Architecture

The codebase is organised in strict layers, each ignorant of the ones above it. Data flows **down** (algorithm → steps → model → renderer); time flows from a single clock (the engine's render loop).

```
┌─────────────────────────────────────────────────────────────┐
│ React / Next.js  (app/, src/components, src/hooks)            │
│   useVisualizer ── bridges the imperative world to React      │
├─────────────────────────────────────────────────────────────┤
│ Playback         (src/core/playback)                          │
│   PlaybackController — drives a step timeline over time        │
├──────────────────────────────┬──────────────────────────────┤
│ Algorithm (logic)            │ Visualization (rendering)      │
│  src/core/algorithms         │  src/core/visualization        │
│   Algorithm → Step[]         │   VisualizationEngine (Three)  │
│   AlgorithmRegistry          │   Visualizer (abstract)        │
│                              │   VisualizerFactory            │
├──────────────────────────────┴──────────────────────────────┤
│ Model            (src/core/model)                             │
│   ArrayModel — pure, replayable state machine                 │
└─────────────────────────────────────────────────────────────┘
```

### Key design decisions

- **Steps are the only contract** between an algorithm and its renderer. An
  algorithm emits a deterministic `SortStep[]`; the visualizer pulls model state
  every frame. Neither knows the other exists — this is what makes one
  `SortingVisualizer` render *every* sort.
- **Replay-based scrubbing.** Because algorithms are deterministic and the model
  is a pure state machine, stepping backward / seeking is just "rewind + replay
  from start". No inverse-step bookkeeping.
- **Single clock.** The `VisualizationEngine` render loop is the only time
  source: it advances playback (mutating the model) and the visualizer reads the
  model on the same frame. Discrete steps become smooth, frame-rate-independent
  motion via critically-damped tweening.
- **Raw Three.js wrapped in OOP** (not react-three-fiber), per the brief — the
  engine, visualizers and scene objects are plain classes with explicit
  lifecycles and deterministic GPU-resource disposal.

## Extending the platform

### Add a new sorting algorithm

1. Create `src/core/algorithms/sorting/ShellSort.ts` extending `SortingAlgorithm`;
   implement `sort(tracer)` against the `SortTracer` API.
2. Add one line to `src/core/algorithms/sorting/index.ts`.

It now appears in the selector, routing and visualizer automatically.

### Add a whole new family (graph, tree, …)

1. Define its step union (e.g. `graph/GraphStep.ts`) and `GraphModel`
   implementing `StepConsumer`.
2. Implement a `GraphVisualizer extends Visualizer`.
3. Add a `case` to `VisualizerFactory`.
4. Register its algorithms via a `graph/index.ts` barrel imported by
   `src/core/algorithms/index.ts`.

The engine, playback controller, hook and UI are all category-agnostic and need
no changes.

## Tech

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Three.js (WebGL +
UnrealBloom post-processing) · Tailwind CSS.
