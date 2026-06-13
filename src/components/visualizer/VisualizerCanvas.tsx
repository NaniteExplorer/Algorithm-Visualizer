'use client';

import type { RefObject } from 'react';
import type { MetricSpec } from '@/core/visualization/CategoryModule';
import type { PlaybackSnapshot } from '@/core/playback/PlaybackController';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  snapshot: PlaybackSnapshot;
  metricSpecs: MetricSpec[];
  accent: string;
}

/**
 * The WebGL viewport. The bare `div` is handed to the engine via `containerRef`;
 * everything else is a non-interactive HUD overlaid on top of the canvas. The
 * metric chips are driven by the active family's `metricSpecs`, so the HUD is
 * fully category-agnostic.
 */
export function VisualizerCanvas({ containerRef, snapshot, metricSpecs, accent }: Props) {
  const { metrics, note, status } = snapshot;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-surface-700 bg-surface-950">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Live metrics — top-left HUD */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 font-mono text-xs">
        {metricSpecs.map((m) => (
          <Metric key={m.key} label={m.label} value={metrics[m.key] ?? 0} />
        ))}
      </div>

      {/* Status pill — top-right */}
      <div className="pointer-events-none absolute right-4 top-4">
        <span
          className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur"
          style={{ borderColor: `${accent}55`, color: accent, background: `${accent}11` }}
        >
          {status}
        </span>
      </div>

      {/* Step narration — bottom */}
      {note && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <span className="max-w-full truncate rounded-full border border-surface-700 bg-surface-900/80 px-4 py-1.5 font-mono text-xs text-slate-300 backdrop-blur">
            {note}
          </span>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-lg border border-surface-700 bg-surface-900/70 px-2.5 py-1 backdrop-blur">
      <span className="text-slate-500">{label} </span>
      <span className="tabular-nums text-slate-100">{value.toLocaleString()}</span>
    </span>
  );
}
