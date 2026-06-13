'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { algorithmRegistry, type AlgorithmCategory, type AlgorithmMeta } from '@/core/algorithms';
import { PlaybackController } from '@/core/playback/PlaybackController';
import { VisualizationEngine } from '@/core/visualization/engine/VisualizationEngine';
import { VisualizerFactory } from '@/core/visualization/VisualizerFactory';
import type { ControlSpec, LegendItem, MetricSpec } from '@/core/visualization/CategoryModule';

export interface VisualizerActions {
  play(): void;
  pause(): void;
  toggle(): void;
  stepForward(): void;
  stepBackward(): void;
  seek(index: number): void;
  setSpeed(stepsPerSecond: number): void;
  regenerate(): void;
  selectAlgorithm(id: string): void;
  setParam(key: string, value: number): void;
}

/**
 * The single React ⇄ engine bridge, generic over the algorithm family.
 *
 * It owns the imperative object graph (engine, playback controller, and the
 * family's {@link CategoryModule}) in refs so React re-renders never recreate
 * the WebGL world, and surfaces playback state through `useSyncExternalStore`
 * so the UI stays in lock-step with the render loop without polling.
 *
 * Everything below the hook is category-blind: the only family-specific code is
 * the `CategoryModule` resolved from the factory. The hook is instantiated once
 * per category (the studio remounts on category change via a React `key`), which
 * guarantees clean WebGL teardown without any dynamic re-subscription.
 */
export function useVisualizer(category: AlgorithmCategory) {
  const algorithms = useMemo<AlgorithmMeta[]>(
    () => algorithmRegistry.listByCategory(category).map((a) => a.meta),
    [category],
  );

  const [algorithmId, setAlgorithmId] = useState(algorithms[0]?.id ?? '');

  // Imperative singletons — created exactly once for this category's lifetime.
  const graph = useRef<{
    vizModule: ReturnType<typeof VisualizerFactory.create>;
    controller: PlaybackController<unknown>;
  } | null>(null);
  if (!graph.current) {
    const vizModule = VisualizerFactory.create(category);
    const controller = new PlaybackController<unknown>(vizModule.model, {
      getMetrics: () => vizModule.metrics(),
      getNote: (step) => vizModule.describe(step),
      speed: 30,
    });
    graph.current = { vizModule, controller };
  }
  const { vizModule, controller } = graph.current;

  const [params, setParams] = useState<Record<string, number>>(() =>
    Object.fromEntries(vizModule.controls.map((c) => [c.key, c.default])),
  );

  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const algorithmIdRef = useRef(algorithmId);
  const paramsRef = useRef(params);
  algorithmIdRef.current = algorithmId;
  paramsRef.current = params;

  // Run the *current* algorithm against the *current* dataset.
  const reloadTimeline = useCallback(() => {
    const algorithm = algorithmRegistry.require(algorithmIdRef.current);
    controller.load(vizModule.buildTimeline(algorithm));
  }, [vizModule, controller]);

  // Fresh random dataset → re-layout the scene → recompute the timeline.
  const regenerate = useCallback(() => {
    vizModule.regenerate(paramsRef.current);
    vizModule.rebuild();
    reloadTimeline();
  }, [vizModule, reloadTimeline]);

  // Engine lifecycle — mount on first paint, fully dispose on unmount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = new VisualizationEngine(vizModule.engineOptions);
    engine.mount(container);
    vizModule.visualizer.attach(engine);
    // The engine's clock is the single time source: it advances playback, which
    // mutates the model, which the visualizer reads on the very same frame.
    const unsubscribe = engine.onFrame((ctx) => controller.advance(ctx.dt * 1000));
    regenerate();

    return () => {
      unsubscribe();
      vizModule.visualizer.detach();
      engine.dispose();
    };
    // Intentionally run once: the imperative graph is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo<VisualizerActions>(
    () => ({
      play: () => controller.play(),
      pause: () => controller.pause(),
      toggle: () => controller.toggle(),
      stepForward: () => controller.stepForward(),
      stepBackward: () => controller.stepBackward(),
      seek: (index) => controller.seek(index),
      setSpeed: (s) => controller.setSpeed(s),
      regenerate: () => regenerate(),
      selectAlgorithm: (id) => {
        setAlgorithmId(id);
        algorithmIdRef.current = id;
        reloadTimeline();
      },
      setParam: (key, value) => {
        setParams((prev) => {
          const next = { ...prev, [key]: value };
          paramsRef.current = next;
          return next;
        });
        regenerate();
      },
    }),
    [controller, regenerate, reloadTimeline],
  );

  const currentMeta = useMemo(
    () => algorithms.find((a) => a.id === algorithmId) ?? algorithms[0],
    [algorithms, algorithmId],
  );

  return {
    containerRef,
    snapshot,
    algorithms,
    algorithmId,
    currentMeta,
    params,
    controls: vizModule.controls as ControlSpec[],
    metricSpecs: vizModule.metricSpecs as MetricSpec[],
    legend: vizModule.legend() as LegendItem[],
    actions,
  };
}
