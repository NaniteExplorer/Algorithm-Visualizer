import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class CombSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'comb-sort',
    name: 'Comb Sort',
    category: SORTING_CATEGORY,
    description:
      'Improves on bubble sort by comparing elements a shrinking "gap" apart (divided by ~1.3 each pass) before finishing with a gap of one. The large initial gaps kill turtles early, giving near-O(n log n) behaviour in practice.',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n² / 2^p)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: false,
    },
    accent: '#6366f1',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    const shrink = 1.3;
    let gap = n;
    let sorted = false;

    while (!sorted) {
      gap = Math.floor(gap / shrink);
      if (gap <= 1) {
        gap = 1;
        sorted = true; // a final gap-1 pass with no swaps confirms completion
      }
      for (let i = 0; i + gap < n; i += 1) {
        t.compare(i, i + gap, gap > 1 ? `gap ${gap}` : undefined);
        if (t.value(i) > t.value(i + gap)) {
          t.swap(i, i + gap);
          sorted = false;
        }
      }
    }
  }
}
