import { AlgorithmCategory } from '@/core/algorithms';

export interface CategoryInfo {
  category: AlgorithmCategory;
  /** Short label for nav tabs. */
  label: string;
  /** Studio heading. */
  title: string;
  /** One-line description shown in the studio + catalog. */
  blurb: string;
}

/**
 * Presentation metadata for each family, in canonical display order. The nav
 * filters this list down to families that actually have registered algorithms,
 * so tabs light up automatically as families are added to the registry.
 */
export const CATEGORY_ORDER: CategoryInfo[] = [
  {
    category: AlgorithmCategory.Sorting,
    label: 'Sorting',
    title: 'Sorting Algorithms',
    blurb: 'Watch comparison and distribution sorts order a field of glowing 3D bars, step by step.',
  },
  {
    category: AlgorithmCategory.Searching,
    label: 'Searching',
    title: 'Searching Algorithms',
    blurb: 'Hunt for a target value across a sorted field, with live search windows and probes.',
  },
  {
    category: AlgorithmCategory.Graph,
    label: 'Graphs',
    title: 'Graph Algorithms',
    blurb: 'Traverse and find shortest paths over a 3D node-link network as frontiers expand.',
  },
  {
    category: AlgorithmCategory.Tree,
    label: 'Trees',
    title: 'Tree Algorithms',
    blurb: 'Build, search and traverse a binary search tree laid out in space.',
  },
];

export function categoryInfo(category: AlgorithmCategory): CategoryInfo {
  const info = CATEGORY_ORDER.find((c) => c.category === category);
  if (!info) throw new Error(`No presentation metadata for category "${category}".`);
  return info;
}
