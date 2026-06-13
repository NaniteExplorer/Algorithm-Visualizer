import type { AlgorithmMeta } from '../types';
import { SortingAlgorithm, SORTING_CATEGORY } from './SortingAlgorithm';
import type { SortTracer } from './SortTracer';

export class ShellSort extends SortingAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'shell-sort',
    name: 'Shell Sort',
    category: SORTING_CATEGORY,
    description:
      'A generalisation of insertion sort that first sorts elements far apart, then progressively shrinks the gap. The early long-range moves let later passes finish quickly. Performance depends heavily on the gap sequence.',
    complexity: {
      time: { best: 'O(n log n)', average: 'O(n^1.25)', worst: 'O(n²)' },
      space: 'O(1)',
      stable: false,
    },
    accent: '#14b8a6',
  };

  protected sort(t: SortTracer): void {
    const n = t.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < n; i += 1) {
        const temp = t.value(i);
        let j = i;
        // Shift gapped predecessors that are larger than temp toward the right.
        while (j >= gap) {
          t.compare(j - gap, j, `gap ${gap}: compare`);
          if (t.value(j - gap) > temp) {
            t.overwrite(j, t.value(j - gap));
            j -= gap;
          } else {
            break;
          }
        }
        if (j !== i) t.overwrite(j, temp, 'drop the lifted value into place');
      }
    }
  }
}
