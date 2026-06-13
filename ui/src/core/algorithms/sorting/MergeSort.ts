import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class MergeSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: SORTING_CATEGORY,
    description:
      'A divide-and-conquer sort that recursively splits the array in half, sorts each half, then merges the two sorted halves back together. Guarantees O(n log n) and is stable, at the cost of O(n) auxiliary space.',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      stable: true,
    },
    accent: '#22d3ee',
  };

  protected sort(t: SortTracer): void {
    // Snapshot current values into an auxiliary buffer that the recursion reads
    // from; writes always go back through the tracer so the visual stays live.
    const aux: number[] = [];
    for (let i = 0; i < t.length; i += 1) aux[i] = t.value(i);
    this.mergeSort(t, aux, 0, t.length - 1);
  }

  private mergeSort(t: SortTracer, aux: number[], lo: number, hi: number): void {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    this.mergeSort(t, aux, lo, mid);
    this.mergeSort(t, aux, mid + 1, hi);
    this.merge(t, aux, lo, mid, hi);
  }

  private merge(t: SortTracer, aux: number[], lo: number, mid: number, hi: number): void {
    // Refresh the aux window from the live array (lower levels wrote into it).
    for (let k = lo; k <= hi; k += 1) aux[k] = t.value(k);

    let i = lo;
    let j = mid + 1;
    for (let k = lo; k <= hi; k += 1) {
      if (i > mid) {
        t.overwrite(k, aux[j]);
        j += 1;
      } else if (j > hi) {
        t.overwrite(k, aux[i]);
        i += 1;
      } else {
        t.compare(i, j);
        if (aux[i] <= aux[j]) {
          t.overwrite(k, aux[i]);
          i += 1;
        } else {
          t.overwrite(k, aux[j]);
          j += 1;
        }
      }
    }
  }
}
