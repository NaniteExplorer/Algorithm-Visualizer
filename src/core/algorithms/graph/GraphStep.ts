/**
 * The graph category's step vocabulary — the only contract between a graph
 * algorithm and the `GraphVisualizer`. Steps describe nodes entering the
 * frontier, being visited, edges being explored/relaxed, nodes being settled,
 * and the final shortest path.
 */
export enum GraphStepKind {
  /** A node is added to the frontier (queue / stack / priority queue). */
  Frontier = 'frontier',
  /** A node is taken from the frontier and becomes the current node. */
  Visit = 'visit',
  /** An edge (from → to) is being examined. */
  Explore = 'explore',
  /** Relaxation improved the best-known distance to `to` (= `dist`). */
  Relax = 'relax',
  /** A node is finalised — its result will not change again. */
  Settle = 'settle',
  /** A node lies on the final path; `from` is its predecessor on that path. */
  Path = 'path',
  /** The run is finished. */
  Done = 'done',
}

export interface GraphStep {
  readonly kind: GraphStepKind;
  readonly node?: number;
  readonly from?: number;
  readonly to?: number;
  readonly dist?: number;
  readonly note?: string;
}

export interface GraphNode {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface GraphEdge {
  readonly u: number;
  readonly v: number;
  readonly w: number;
}

/** Problem instance for the graph family. */
export interface GraphInput {
  readonly nodes: GraphNode[];
  readonly edges: GraphEdge[];
  readonly start: number;
  readonly goal: number;
}

/** Canonical key for an undirected edge. */
export function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}
