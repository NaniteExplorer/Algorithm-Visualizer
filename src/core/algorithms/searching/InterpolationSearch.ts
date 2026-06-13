import type { AlgorithmMeta } from '../types';
import { SearchingAlgorithm, SEARCHING_CATEGORY } from './SearchingAlgorithm';
import type { SearchTracer } from './SearchTracer';

export class InterpolationSearch extends SearchingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    category: SEARCHING_CATEGORY,
    description:
      'Like binary search, but instead of always probing the middle it estimates where the target should sit from the values at the window ends — assuming roughly uniform spacing. On uniformly distributed data this reaches O(log log n); on skewed data it degrades to O(n).',
    complexity: {
      time: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    accent: '#fbbf24',
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

    while (lo <= hi && t.target >= t.value(lo) && t.target <= t.value(hi)) {
      const loVal = t.value(lo);
      const hiVal = t.value(hi);

      // Estimate the target's position from the value gradient across [lo, hi].
      let pos: number;
      if (hiVal === loVal) {
        pos = lo; // flat window — fall back to the low end
      } else {
        pos = lo + Math.floor(((t.target - loVal) * (hi - lo)) / (hiVal - loVal));
      }
      pos = Math.max(lo, Math.min(hi, pos));

      t.probe(pos, `interpolate to index ${pos}`);
      const v = t.value(pos);
      if (v === t.target) {
        t.found(pos, `found the target at index ${pos}`);
        return;
      }
      if (v < t.target) {
        t.eliminate(lo, pos, 'estimate too low — search higher');
        lo = pos + 1;
      } else {
        t.eliminate(pos, hi, 'estimate too high — search lower');
        hi = pos - 1;
      }
      if (lo <= hi) t.bounds(lo, hi);
    }
    t.exhausted('target is absent');
  }
}
