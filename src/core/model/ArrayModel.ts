import { type SortStep, SortStepKind } from '../algorithms/sorting/SortStep';

/**
 * Visual status of a single array cell. The renderer maps each role to a colour
 * and emissive intensity. `Transient*` roles last exactly one applied step;
 * `Selected`/`Sorted` persist until explicitly changed.
 */
export enum CellRole {
  Default = 'default',
  Comparing = 'comparing',
  Swapping = 'swapping',
  Writing = 'writing',
  Pivot = 'pivot',
  Min = 'min',
  Key = 'key',
  Sorted = 'sorted',
}

export interface ArrayMetrics {
  comparisons: number;
  swaps: number;
  /** Array writes (overwrites + 2 per swap) — the classic "array accesses". */
  writes: number;
}

/**
 * Authoritative logical state of the array being sorted.
 *
 * The model is a pure, framework-free state machine: it applies `SortStep`s to
 * advance, and `reset` to rewind. It knows nothing about Three.js or React —
 * the visualizer *pulls* state from it each frame, and the playback controller
 * *pushes* steps into it. Keeping it deterministic + side-effect free is what
 * makes scrubbing (replay-from-start) and unit testing trivial.
 */
export class ArrayModel {
  private _values: number[] = [];
  private _initial: number[] = [];
  private _maxValue = 1;

  /** Persistent per-index role overlay (Selected/Sorted families). */
  private readonly persistent = new Map<number, CellRole>();
  /** Transient roles that live for a single applied step. */
  private transient = new Map<number, CellRole>();

  private _metrics: ArrayMetrics = { comparisons: 0, swaps: 0, writes: 0 };

  /** Load a fresh dataset and clear all derived state. */
  reset(values: readonly number[]): void {
    this._initial = [...values];
    this._values = [...values];
    this._maxValue = Math.max(1, ...values);
    this.persistent.clear();
    this.transient.clear();
    this._metrics = { comparisons: 0, swaps: 0, writes: 0 };
  }

  /** Rewind to the initial dataset without changing it. */
  rewind(): void {
    this.reset(this._initial);
  }

  get size(): number {
    return this._values.length;
  }

  get maxValue(): number {
    return this._maxValue;
  }

  get metrics(): ArrayMetrics {
    return { ...this._metrics };
  }

  value(i: number): number {
    return this._values[i];
  }

  /** Effective role of a cell: transient overrides persistent overrides default. */
  roleAt(i: number): CellRole {
    return this.transient.get(i) ?? this.persistent.get(i) ?? CellRole.Default;
  }

  /** Apply one step, advancing logical + visual state. */
  apply(step: SortStep): void {
    // Transient highlights only describe the most recent step.
    this.transient.clear();

    switch (step.kind) {
      case SortStepKind.Compare:
        this._metrics.comparisons += 1;
        this.transient.set(step.a, CellRole.Comparing);
        if (step.b !== undefined) this.transient.set(step.b, CellRole.Comparing);
        break;

      case SortStepKind.Swap: {
        const b = step.b ?? step.a;
        const tmp = this._values[step.a];
        this._values[step.a] = this._values[b];
        this._values[b] = tmp;
        this._metrics.swaps += 1;
        this._metrics.writes += 2;
        this.transient.set(step.a, CellRole.Swapping);
        this.transient.set(b, CellRole.Swapping);
        break;
      }

      case SortStepKind.Overwrite:
        this._values[step.a] = step.value ?? this._values[step.a];
        this._metrics.writes += 1;
        this.transient.set(step.a, CellRole.Writing);
        break;

      case SortStepKind.Select:
        this.persistent.set(step.a, roleFromTag(step.role));
        break;

      case SortStepKind.Deselect:
        this.persistent.delete(step.a);
        break;

      case SortStepKind.MarkSorted:
        this.persistent.set(step.a, CellRole.Sorted);
        break;
    }
  }
}

/** Map a free-form `Select` role tag to a concrete CellRole. */
function roleFromTag(tag: string | undefined): CellRole {
  switch (tag) {
    case 'pivot':
      return CellRole.Pivot;
    case 'min':
      return CellRole.Min;
    case 'key':
      return CellRole.Key;
    default:
      return CellRole.Comparing;
  }
}
