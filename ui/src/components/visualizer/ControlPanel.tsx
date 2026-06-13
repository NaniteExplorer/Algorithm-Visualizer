'use client';

import type { ReactNode } from 'react';
import type { PlaybackSnapshot } from '@/core/playback/PlaybackController';
import type { VisualizerActions } from '@/hooks/useVisualizer';
import { PlayIcon, PauseIcon, StepBackIcon, StepForwardIcon, ShuffleIcon } from './icons';

interface Props {
  snapshot: PlaybackSnapshot;
  arraySize: number;
  accent: string;
  actions: VisualizerActions;
}

export function ControlPanel({ snapshot, arraySize, accent, actions }: Props) {
  const playing = snapshot.status === 'playing';
  const total = snapshot.total;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-surface-700 bg-surface-900/60 p-5">
      {/* Scrubber */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span>step</span>
          <span className="tabular-nums">
            {snapshot.cursor + 1} / {total}
          </span>
        </div>
        <input
          type="range"
          min={-1}
          max={Math.max(total - 1, 0)}
          value={snapshot.cursor}
          onChange={(e) => actions.seek(Number(e.target.value))}
          className="algoviz-range"
          style={{ accentColor: accent }}
          aria-label="Timeline position"
        />
      </div>

      {/* Transport */}
      <div className="flex items-center justify-center gap-2">
        <IconButton label="Step back" onClick={actions.stepBackward}>
          <StepBackIcon />
        </IconButton>
        <button
          onClick={actions.toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-12 w-12 items-center justify-center rounded-full text-surface-950 transition-transform duration-150 hover:scale-105"
          style={{ background: accent, boxShadow: `0 0 28px -6px ${accent}` }}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <IconButton label="Step forward" onClick={actions.stepForward}>
          <StepForwardIcon />
        </IconButton>
      </div>

      {/* Sliders */}
      <Slider
        label="Speed"
        value={snapshot.speed}
        min={1}
        max={300}
        step={1}
        suffix=" steps/s"
        accent={accent}
        onChange={actions.setSpeed}
      />
      <Slider
        label="Array size"
        value={arraySize}
        min={5}
        max={120}
        step={1}
        accent={accent}
        onChange={actions.setArraySize}
      />

      {/* Regenerate */}
      <button
        onClick={actions.regenerate}
        className="flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-surface-700"
      >
        <ShuffleIcon width={16} height={16} />
        Generate new array
      </button>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-700 bg-surface-800 text-slate-300 transition-colors hover:bg-surface-700"
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  accent,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  accent: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between font-mono text-xs text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-slate-200">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="algoviz-range"
        style={{ accentColor: accent }}
      />
    </label>
  );
}
