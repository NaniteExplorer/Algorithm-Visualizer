import type { AlgorithmMeta } from '../types';
import { GraphAlgorithm, GRAPH_CATEGORY } from './GraphAlgorithm';
import type { GraphTracer } from './GraphTracer';

export class Dijkstra extends GraphAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'dijkstra',
    name: "Dijkstra's",
    category: GRAPH_CATEGORY,
    description:
      'Grows a tree of shortest paths from the start, always settling the unvisited node with the smallest known distance and relaxing its edges. Optimal for graphs with non-negative weights.',
    complexity: {
      time: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
      space: 'O(V)',
    },
    accent: '#34d399',
  };

  protected explore(t: GraphTracer): void {
    const { start, goal, size } = t;
    const dist = new Array<number>(size).fill(Infinity);
    const settled = new Set<number>();
    const parent = new Map<number, number>();
    dist[start] = 0;
    t.frontier(start, 'start has distance 0');

    for (;;) {
      // Select the unsettled node with the minimum tentative distance.
      let u = -1;
      let best = Infinity;
      for (let v = 0; v < size; v += 1) {
        if (!settled.has(v) && dist[v] < best) {
          best = dist[v];
          u = v;
        }
      }
      if (u === -1) break; // remaining nodes are unreachable

      t.visit(u, `settle nearest node (distance ${best})`);
      settled.add(u);
      if (u === goal) {
        t.settle(u, 'reached the goal');
        break;
      }

      for (const { to, w } of t.neighbors(u)) {
        t.explore(u, to);
        if (settled.has(to)) continue;
        const nd = dist[u] + w;
        if (nd < dist[to]) {
          const firstReach = dist[to] === Infinity;
          dist[to] = nd;
          parent.set(to, u);
          if (firstReach) t.frontier(to, 'discover a new node');
          t.relax(u, to, nd, `relax edge → distance ${nd}`);
        }
      }
      t.settle(u);
    }

    this.reconstructPath(t, parent, start, goal);
  }
}
