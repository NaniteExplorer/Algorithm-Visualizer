import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class HeapSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: SORTING_CATEGORY,
    description:
      'Builds a binary max-heap in place, then repeatedly swaps the largest element to the end and sifts the root back down. Guaranteed O(n log n) with O(1) extra space, at the cost of poor cache locality and instability.',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(1)',
      stable: false,
    },
    accent: '#f59e0b',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    // Build a max-heap bottom-up.
    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) this.siftDown(t, i, n);
    // Repeatedly extract the max into its final position.
    for (let end = n - 1; end > 0; end -= 1) {
      t.swap(0, end, 'move max to the sorted region');
      t.markSorted(end);
      this.siftDown(t, 0, end);
    }
  }

  /** Restore the max-heap property for the subtree rooted at `i` within `size`. */
  private siftDown(t: SortTracer, i: number, size: number): void {
    let root = i;
    for (;;) {
      const left = 2 * root + 1;
      const right = 2 * root + 2;
      let largest = root;
      if (left < size) {
        t.compare(left, largest);
        if (t.value(left) > t.value(largest)) largest = left;
      }
      if (right < size) {
        t.compare(right, largest);
        if (t.value(right) > t.value(largest)) largest = right;
      }
      if (largest === root) break;
      t.swap(root, largest);
      root = largest;
    }
  }
}
