import { algorithmRegistry } from '../AlgorithmRegistry';
import { BSTInsert } from './BSTInsert';
import { BSTSearch } from './BSTSearch';
import { InorderTraversal, PreorderTraversal, PostorderTraversal } from './Traversals';

/**
 * Tree category barrel. Importing this module registers every tree algorithm
 * exactly once. To add a new one: create the class, add one line here.
 */
export const TREE_ALGORITHMS = [
  new BSTInsert(),
  new BSTSearch(),
  new InorderTraversal(),
  new PreorderTraversal(),
  new PostorderTraversal(),
] as const;

algorithmRegistry.registerAll(TREE_ALGORITHMS);

export { BSTInsert, BSTSearch, InorderTraversal, PreorderTraversal, PostorderTraversal };
export * from './TreeStep';
export { buildBST } from './buildTree';
export type { TreeTracer } from './TreeTracer';
