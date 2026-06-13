import { algorithmRegistry } from '../AlgorithmRegistry';
import { BubbleSort } from './BubbleSort';
import { InsertionSort } from './InsertionSort';
import { SelectionSort } from './SelectionSort';
import { MergeSort } from './MergeSort';
import { QuickSort } from './QuickSort';
import { HeapSort } from './HeapSort';
import { ShellSort } from './ShellSort';
import { CocktailSort } from './CocktailSort';
import { CombSort } from './CombSort';
import { RadixSort } from './RadixSort';
import { GnomeSort } from './GnomeSort';
import { OddEvenSort } from './OddEvenSort';
import { PancakeSort } from './PancakeSort';

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
  new ShellSort(),
  new CombSort(),
  new CocktailSort(),
  new MergeSort(),
  new QuickSort(),
  new HeapSort(),
  new RadixSort(),
  new GnomeSort(),
  new OddEvenSort(),
  new PancakeSort(),
] as const;

algorithmRegistry.registerAll(SORTING_ALGORITHMS);

export {
  BubbleSort,
  InsertionSort,
  SelectionSort,
  MergeSort,
  QuickSort,
  HeapSort,
  ShellSort,
  CocktailSort,
  CombSort,
  RadixSort,
  GnomeSort,
  OddEvenSort,
  PancakeSort,
};
export * from './SortStep';
export type { SortTracer } from './SortTracer';
