import { algorithmRegistry } from '../AlgorithmRegistry';
import { LinearSearch } from './LinearSearch';
import { BinarySearch } from './BinarySearch';
import { JumpSearch } from './JumpSearch';

/**
 * Searching category barrel. Importing this module registers every searching
 * algorithm exactly once. To add a new search: create the class, add one line.
 */
export const SEARCHING_ALGORITHMS = [
  new LinearSearch(),
  new BinarySearch(),
  new JumpSearch(),
] as const;

algorithmRegistry.registerAll(SEARCHING_ALGORITHMS);

export { LinearSearch, BinarySearch, JumpSearch };
export * from './SearchStep';
export type { SearchTracer } from './SearchTracer';
