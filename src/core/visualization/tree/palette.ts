import { TreeNodeRole } from '@/core/model/TreeModel';

export interface NodeStyle {
  color: string;
  emissive: number;
  scale: number;
}

export const TREE_NODE_STYLES: Record<TreeNodeRole, NodeStyle> = {
  [TreeNodeRole.Hidden]: { color: '#000000', emissive: 0, scale: 0 },
  [TreeNodeRole.Default]: { color: '#3b5bdb', emissive: 0.28, scale: 1 },
  [TreeNodeRole.Comparing]: { color: '#22d3ee', emissive: 0.85, scale: 1.18 },
  [TreeNodeRole.Current]: { color: '#fbbf24', emissive: 1.0, scale: 1.32 },
  [TreeNodeRole.Visited]: { color: '#6366f1', emissive: 0.5, scale: 1 },
  [TreeNodeRole.Found]: { color: '#34d399', emissive: 1.0, scale: 1.32 },
};

export const TREE_EDGE_DEFAULT = { color: '#2a3a7a', emissive: 0.18, opacity: 0.55 };
export const TREE_EDGE_ACTIVE = { color: '#22d3ee', emissive: 0.6, opacity: 0.95 };

export const TREE_LEGEND: { role: TreeNodeRole; label: string }[] = [
  { role: TreeNodeRole.Default, label: 'Node' },
  { role: TreeNodeRole.Comparing, label: 'Comparing' },
  { role: TreeNodeRole.Current, label: 'Visiting' },
  { role: TreeNodeRole.Visited, label: 'Visited' },
  { role: TreeNodeRole.Found, label: 'Found' },
];
