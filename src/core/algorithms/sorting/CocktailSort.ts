import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class CocktailSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'cocktail-sort',
    name: 'Cocktail Shaker',
    category: SORTING_CATEGORY,
    description:
      'A bidirectional bubble sort: each round bubbles the largest element to the right, then the smallest to the left. Shaking both ways clears "turtles" (small values near the end) faster than plain bubble sort.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: true,
    },
    accent: '#ec4899',
  };

  protected sort(t: SortTracer): void {
    let lo = 0;
    let hi = t.length - 1;
    let swapped = true;

    while (swapped && lo < hi) {
      swapped = false;
      // Forward pass — bubble the largest up to `hi`.
      for (let i = lo; i < hi; i += 1) {
        t.compare(i, i + 1);
        if (t.value(i) > t.value(i + 1)) {
          t.swap(i, i + 1);
          swapped = true;
        }
      }
      t.markSorted(hi);
      hi -= 1;
      if (!swapped) break;

      swapped = false;
      // Backward pass — sink the smallest down to `lo`.
      for (let i = hi; i > lo; i -= 1) {
        t.compare(i - 1, i);
        if (t.value(i - 1) > t.value(i)) {
          t.swap(i - 1, i);
          swapped = true;
        }
      }
      t.markSorted(lo);
      lo += 1;
    }
  }
}
