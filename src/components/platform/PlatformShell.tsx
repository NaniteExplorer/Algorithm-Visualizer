'use client';

import { useMemo, useState } from 'react';
import { algorithmRegistry, type AlgorithmCategory } from '@/core/algorithms';
import { VisualizerStudio } from '@/components/visualizer/VisualizerStudio';
import { CATEGORY_ORDER, categoryInfo } from './categories';

/**
 * Owns the active algorithm family and renders the category navigation plus the
 * matching studio. The studio is keyed by category so switching families fully
 * remounts the WebGL world — the cleanest possible teardown, with no dynamic
 * re-subscription gymnastics in the hook.
 *
 * Tabs are derived from the registry, so a family appears the moment its
 * algorithms are registered and its `VisualizerFactory` case exists.
 */
export function PlatformShell() {
  const available = useMemo(() => {
    const present = new Set(algorithmRegistry.categories());
    return CATEGORY_ORDER.filter((c) => present.has(c.category));
  }, []);

  const [active, setActive] = useState<AlgorithmCategory>(
    available[0]?.category ?? CATEGORY_ORDER[0].category,
  );

  const info = categoryInfo(active);

  return (
    <section id="explore" className="scroll-mt-4">
      <CategoryNav active={active} onSelect={setActive} families={available} />
      <VisualizerStudio key={active} category={active} title={info.title} blurb={info.blurb} />
    </section>
  );
}

function CategoryNav({
  active,
  onSelect,
  families,
}: {
  active: AlgorithmCategory;
  onSelect: (c: AlgorithmCategory) => void;
  families: typeof CATEGORY_ORDER;
}) {
  return (
    <div className="sticky top-14 z-30 border-y border-surface-800 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-6 py-3">
        <span className="mr-2 hidden font-mono text-xs uppercase tracking-[0.3em] text-slate-500 sm:inline">
          Families
        </span>
        {families.map((f) => {
          const isActive = f.category === active;
          return (
            <button
              key={f.category}
              onClick={() => onSelect(f.category)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-surface-950 shadow-[0_0_24px_-6px_#22d3ee]'
                  : 'border border-surface-700 text-slate-300 hover:bg-surface-800'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
