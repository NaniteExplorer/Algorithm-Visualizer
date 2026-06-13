import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class SelectionSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: SORTING_CATEGORY,
    description:
      'Divides the array into a sorted prefix and an unsorted remainder, repeatedly selecting the minimum of the remainder and swapping it to the boundary. Always quadratic, but performs at most n−1 swaps.',
    complexity: {
      time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: false,
    },
    accent: '#fbbf24',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    for (let i = 0; i < n - 1; i += 1) {
      let minIdx = i;
      t.select(minIdx, 'min', 'assume current minimum');
      for (let j = i + 1; j < n; j += 1) {
        t.compare(j, minIdx);
        if (t.value(j) < t.value(minIdx)) {
          t.deselect(minIdx);
          minIdx = j;
          t.select(minIdx, 'min', 'new minimum found');
        }
      }
      if (minIdx !== i) t.swap(i, minIdx);
      t.deselect(minIdx);
      t.markSorted(i);
    }
    t.markSorted(n - 1);
  }
}
