import type { AlgorithmMeta } from '../types';
import { SearchingAlgorithm, SEARCHING_CATEGORY } from './SearchingAlgorithm';
import type { SearchTracer } from './SearchTracer';

export class JumpSearch extends SearchingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'jump-search',
    name: 'Jump Search',
    category: SEARCHING_CATEGORY,
    description:
      'On sorted data, hops forward in fixed-size blocks of √n until it overshoots the target, then walks back through the final block with a linear scan. A middle ground between linear and binary search.',
    complexity: {
      time: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' },
      space: 'O(1)',
    },
    accent: '#34d399',
  };

  protected search(t: SearchTracer): void {
    const n = t.length;
    if (n === 0) {
      t.exhausted('empty collection');
      return;
    }
    const step = Math.max(1, Math.floor(Math.sqrt(n)));

    // Phase 1 — jump block by block until the block's last element ≥ target.
    let prev = 0;
    let curr = step;
    while (curr < n && t.value(Math.min(curr, n) - 1) < t.target) {
      const probeIdx = Math.min(curr, n) - 1;
      t.bounds(prev, probeIdx, `jump ahead by ${step}`);
      t.probe(probeIdx);
      t.eliminate(prev, probeIdx, 'target lies further ahead');
      prev = curr;
      curr += step;
    }

    // Phase 2 — linear scan within the candidate block [prev, blockEnd].
    const blockEnd = Math.min(curr, n) - 1;
    t.bounds(prev, blockEnd, 'linear scan within the block');
    for (let i = prev; i <= blockEnd; i += 1) {
      t.probe(i);
      if (t.value(i) === t.target) {
        t.found(i, `found the target at index ${i}`);
        return;
      }
      t.eliminate(i, i);
    }
    t.exhausted('target is absent');
  }
}
