import type { AlgorithmMeta } from '../types';
import { SearchingAlgorithm, SEARCHING_CATEGORY } from './SearchingAlgorithm';
import type { SearchTracer } from './SearchTracer';

export class TernarySearch extends SearchingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'ternary-search',
    name: 'Ternary Search',
    category: SEARCHING_CATEGORY,
    description:
      'Splits the sorted window into thirds with two probes per step, discarding two-thirds — or the middle third — each round. It makes more comparisons per step than binary search, so in practice binary search is faster, but it is a clean illustration of multi-way divide-and-conquer.',
    complexity: {
      time: { best: 'O(1)', average: 'O(log₃ n)', worst: 'O(log₃ n)' },
      space: 'O(1)',
    },
    accent: '#c084fc',
  };

  protected search(t: SearchTracer): void {
    const n = t.length;
    if (n === 0) {
      t.exhausted('empty collection');
      return;
    }

    let lo = 0;
    let hi = n - 1;
    t.bounds(lo, hi, 'start with the full window');

    while (lo <= hi) {
      const third = Math.floor((hi - lo) / 3);
      const mid1 = lo + third;
      const mid2 = hi - third;

      t.probe(mid1);
      if (t.value(mid1) === t.target) {
        t.found(mid1, `found the target at index ${mid1}`);
        return;
      }
      t.probe(mid2);
      if (t.value(mid2) === t.target) {
        t.found(mid2, `found the target at index ${mid2}`);
        return;
      }

      if (t.target < t.value(mid1)) {
        t.eliminate(mid1, hi, 'target is below the first third');
        hi = mid1 - 1;
      } else if (t.target > t.value(mid2)) {
        t.eliminate(lo, mid2, 'target is above the last third');
        lo = mid2 + 1;
      } else {
        t.eliminate(lo, mid1, 'narrow to the middle third');
        t.eliminate(mid2, hi);
        lo = mid1 + 1;
        hi = mid2 - 1;
      }
      if (lo <= hi) t.bounds(lo, hi);
    }
    t.exhausted('target is absent');
  }
}
