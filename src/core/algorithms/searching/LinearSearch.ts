import type { AlgorithmMeta } from '../types';
import { SearchingAlgorithm, SEARCHING_CATEGORY } from './SearchingAlgorithm';
import type { SearchTracer } from './SearchTracer';

export class LinearSearch extends SearchingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'linear-search',
    name: 'Linear Search',
    category: SEARCHING_CATEGORY,
    description:
      'Scans the collection from one end, comparing each element to the target until a match is found or the data runs out. Makes no assumptions about ordering — the baseline every other search improves upon.',
    complexity: {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    accent: '#22d3ee',
  };

  protected search(t: SearchTracer): void {
    const n = t.length;
    for (let i = 0; i < n; i += 1) {
      t.bounds(i, n - 1, 'remaining candidates');
      t.probe(i);
      if (t.value(i) === t.target) {
        t.found(i, `found the target at index ${i}`);
        return;
      }
      t.eliminate(i, i);
    }
    t.exhausted('reached the end without a match');
  }
}
