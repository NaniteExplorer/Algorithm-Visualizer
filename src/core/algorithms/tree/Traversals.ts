import type { AlgorithmMeta } from '../types';
import { TreeAlgorithm, TREE_CATEGORY } from './TreeAlgorithm';
import type { TreeTracer } from './TreeTracer';

/**
 * Depth-first BST traversals. They share the same recursive shape and differ
 * only in *when* the node is visited relative to its subtrees — the classic
 * in-/pre-/post-order distinction. The whole tree is revealed first, then nodes
 * light up in visitation order.
 */

export class InorderTraversal extends TreeAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'inorder',
    name: 'In-order Traversal',
    category: TREE_CATEGORY,
    description:
      'Visits left subtree, then the node, then the right subtree. On a binary search tree this yields the keys in fully sorted order — the defining property of in-order traversal.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
    },
    accent: '#34d399',
  };

  protected walk(t: TreeTracer): void {
    t.revealAll();
    const rec = (id: number | null): void => {
      if (id === null) return;
      rec(t.left(id));
      t.visit(id);
      rec(t.right(id));
    };
    rec(t.root);
    t.done('in-order = sorted order');
  }
}

export class PreorderTraversal extends TreeAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'preorder',
    name: 'Pre-order Traversal',
    category: TREE_CATEGORY,
    description:
      'Visits the node first, then its left and right subtrees. Pre-order produces a serialisation from which the tree can be rebuilt, and mirrors how you would clone or print a tree top-down.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
    },
    accent: '#fbbf24',
  };

  protected walk(t: TreeTracer): void {
    t.revealAll();
    const rec = (id: number | null): void => {
      if (id === null) return;
      t.visit(id);
      rec(t.left(id));
      rec(t.right(id));
    };
    rec(t.root);
    t.done('root-first ordering');
  }
}

export class PostorderTraversal extends TreeAlgorithm {
  readonly meta: AlgorithmMeta = {
    id: 'postorder',
    name: 'Post-order Traversal',
    category: TREE_CATEGORY,
    description:
      'Visits both subtrees before the node itself. Post-order is how you safely free or evaluate a tree bottom-up — every child is processed before its parent.',
    complexity: {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
    },
    accent: '#f472b6',
  };

  protected walk(t: TreeTracer): void {
    t.revealAll();
    const rec = (id: number | null): void => {
      if (id === null) return;
      rec(t.left(id));
      rec(t.right(id));
      t.visit(id);
    };
    rec(t.root);
    t.done('children before parents');
  }
}
