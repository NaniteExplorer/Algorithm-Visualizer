import { type SearchStep, SearchStepKind, type SearchInput } from '../algorithms/searching/SearchStep';
import type { StepConsumer } from '../playback/PlaybackController';

/** Visual status of a single cell in the searching scene. */
export enum SearchCellRole {
  /** Outside the active window / not yet considered. */
  Default = 'default',
  /** Inside the current candidate window. */
  Window = 'window',
  /** The cell currently being compared to the target. */
  Probe = 'probe',
  /** Permanently ruled out. */
  Eliminated = 'eliminated',
  /** The matched cell. */
  Found = 'found',
}

export interface SearchMetrics {
  comparisons: number;
  eliminated: number;
}

/**
 * Authoritative logical state for a search run. Pure and replayable, exactly
 * like {@link ArrayModel}: it applies `SearchStep`s to advance and `rewind`s to
 * the initial dataset. Tracks the active window, the live probe, eliminated
 * cells and the found index — everything the visualizer pulls each frame.
 */
export class SearchModel implements StepConsumer<SearchStep> {
  private _values: number[] = [];
  private _target = 0;
  private _maxValue = 1;

  private lo = 0;
  private hi = -1;
  private probe = -1;
  private found = -1;
  private readonly eliminated = new Set<number>();

  private _metrics: SearchMetrics = { comparisons: 0, eliminated: 0 };

  reset(input: SearchInput): void {
    this._values = [...input.values];
    this._target = input.target;
    this._maxValue = Math.max(1, ...this._values, input.target);
    this.lo = 0;
    this.hi = this._values.length - 1;
    this.probe = -1;
    this.found = -1;
    this.eliminated.clear();
    this._metrics = { comparisons: 0, eliminated: 0 };
  }

  /** Re-apply the initial instance. The module stores the instance and re-resets. */
  rewind(): void {
    this.reset({ values: this._values, target: this._target });
  }

  get size(): number {
    return this._values.length;
  }
  get maxValue(): number {
    return this._maxValue;
  }
  get target(): number {
    return this._target;
  }
  get metrics(): SearchMetrics {
    return { ...this._metrics };
  }

  value(i: number): number {
    return this._values[i];
  }

  roleAt(i: number): SearchCellRole {
    if (i === this.found) return SearchCellRole.Found;
    if (i === this.probe) return SearchCellRole.Probe;
    if (this.eliminated.has(i)) return SearchCellRole.Eliminated;
    if (i >= this.lo && i <= this.hi) return SearchCellRole.Window;
    return SearchCellRole.Default;
  }

  apply(step: SearchStep): void {
    // The probe highlight only describes the most recent comparison.
    this.probe = -1;
    switch (step.kind) {
      case SearchStepKind.Bounds:
        this.lo = step.lo ?? this.lo;
        this.hi = step.hi ?? this.hi;
        break;
      case SearchStepKind.Probe:
        this.probe = step.index ?? -1;
        this._metrics.comparisons += 1;
        break;
      case SearchStepKind.Eliminate: {
        const from = step.from ?? 0;
        const to = step.to ?? -1;
        for (let i = from; i <= to; i += 1) {
          if (!this.eliminated.has(i)) {
            this.eliminated.add(i);
            this._metrics.eliminated += 1;
          }
        }
        break;
      }
      case SearchStepKind.Found:
        this.found = step.index ?? -1;
        break;
      case SearchStepKind.Exhausted:
        break;
    }
  }
}
