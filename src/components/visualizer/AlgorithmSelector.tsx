'use client';

import type { AlgorithmMeta } from '@/core/algorithms';

interface Props {
  algorithms: AlgorithmMeta[];
  activeId: string;
  onSelect: (id: string) => void;
}

/** Pill list of available algorithms, themed per-algorithm accent when active. */
export function AlgorithmSelector({ algorithms, activeId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {algorithms.map((algo) => {
        const active = algo.id === activeId;
        return (
          <button
            key={algo.id}
            onClick={() => onSelect(algo.id)}
            className="rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200"
            style={
              active
                ? {
                    borderColor: algo.accent,
                    color: '#05060a',
                    background: algo.accent,
                    boxShadow: `0 0 24px -4px ${algo.accent}`,
                  }
                : { borderColor: '#1a1e2e', color: '#cbd5e1', background: '#11141f' }
            }
          >
            {algo.name}
          </button>
        );
      })}
    </div>
  );
}
