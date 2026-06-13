import { algorithmRegistry } from '../AlgorithmRegistry';
import { BreadthFirstSearch } from './BreadthFirstSearch';
import { DepthFirstSearch } from './DepthFirstSearch';
import { Dijkstra } from './Dijkstra';
import { AStar } from './AStar';

/**
 * Graph category barrel. Importing this module registers every graph algorithm
 * exactly once. To add a new one: create the class, add one line here.
 */
export const GRAPH_ALGORITHMS = [
  new BreadthFirstSearch(),
  new DepthFirstSearch(),
  new Dijkstra(),
  new AStar(),
] as const;

algorithmRegistry.registerAll(GRAPH_ALGORITHMS);

export { BreadthFirstSearch, DepthFirstSearch, Dijkstra, AStar };
export * from './GraphStep';
export type { GraphTracer } from './GraphTracer';
