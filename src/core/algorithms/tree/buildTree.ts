import type { TreeData, TreeNode } from './TreeStep';

const X_SPAN = 70;
const Y_SPACING = 9;

/**
 * Build a binary search tree from `values` (inserted left-to-right) and lay it
 * out for rendering. Node ids are insertion indices, so a node's root-to-node
 * path passes only through earlier-inserted nodes — which is what lets the
 * insertion animation replay descents deterministically.
 *
 * Layout: x comes from the in-order sequence (so the tree reads left-to-right in
 * sorted order and never self-overlaps); y comes from depth, centred on 0.
 */
export function buildBST(values: number[], target?: number): TreeData {
  const nodes: TreeNode[] = values.map((value, id) => ({
    id,
    value,
    depth: 0,
    x: 0,
    y: 0,
    parent: null,
    left: null,
    right: null,
  }));

  let root: number | null = null;
  for (let i = 0; i < values.length; i += 1) {
    if (root === null) {
      root = i;
      continue;
    }
    let cur = root;
    for (;;) {
      const node = nodes[cur];
      if (values[i] < node.value) {
        if (node.left === null) {
          node.left = i;
          nodes[i].parent = cur;
          nodes[i].depth = node.depth + 1;
          break;
        }
        cur = node.left;
      } else {
        if (node.right === null) {
          node.right = i;
          nodes[i].parent = cur;
          nodes[i].depth = node.depth + 1;
          break;
        }
        cur = node.right;
      }
    }
  }

  const n = nodes.length;
  let maxDepth = 0;
  for (const nd of nodes) maxDepth = Math.max(maxDepth, nd.depth);
  const xSpacing = Math.max(4, Math.min(9, X_SPAN / Math.max(n, 1)));

  // Iterative in-order traversal assigns the horizontal slot for each node.
  let idx = 0;
  const stack: number[] = [];
  let cur: number | null = root;
  while (stack.length || cur !== null) {
    while (cur !== null) {
      stack.push(cur);
      cur = nodes[cur].left;
    }
    cur = stack.pop()!;
    nodes[cur].x = (idx - (n - 1) / 2) * xSpacing;
    nodes[cur].y = (maxDepth / 2 - nodes[cur].depth) * Y_SPACING;
    idx += 1;
    cur = nodes[cur].right;
  }

  return { nodes, root, order: values.map((_, i) => i), target };
}
