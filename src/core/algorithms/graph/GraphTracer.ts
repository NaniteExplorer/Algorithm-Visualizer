import { type GraphInput, type GraphStep, GraphStepKind } from './GraphStep';

interface Adj {
  to: number;
  w: number;
}

/**
 * Ergonomic recorder + read model for graph algorithms. Builds an adjacency
 * list from the input once, exposes neighbour/position/weight queries, and
 * records the step timeline through intention-revealing methods. Neighbours are
 * returned in a stable (ascending) order so runs are deterministic.
 */
export class GraphTracer {
  private readonly _steps: GraphStep[] = [];
  private readonly adjacency: Adj[][];

  constructor(private readonly input: GraphInput) {
    this.adjacency = input.nodes.map(() => []);
    for (const { u, v, w } of input.edges) {
      this.adjacency[u].push({ to: v, w });
      this.adjacency[v].push({ to: u, w });
    }
    for (const list of this.adjacency) list.sort((a, b) => a.to - b.to);
  }

  get steps(): readonly GraphStep[] {
    return this._steps;
  }
  get size(): number {
    return this.input.nodes.length;
  }
  get start(): number {
    return this.input.start;
  }
  get goal(): number {
    return this.input.goal;
  }

  neighbors(u: number): readonly Adj[] {
    return this.adjacency[u];
  }

  /** Straight-line distance between two nodes (the A* heuristic). */
  heuristic(a: number, b: number): number {
    const na = this.input.nodes[a];
    const nb = this.input.nodes[b];
    return Math.hypot(na.x - nb.x, na.y - nb.y, na.z - nb.z);
  }

  // ── Step recorders ──────────────────────────────────────────────────
  frontier(node: number, note?: string): void {
    this._steps.push({ kind: GraphStepKind.Frontier, node, note });
  }
  visit(node: number, note?: string): void {
    this._steps.push({ kind: GraphStepKind.Visit, node, note });
  }
  explore(from: number, to: number, note?: string): void {
    this._steps.push({ kind: GraphStepKind.Explore, from, to, note });
  }
  relax(from: number, to: number, dist: number, note?: string): void {
    this._steps.push({ kind: GraphStepKind.Relax, from, to, dist, note });
  }
  settle(node: number, note?: string): void {
    this._steps.push({ kind: GraphStepKind.Settle, node, note });
  }
  path(node: number, from?: number, note?: string): void {
    this._steps.push({ kind: GraphStepKind.Path, node, from, note });
  }
  done(note?: string): void {
    this._steps.push({ kind: GraphStepKind.Done, note });
  }
}
