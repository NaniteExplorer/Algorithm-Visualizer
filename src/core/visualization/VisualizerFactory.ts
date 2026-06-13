import { AlgorithmCategory } from '@/core/algorithms/types';
import { ArrayModel } from '@/core/model/ArrayModel';
import type { Visualizer } from './Visualizer';
import { SortingVisualizer } from './sorting/SortingVisualizer';

/**
 * Maps an algorithm category to the visualizer + model that renders it.
 *
 * This is the rendering-side extension seam that mirrors `AlgorithmRegistry` on
 * the logic side. Adding a family (e.g. graph) means: build its `GraphModel`
 * and `GraphVisualizer`, then add one `case` here. Nothing upstream changes —
 * the engine, playback controller and React hook are all category-blind.
 */
export interface VisualizationBundle {
  /** The state machine the playback controller drives. */
  model: ArrayModel;
  /** The scene renderer that pulls from `model`. */
  visualizer: Visualizer;
  /** Re-layout the scene when a new dataset is generated. */
  rebuild(): void;
}

export class VisualizerFactory {
  static create(category: AlgorithmCategory): VisualizationBundle {
    switch (category) {
      case AlgorithmCategory.Sorting: {
        const model = new ArrayModel();
        const visualizer = new SortingVisualizer(model);
        return { model, visualizer, rebuild: () => visualizer.rebuild() };
      }
      // case AlgorithmCategory.Graph:  → new GraphModel / GraphVisualizer
      // case AlgorithmCategory.Tree:   → new TreeModel / TreeVisualizer
      default:
        throw new Error(
          `VisualizerFactory: no visualizer registered for category "${category}".`,
        );
    }
  }
}
