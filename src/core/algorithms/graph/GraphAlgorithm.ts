import { type Algorithm, AlgorithmCategory, type AlgorithmMeta } from '../types';
import type { GraphInput, GraphStep } from './GraphStep';
import { GraphTracer } from './GraphTracer';

/**
 * Abstract base for every graph algorithm. Subclasses implement `explore` and
 * use the shared `reconstructPath` helper to emit the final path once a parent
 * map has been built. The base owns input plumbing and the deterministic
 * timeline return.
 */
export abstract class GraphAlgorithm implements Algorithm<GraphInput, GraphStep> {
  abstract readonly meta: AlgorithmMeta;

  protected abstract explore(tracer: GraphTracer): void;

  run(input: GraphInput): GraphStep[] {
    const tracer = new GraphTracer(input);
    this.explore(tracer);
    return [...tracer.steps];
  }

  /**
   * Walk a `child → parent` map back from `goal` to `start` and emit the path
   * (or a terminal "unreachable" step). Shared by all four search algorithms.
   */
  protected reconstructPath(
    t: GraphTracer,
    parent: Map<number, number>,
    start: number,
    goal: number,
  ): void {
    const seq: number[] = [];
    let cur: number | undefined = goal;
    while (cur !== undefined) {
      seq.push(cur);
      if (cur === start) break;
      cur = parent.get(cur);
    }
    if (seq[seq.length - 1] !== start) {
      t.done('the goal is unreachable from the start');
      return;
    }
    seq.reverse();
    let prev: number | undefined;
    for (const node of seq) {
      t.path(node, prev);
      prev = node;
    }
    t.done(`shortest path found — ${seq.length} nodes`);
  }
}

export const GRAPH_CATEGORY = AlgorithmCategory.Graph;
