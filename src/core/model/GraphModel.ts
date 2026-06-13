import {
  type GraphEdge,
  type GraphInput,
  type GraphNode,
  type GraphStep,
  GraphStepKind,
  edgeKey,
} from '../algorithms/graph/GraphStep';
import type { StepConsumer } from '../playback/PlaybackController';

/** Visual status of a graph node. */
export enum GraphNodeRole {
  Default = 'default',
  Start = 'start',
  Goal = 'goal',
  Frontier = 'frontier',
  Current = 'current',
  Settled = 'settled',
  Path = 'path',
}

/** Visual status of a graph edge. */
export enum GraphEdgeRole {
  Default = 'default',
  Explored = 'explored',
  Path = 'path',
}

export interface GraphMetrics {
  visited: number;
  explored: number;
  relaxed: number;
}

/**
 * Authoritative logical state for a graph run — pure and replayable like the
 * other models. Holds the static topology (nodes + positions + edges) plus the
 * dynamic overlay (frontier, current, settled, path) that the visualizer pulls
 * each frame. Layout lives in the node positions, computed once at generation.
 */
export class GraphModel implements StepConsumer<GraphStep> {
  private _nodes: GraphNode[] = [];
  private _edges: GraphEdge[] = [];
  private _start = 0;
  private _goal = 0;

  private current = -1;
  private readonly frontier = new Set<number>();
  private readonly settled = new Set<number>();
  private readonly path = new Set<number>();
  private readonly pathEdges = new Set<string>();
  private readonly exploredEdges = new Set<string>();

  private _metrics: GraphMetrics = { visited: 0, explored: 0, relaxed: 0 };

  reset(input: GraphInput): void {
    this._nodes = input.nodes;
    this._edges = input.edges;
    this._start = input.start;
    this._goal = input.goal;
    this.current = -1;
    this.frontier.clear();
    this.settled.clear();
    this.path.clear();
    this.pathEdges.clear();
    this.exploredEdges.clear();
    this._metrics = { visited: 0, explored: 0, relaxed: 0 };
  }

  rewind(): void {
    this.reset({
      nodes: this._nodes,
      edges: this._edges,
      start: this._start,
      goal: this._goal,
    });
  }

  get nodes(): readonly GraphNode[] {
    return this._nodes;
  }
  get edges(): readonly GraphEdge[] {
    return this._edges;
  }
  get metrics(): GraphMetrics {
    return { ...this._metrics };
  }

  nodeRole(id: number): GraphNodeRole {
    if (this.path.has(id)) return GraphNodeRole.Path;
    if (id === this._start) return GraphNodeRole.Start;
    if (id === this._goal) return GraphNodeRole.Goal;
    if (id === this.current) return GraphNodeRole.Current;
    if (this.settled.has(id)) return GraphNodeRole.Settled;
    if (this.frontier.has(id)) return GraphNodeRole.Frontier;
    return GraphNodeRole.Default;
  }

  edgeRole(u: number, v: number): GraphEdgeRole {
    const key = edgeKey(u, v);
    if (this.pathEdges.has(key)) return GraphEdgeRole.Path;
    if (this.exploredEdges.has(key)) return GraphEdgeRole.Explored;
    return GraphEdgeRole.Default;
  }

  apply(step: GraphStep): void {
    switch (step.kind) {
      case GraphStepKind.Frontier:
        if (step.node !== undefined) this.frontier.add(step.node);
        break;
      case GraphStepKind.Visit:
        if (step.node !== undefined) {
          this.current = step.node;
          this.frontier.delete(step.node);
          this._metrics.visited += 1;
        }
        break;
      case GraphStepKind.Explore:
        if (step.from !== undefined && step.to !== undefined) {
          this.exploredEdges.add(edgeKey(step.from, step.to));
          this._metrics.explored += 1;
        }
        break;
      case GraphStepKind.Relax:
        this._metrics.relaxed += 1;
        break;
      case GraphStepKind.Settle:
        if (step.node !== undefined) this.settled.add(step.node);
        break;
      case GraphStepKind.Path:
        if (step.node !== undefined) {
          this.path.add(step.node);
          if (step.from !== undefined) this.pathEdges.add(edgeKey(step.from, step.node));
        }
        break;
      case GraphStepKind.Done:
        this.current = -1;
        break;
    }
  }
}
