import type { AlgorithmMeta } from '../types';
import { TreeAlgorithm, TREE_CATEGORY } from './TreeAlgorithm';
import type { TreeTracer } from './TreeTracer';

export class BSTInsert extends TreeAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'bst-insert',
    name: 'BST Insertion',
    category: TREE_CATEGORY,
    description:
      'Builds a binary search tree by inserting values one at a time. Each new key descends from the root — going left when smaller, right when larger — until it finds an empty slot, preserving the BST ordering invariant.',
    complexity: {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
    },
    accent: '#22d3ee',
  };

  protected walk(t: TreeTracer): void {
    for (const id of t.order) {
      if (id === t.root) {
        t.reveal(id, `insert ${t.value(id)} as the root`);
        continue;
      }
      // Descend through already-present ancestors to find this node's slot.
      let cur = t.root;
      while (cur !== null) {
        t.compare(cur, `${t.value(id)} vs ${t.value(cur)}`);
        if (t.value(id) < t.value(cur)) {
          if (t.left(cur) === id) break;
          cur = t.left(cur);
        } else {
          if (t.right(cur) === id) break;
          cur = t.right(cur);
        }
      }
      t.reveal(id, `insert ${t.value(id)}`);
    }
    t.done('tree fully built');
  }
}
