import { algorithmRegistry } from '../AlgorithmRegistry';
import { BubbleSort } from './BubbleSort';
import { InsertionSort } from './InsertionSort';
import { SelectionSort } from './SelectionSort';
import { MergeSort } from './MergeSort';
import { QuickSort } from './QuickSort';

/**
 * Sorting category barrel.
 *
 * Importing this module registers every sorting algorithm exactly once (the
 * registry throws on duplicate ids, so accidental double-registration surfaces
 * loudly). To add a new sort: create the class, then add one line here.
 */
export const SORTING_ALGORITHMS = [
  new BubbleSort(),
  new InsertionSort(),
  new SelectionSort(),
  new MergeSort(),
  new QuickSort(),
] as const;

algorithmRegistry.registerAll(SORTING_ALGORITHMS);

export { BubbleSort, InsertionSort, SelectionSort, MergeSort, QuickSort };
export * from './SortStep';
export type { SortTracer } from './SortTracer';
