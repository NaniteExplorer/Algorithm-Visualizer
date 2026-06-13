import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class OddEvenSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'odd-even-sort',
    name: 'Odd-Even Sort',
    category: SORTING_CATEGORY,
    description:
      'A brick-wall variant of bubble sort that alternates between comparing all (even, odd) adjacent pairs and all (odd, even) pairs, repeating until a full pass makes no swaps. The phases are independent, which is what makes it a classic parallel-sorting network.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: true,
    },
    accent: '#22d3ee',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    let sorted = false;
    while (!sorted) {
      sorted = true;
      // Odd phase — compare (1,2), (3,4), …
      for (let i = 1; i + 1 < n; i += 2) {
        t.compare(i, i + 1);
        if (t.value(i) > t.value(i + 1)) {
          t.swap(i, i + 1, 'odd phase swap');
          sorted = false;
        }
      }
      // Even phase — compare (0,1), (2,3), …
      for (let i = 0; i + 1 < n; i += 2) {
        t.compare(i, i + 1);
        if (t.value(i) > t.value(i + 1)) {
          t.swap(i, i + 1, 'even phase swap');
          sorted = false;
        }
      }
    }
  }
}
