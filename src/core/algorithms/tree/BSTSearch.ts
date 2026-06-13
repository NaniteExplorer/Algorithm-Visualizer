import type { AlgorithmMeta } from '../types';
import { TreeAlgorithm, TREE_CATEGORY } from './TreeAlgorithm';
import type { TreeTracer } from './TreeTracer';

export class BSTSearch extends TreeAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'bst-search',
    name: 'BST Search',
    category: TREE_CATEGORY,
    description:
      'Locates a key by descending from the root, comparing at each node and branching left or right. The ordering invariant means each comparison discards an entire subtree — logarithmic time on a balanced tree.',
    complexity: {
      time: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(1)',
    },
    accent: '#a78bfa',
  };

  protected walk(t: TreeTracer): void {
    t.revealAll();
    const target = t.target;
    if (target === undefined) {
      t.notFound('no target specified');
      t.done();
      return;
    }

    let cur = t.root;
    while (cur !== null) {
      t.compare(cur, `${target} vs ${t.value(cur)}`);
      if (t.value(cur) === target) {
        t.found(cur, `found ${target}`);
        t.done();
        return;
      }
      cur = target < t.value(cur) ? t.left(cur) : t.right(cur);
    }
    t.notFound(`${target} is not in the tree`);
    t.done();
  }
}
