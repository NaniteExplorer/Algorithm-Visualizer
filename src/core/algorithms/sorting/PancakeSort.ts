import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class PancakeSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'pancake-sort',
    name: 'Pancake Sort',
    category: SORTING_CATEGORY,
    description:
      'The only allowed operation is a prefix flip — reverse the first k elements, like flipping a stack of pancakes with a spatula. Each round flips the largest unsorted value to the front, then flips it down to its final place at the back.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: false,
    },
    accent: '#fb7185',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    for (let size = n; size > 1; size -= 1) {
      // Locate the largest value within the unsorted prefix [0, size).
      let maxIdx = 0;
      t.select(0, 'max', 'scan for the largest unsorted value');
      for (let i = 1; i < size; i += 1) {
        t.compare(i, maxIdx);
        if (t.value(i) > t.value(maxIdx)) {
          t.deselect(maxIdx);
          maxIdx = i;
          t.select(maxIdx, 'max');
        }
      }
      t.deselect(maxIdx);

      // Flip it to the front (unless it is already there), then flip the whole
      // prefix so it lands at index size-1, its final sorted position.
      if (maxIdx !== 0) this.flip(t, maxIdx);
      this.flip(t, size - 1);
      t.markSorted(size - 1);
    }
    t.markSorted(0);
  }

  /** Reverse the prefix [0, k] using adjacent-respecting swaps so it animates. */
  private flip(t: SortTracer, k: number): void {
    let lo = 0;
    let hi = k;
    while (lo < hi) {
      t.swap(lo, hi, `flip prefix of length ${k + 1}`);
      lo += 1;
      hi -= 1;
    }
  }
}
