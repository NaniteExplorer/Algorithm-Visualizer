import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class GnomeSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'gnome-sort',
    name: 'Gnome Sort',
    category: SORTING_CATEGORY,
    description:
      'Walks forward comparing adjacent pairs; when it finds one out of order it swaps and steps back, otherwise it steps forward — like a garden gnome sorting flower pots. Conceptually it is insertion sort with a single index and no nested loop.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: true,
    },
    accent: '#34d399',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    let i = 0;
    while (i < n) {
      if (i === 0) {
        i += 1;
        continue;
      }
      t.compare(i - 1, i);
      if (t.value(i - 1) <= t.value(i)) {
        i += 1; // in order — step forward
      } else {
        t.swap(i - 1, i, 'out of order — swap and step back');
        i -= 1; // step back to re-check the pair behind
      }
    }
  }
}
