'use client';

import { useEffect } from 'react';
import type { AlgorithmCategory } from '@/core/algorithms';
import { useVisualizer } from '@/hooks/useVisualizer';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ComplexityCard } from './ComplexityCard';
import { ControlPanel } from './ControlPanel';
import { Legend } from './Legend';
import { VisualizerCanvas } from './VisualizerCanvas';

interface Props {
  category: AlgorithmCategory;
  /** Display title for the active family (e.g. "Sorting"). */
  title: string;
  /** One-line description of the family, shown under the title. */
  blurb: string;
}

/**
 * The interactive studio for one algorithm family: orchestrates the visualizer
 * hook and lays out the canvas, algorithm selector, transport controls and
 * reference cards. Every part below is presentational and category-blind — this
 * component is mounted once per family (keyed by category) by the platform shell.
 */
export function VisualizerStudio({ category, title, blurb }: Props) {
  const {
    containerRef,
    snapshot,
    algorithms,
    algorithmId,
    currentMeta,
    params,
    controls,
    metricSpecs,
    legend,
    actions,
  } = useVisualizer(category);
  const accent = currentMeta?.accent ?? '#22d3ee';

  // Keyboard transport: space toggles play, arrows single-step. Ignored while a
  // form control (e.g. a slider) is focused so it never fights the inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        actions.toggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        actions.stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        actions.stepBackward();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  return (
    <section id="studio" className="mx-auto w-full max-w-7xl scroll-mt-20 px-6 py-16">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">The Studio</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">{title}</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">{blurb}</p>
        </div>
        <AlgorithmSelector
          algorithms={algorithms}
          activeId={algorithmId}
          onSelect={actions.selectAlgorithm}
        />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="h-[420px] md:h-[560px]">
            <VisualizerCanvas
              containerRef={containerRef}
              snapshot={snapshot}
              metricSpecs={metricSpecs}
              accent={accent}
            />
          </div>
          <Legend items={legend} />
        </div>

        <aside className="flex flex-col gap-6">
          <ControlPanel
            snapshot={snapshot}
            controls={controls}
            params={params}
            accent={accent}
            actions={actions}
          />
          {currentMeta && <ComplexityCard meta={currentMeta} />}
        </aside>
      </div>
    </section>
  );
}
