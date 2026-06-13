'use client';

import type { RefObject } from 'react';
import type { PlaybackSnapshot } from '@/core/playback/PlaybackController';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  snapshot: PlaybackSnapshot;
  accent: string;
}

/**
 * The WebGL viewport. The bare `div` is handed to the engine via `containerRef`;
 * everything else is a non-interactive HUD overlaid on top of the canvas.
 */
export function VisualizerCanvas({ containerRef, snapshot, accent }: Props) {
  const { metrics, note, status } = snapshot;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-surface-700 bg-surface-950">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Live metrics — top-left HUD */}
      <div className="pointer-events-none absolute left-4 top-4 flex gap-2 font-mono text-xs">
        <Metric label="comparisons" value={metrics.comparisons ?? 0} />
        <Metric label="swaps" value={metrics.swaps ?? 0} />
        <Metric label="writes" value={metrics.writes ?? 0} />
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
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <span className="rounded-full border border-surface-700 bg-surface-900/80 px-4 py-1.5 font-mono text-xs text-slate-300 backdrop-blur">
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
