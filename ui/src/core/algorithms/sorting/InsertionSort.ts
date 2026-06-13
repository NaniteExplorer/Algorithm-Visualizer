import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class InsertionSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: SORTING_CATEGORY,
    description:
      'Builds the sorted array one element at a time by lifting the current key and shifting larger elements right until the key drops into place. Excellent on small or nearly-sorted inputs.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: true,
    },
    accent: '#34d399',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    t.markSorted(0); // first element is a trivially sorted prefix
    for (let i = 1; i < n; i += 1) {
      const key = t.value(i);
      t.select(i, 'key', 'lift current key');
      let j = i - 1;
      while (j >= 0) {
        t.compare(j, j + 1);
        if (t.value(j) > key) {
          t.overwrite(j + 1, t.value(j)); // shift larger element right
          j -= 1;
        } else {
          break;
        }
      }
      t.overwrite(j + 1, key); // drop the key into the gap
      t.deselect(i);
    }
  }
}
