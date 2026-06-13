import type { AnyAlgorithm } from '@/core/algorithms';
import { describeGraphStep } from '@/core/algorithms/graph/describe';
import {
  type GraphEdge,
  type GraphInput,
  type GraphNode,
  type GraphStep,
  edgeKey,
} from '@/core/algorithms/graph/GraphStep';
import { GraphModel } from '@/core/model/GraphModel';
import { CategoryModule, type ControlSpec, type LegendItem, type MetricSpec } from '../CategoryModule';
import type { EngineOptions } from '../engine/VisualizationEngine';
import { GRAPH_LEGEND, GRAPH_NODE_STYLES } from './palette';
import { GraphVisualizer } from './GraphVisualizer';

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a connected weighted graph on a jittered grid. A nearest-neighbour
 * spanning tree guarantees connectivity (so a path always exists), then each
 * node gains a few extra short edges for richness. Weights are rounded
 * straight-line distances, which keeps the A* heuristic admissible.
 */
function makeGraph(n: number, k = 3): GraphInput {
  const cols = Math.ceil(Math.sqrt(n));
  const spacing = 13;
  const jitter = 4.5;

  const nodes: GraphNode[] = [];
  for (let i = 0; i < n; i += 1) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    nodes.push({
      id: i,
      x: (c - (cols - 1) / 2) * spacing + rand(-jitter, jitter),
      y: rand(-2, 2),
      z: (r - (cols - 1) / 2) * spacing + rand(-jitter, jitter),
    });
  }

  const dist = (a: number, b: number) =>
    Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y, nodes[a].z - nodes[b].z);

  const seen = new Set<string>();
  const edges: GraphEdge[] = [];
  const add = (a: number, b: number) => {
    if (a === b) return;
    const key = edgeKey(a, b);
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ u: a, v: b, w: Math.max(1, Math.round(dist(a, b))) });
  };

  // Spanning tree: connect each node to its nearest predecessor.
  for (let i = 1; i < n; i += 1) {
    let best = 0;
    let bd = Infinity;
    for (let j = 0; j < i; j += 1) {
      const d = dist(i, j);
      if (d < bd) {
        bd = d;
        best = j;
      }
    }
    add(i, best);
  }

  // Enrich with each node's k nearest neighbours.
  for (let i = 0; i < n; i += 1) {
    const others: { j: number; d: number }[] = [];
    for (let j = 0; j < n; j += 1) if (j !== i) others.push({ j, d: dist(i, j) });
    others.sort((a, b) => a.d - b.d);
    for (let m = 0; m < Math.min(k, others.length); m += 1) add(i, others[m].j);
  }

  // Start at node 0; goal is the node farthest from it (a meaningful path).
  const start = 0;
  let goal = 0;
  let gd = -1;
  for (let i = 1; i < n; i += 1) {
    const d = dist(start, i);
    if (d > gd) {
      gd = d;
      goal = i;
    }
  }

  return { nodes, edges, start, goal };
}

/** Graph family driver. */
export class GraphModule extends CategoryModule<GraphStep> {
  readonly engineOptions: EngineOptions = {
    enableControls: true,
    autoRotate: false,
    bloomStrength: 0.95,
    cameraPosition: [0, 48, 66],
    cameraTarget: [0, 0, 0],
  };

  readonly controls: ControlSpec[] = [
    { key: 'nodes', label: 'Nodes', min: 8, max: 40, step: 1, default: 22 },
  ];

  readonly metricSpecs: MetricSpec[] = [
    { key: 'visited', label: 'visited' },
    { key: 'explored', label: 'edges' },
    { key: 'relaxed', label: 'relaxed' },
  ];

  readonly model = new GraphModel();
  readonly visualizer = new GraphVisualizer(this.model);

  private input: GraphInput = { nodes: [], edges: [], start: 0, goal: 0 };

  metrics(): Record<string, number> {
    return { ...this.model.metrics };
  }

  legend(): LegendItem[] {
    return GRAPH_LEGEND.map(({ role, label }) => ({
      color: GRAPH_NODE_STYLES[role].color,
      label,
    }));
  }

  regenerate(params: Record<string, number>): void {
    this.input = makeGraph(Math.round(params.nodes ?? 22));
    this.model.reset(this.input);
  }

  buildTimeline(algorithm: AnyAlgorithm): GraphStep[] {
    return (algorithm as { run(input: GraphInput): GraphStep[] }).run(this.input);
  }

  describe(step: GraphStep): string {
    return describeGraphStep(step);
  }

  rebuild(): void {
    this.visualizer.rebuild();
  }
}
