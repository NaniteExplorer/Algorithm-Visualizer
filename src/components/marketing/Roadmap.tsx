import { AlgorithmCategory } from '@/core/algorithms';

interface Item {
  category: AlgorithmCategory;
  title: string;
  blurb: string;
  status: 'live' | 'planned';
}

/**
 * Surfaces the platform's extensibility story. Each card maps to an
 * `AlgorithmCategory`; "live" ones are fully wired, "planned" ones already have
 * their extension seams (registry + visualizer factory) waiting.
 */
const ITEMS: Item[] = [
  {
    category: AlgorithmCategory.Sorting,
    title: 'Sorting',
    blurb: 'Bubble, insertion, selection, merge and quick sort — rendered as glowing 3D bars.',
    status: 'live',
  },
  {
    category: AlgorithmCategory.Graph,
    title: 'Graphs',
    blurb: 'BFS, DFS, Dijkstra and A* over force-directed node-link scenes.',
    status: 'planned',
  },
  {
    category: AlgorithmCategory.Tree,
    title: 'Trees',
    blurb: 'BST operations, traversals and self-balancing rotations in 3D space.',
    status: 'planned',
  },
  {
    category: AlgorithmCategory.Searching,
    title: 'Searching',
    blurb: 'Linear and binary search with animated probe windows.',
    status: 'planned',
  },
];

export function Roadmap() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Built to extend</p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">
        One engine, every algorithm family
      </h2>
      <p className="mt-3 max-w-2xl text-slate-400">
        The rendering engine, playback controller and UI are category-agnostic. Adding a new
        family means writing its algorithms and a visualizer — the rest just works.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.category}
            className="flex flex-col gap-3 rounded-2xl border border-surface-700 bg-surface-900/50 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  item.status === 'live'
                    ? 'bg-accent-emerald/15 text-accent-emerald'
                    : 'bg-surface-700 text-slate-400'
                }`}
              >
                {item.status === 'live' ? 'Live' : 'Planned'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{item.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
