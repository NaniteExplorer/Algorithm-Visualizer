'use client';

import { useVisualizer } from '@/hooks/useVisualizer';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ComplexityCard } from './ComplexityCard';
import { ControlPanel } from './ControlPanel';
import { Legend } from './Legend';
import { VisualizerCanvas } from './VisualizerCanvas';

/**
 * The interactive studio: orchestrates the visualizer hook and lays out the
 * canvas, algorithm selector, transport controls and reference cards. This is
 * the only place the pieces are composed — every part below is presentational.
 */
export function VisualizerStudio() {
  const { containerRef, snapshot, algorithms, algorithmId, currentMeta, arraySize, actions } =
    useVisualizer();
  const accent = currentMeta?.accent ?? '#22d3ee';

  return (
    <section id="studio" className="mx-auto w-full max-w-7xl px-6 py-20">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">The Studio</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">
            Visualize an algorithm
          </h2>
        </div>
        <AlgorithmSelector
          algorithms={algorithms}
          activeId={algorithmId}
          onSelect={actions.selectAlgorithm}
        />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="h-[420px] md:h-[540px]">
            <VisualizerCanvas containerRef={containerRef} snapshot={snapshot} accent={accent} />
          </div>
          <Legend />
        </div>

        <aside className="flex flex-col gap-6">
          <ControlPanel
            snapshot={snapshot}
            arraySize={arraySize}
            accent={accent}
            actions={actions}
          />
          {currentMeta && <ComplexityCard meta={currentMeta} />}
        </aside>
      </div>
    </section>
  );
}
