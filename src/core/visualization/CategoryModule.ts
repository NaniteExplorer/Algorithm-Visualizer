import type { AnyAlgorithm } from '@/core/algorithms';
import type { StepConsumer } from '@/core/playback/PlaybackController';
import type { EngineOptions } from './engine/VisualizationEngine';
import type { Visualizer } from './Visualizer';

/**
 * Declarative description of one interactive parameter (rendered as a slider in
 * the control panel). Each family exposes its own set — "Array size" for
 * sorting/searching, "Nodes"/"Density" for graphs, "Values" for trees — and the
 * UI renders them generically, so the chrome never hard-codes any family.
 */
export interface ControlSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  suffix?: string;
}

/** A coloured entry in the on-canvas legend. */
export interface LegendItem {
  color: string;
  label: string;
}

/** A live counter surfaced in the canvas HUD (e.g. comparisons, visited). */
export interface MetricSpec {
  key: string;
  label: string;
}

/**
 * A self-contained rendering + input driver for a single algorithm family.
 *
 * This is the platform's universal extension seam. It bundles everything that
 * is *category-specific* — the model (a {@link StepConsumer}), the Three.js
 * visualizer, random input generation, per-step narration, and the UI metadata
 * (controls, legend, metrics) — behind one interface. The React hook
 * (`useVisualizer`), the playback controller and every chrome component are
 * built purely against this contract, so adding Searching/Graph/Tree families
 * never touches a line of generic code: implement a `CategoryModule`, then add
 * one `case` to {@link VisualizerFactory}.
 *
 * Lifecycle the hook drives per dataset:
 *   `regenerate(params)` → `rebuild()` → `buildTimeline(algorithm)` → load.
 */
export abstract class CategoryModule<TStep = unknown> {
  /** Engine configuration (camera, bloom, controls) tuned for this family. */
  abstract readonly engineOptions: EngineOptions;
  /** Interactive sliders this family exposes beyond the universal speed slider. */
  abstract readonly controls: ControlSpec[];
  /** Counters shown in the HUD, in display order. */
  abstract readonly metricSpecs: MetricSpec[];
  /** The pure state machine the playback controller drives. */
  abstract readonly model: StepConsumer<TStep>;
  /** The scene renderer that pulls from {@link model} every frame. */
  abstract readonly visualizer: Visualizer;

  /** Live metric values for the current model state. */
  abstract metrics(): Record<string, number>;
  /** Colour key explaining the scene's highlight palette. */
  abstract legend(): LegendItem[];
  /**
   * Generate a fresh random problem instance from `params` and load it into the
   * model. Must leave the model at its initial (pre-run) state.
   */
  abstract regenerate(params: Record<string, number>): void;
  /** Run `algorithm` against the *current* instance and return its timeline. */
  abstract buildTimeline(algorithm: AnyAlgorithm): TStep[];
  /** One-line narration for the step inspector. */
  abstract describe(step: TStep): string;
  /** Re-layout the scene to match the current instance (after `regenerate`). */
  abstract rebuild(): void;
}
