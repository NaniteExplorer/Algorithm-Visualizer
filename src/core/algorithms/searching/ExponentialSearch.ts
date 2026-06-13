import type { AlgorithmMeta } from '../types';
import { SearchingAlgorithm, SEARCHING_CATEGORY } from './SearchingAlgorithm';
import type { SearchTracer } from './SearchTracer';

export class ExponentialSearch extends SearchingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'exponential-search',
    name: 'Exponential Search',
    category: SEARCHING_CATEGORY,
    description:
      'On sorted data, doubles an index (1, 2, 4, 8 …) until it overshoots the target, then runs a binary search inside the last bracket. Finds the range in O(log i) where i is the answer index — ideal for unbounded or front-loaded data.',
    complexity: {
      time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(1)',
    },
    accent: '#38bdf8',
  };

  protected search(t: SearchTracer): void {
    const n = t.length;
    if (n === 0) {
      t.exhausted('empty collection');
      return;
    }

    // A hit at index 0 is the base case the doubling phase assumes away.
    t.probe(0);
    if (t.value(0) === t.target) {
      t.found(0, 'found the target at index 0');
      return;
    }
    t.eliminate(0, 0);

    // Phase 1 — double the bound until value[bound] ≥ target (or we run off the end).
    let bound = 1;
    while (bound < n && t.value(bound) < t.target) {
      t.bounds(0, bound, `double the bound to ${bound}`);
      t.probe(bound);
      t.eliminate(Math.floor(bound / 2), bound, 'target lies further ahead');
      bound *= 2;
    }

    // Phase 2 — binary search within the bracket (bound/2, min(bound, n-1)].
    let lo = Math.floor(bound / 2);
    let hi = Math.min(bound, n - 1);
    t.bounds(lo, hi, 'binary search within the bracket');
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      t.probe(mid);
      const v = t.value(mid);
      if (v === t.target) {
        t.found(mid, `found the target at index ${mid}`);
        return;
      }
      if (v < t.target) {
        t.eliminate(lo, mid, 'target is greater — discard the lower half');
        lo = mid + 1;
      } else {
        t.eliminate(mid, hi, 'target is smaller — discard the upper half');
        hi = mid - 1;
      }
      if (lo <= hi) t.bounds(lo, hi);
    }
    t.exhausted('target is absent');
  }
}
