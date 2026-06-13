import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

const DIGIT_NAMES = ['1s', '10s', '100s', '1,000s', '10,000s'];

export class RadixSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'radix-sort',
    name: 'Radix Sort (LSD)',
    category: SORTING_CATEGORY,
    description:
      'A non-comparison, distribution sort. It stably buckets values by each digit from least- to most-significant using counting sort, rewriting the array after every digit pass. Runs in O(d·(n+k)) — linear when the key width d is small.',
    complexity: {
      time: { best: 'O(d·(n+k))', average: 'O(d·(n+k))', worst: 'O(d·(n+k))' },
      space: 'O(n+k)',
      stable: true,
    },
    accent: '#0ea5e9',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    if (n === 0) return;

    let max = 0;
    for (let i = 0; i < n; i += 1) max = Math.max(max, t.value(i));

    let exp = 1;
    let pass = 0;
    while (Math.floor(max / exp) > 0) {
      const label = DIGIT_NAMES[pass] ?? `digit ${pass + 1}`;
      const output = new Array<number>(n);
      const count = new Array<number>(10).fill(0);

      // Tally digit frequencies, then turn them into output offsets.
      for (let i = 0; i < n; i += 1) count[Math.floor(t.value(i) / exp) % 10] += 1;
      for (let d = 1; d < 10; d += 1) count[d] += count[d - 1];

      // Stable placement: walk right-to-left so equal digits keep their order.
      for (let i = n - 1; i >= 0; i -= 1) {
        const digit = Math.floor(t.value(i) / exp) % 10;
        output[count[digit] - 1] = t.value(i);
        count[digit] -= 1;
      }

      // Rewrite the array in bucketed order (this is the animated part).
      for (let i = 0; i < n; i += 1) {
        t.overwrite(i, output[i], `bucket by ${label} digit`);
      }

      exp *= 10;
      pass += 1;
    }
  }
}
