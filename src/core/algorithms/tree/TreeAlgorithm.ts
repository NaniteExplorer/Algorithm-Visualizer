import { type Algorithm, AlgorithmCategory, type AlgorithmMeta } from '../types';
import type { TreeData, TreeStep } from './TreeStep';
import { TreeTracer } from './TreeTracer';

/**
 * Abstract base for every tree algorithm. Subclasses implement `walk` against
 * the {@link TreeTracer}. The base owns input plumbing and returns the
 * deterministic timeline.
 */
export abstract class TreeAlgorithm implements Algorithm<TreeData, TreeStep> {
  abstract readonly meta: AlgorithmMeta;

  protected abstract walk(tracer: TreeTracer): void;

  run(input: TreeData): TreeStep[] {
    const tracer = new TreeTracer(input);
    this.walk(tracer);
    return [...tracer.steps];
  }
}

export const TREE_CATEGORY = AlgorithmCategory.Tree;
