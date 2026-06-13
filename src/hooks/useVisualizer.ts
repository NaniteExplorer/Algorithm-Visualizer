'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { algorithmRegistry, AlgorithmCategory, type AlgorithmMeta } from '@/core/algorithms';
import type { SortStep } from '@/core/algorithms/sorting/SortStep';
import { describeSortStep } from '@/core/algorithms/sorting/describe';
import { PlaybackController } from '@/core/playback/PlaybackController';
import { VisualizationEngine } from '@/core/visualization/engine/VisualizationEngine';
import { VisualizerFactory } from '@/core/visualization/VisualizerFactory';

const DEFAULT_SIZE = 40;
const VALUE_MIN = 8;
const VALUE_MAX = 100;

function randomArray(size: number): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * (VALUE_MAX - VALUE_MIN + 1)) + VALUE_MIN,
  );
}

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
  setArraySize(size: number): void;
}

/**
 * The single React ⇄ engine bridge.
 *
 * It owns the imperative object graph (engine, playback controller, model +
 * visualizer bundle) in refs so React re-renders never recreate the WebGL
 * world, and surfaces playback state through `useSyncExternalStore` so the UI
 * stays in lock-step with the render loop without polling. Everything below the
 * hook is category-blind; today it wires the Sorting bundle, but swapping in a
 * future category is a one-line factory change.
 */
export function useVisualizer() {
  const algorithms = useMemo<AlgorithmMeta[]>(
    () => algorithmRegistry.listByCategory(AlgorithmCategory.Sorting).map((a) => a.meta),
    [],
  );

  const [algorithmId, setAlgorithmId] = useState(algorithms[0]?.id ?? '');
  const [arraySize, setArraySizeState] = useState(DEFAULT_SIZE);

  // Imperative singletons — created exactly once for the component's lifetime.
  const graph = useRef<{
    bundle: ReturnType<typeof VisualizerFactory.create>;
    controller: PlaybackController<SortStep>;
  } | null>(null);
  if (!graph.current) {
    const bundle = VisualizerFactory.create(AlgorithmCategory.Sorting);
    const controller = new PlaybackController<SortStep>(bundle.model, {
      getMetrics: () => ({ ...bundle.model.metrics }),
      getNote: (step) => describeSortStep(step),
      speed: 30,
    });
    graph.current = { bundle, controller };
  }
  const { bundle, controller } = graph.current;

  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentArray = useRef<number[]>([]);
  const algorithmIdRef = useRef(algorithmId);
  const arraySizeRef = useRef(arraySize);
  algorithmIdRef.current = algorithmId;

  // Recompute the timeline for the *current* dataset + selected algorithm.
  const loadTimeline = useCallback(
    (array: number[]) => {
      const algorithm = algorithmRegistry.require(algorithmIdRef.current);
      bundle.model.reset(array);
      controller.load(algorithm.run(array) as SortStep[]);
    },
    [bundle, controller],
  );

  const regenerate = useCallback(
    (size = arraySizeRef.current) => {
      const array = randomArray(size);
      currentArray.current = array;
      loadTimeline(array);
      bundle.rebuild();
    },
    [bundle, loadTimeline],
  );

  // Engine lifecycle — mount on first paint, fully dispose on unmount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = new VisualizationEngine({ enableControls: true, autoRotate: false });
    engine.mount(container);
    bundle.visualizer.attach(engine);
    // The engine's clock is the single time source: it advances playback, which
    // mutates the model, which the visualizer reads on the very same frame.
    const unsubscribe = engine.onFrame((ctx) => controller.advance(ctx.dt * 1000));
    regenerate(arraySizeRef.current);

    return () => {
      unsubscribe();
      bundle.visualizer.detach();
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
        loadTimeline(currentArray.current);
      },
      setArraySize: (size) => {
        setArraySizeState(size);
        arraySizeRef.current = size;
        regenerate(size);
      },
    }),
    [controller, regenerate, loadTimeline],
  );

  const currentMeta = useMemo(
    () => algorithms.find((a) => a.id === algorithmId) ?? algorithms[0],
    [algorithms, algorithmId],
  );

  return { containerRef, snapshot, algorithms, algorithmId, currentMeta, arraySize, actions };
}
