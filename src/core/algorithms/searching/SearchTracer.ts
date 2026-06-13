import { type SearchStep, SearchStepKind } from './SearchStep';

/**
 * Ergonomic recorder for search algorithms. Mirrors the sorting `SortTracer`:
 * the algorithm reads values and the target through the tracer and emits steps
 * via intention-revealing methods, so index bookkeeping stays in one place.
 */
export class SearchTracer {
  private readonly _steps: SearchStep[] = [];

  constructor(
    private readonly values: number[],
    readonly target: number,
  ) {}

  get steps(): readonly SearchStep[] {
    return this._steps;
  }

  value(i: number): number {
    return this.values[i];
  }

  get length(): number {
    return this.values.length;
  }

  bounds(lo: number, hi: number, note?: string): void {
    this._steps.push({ kind: SearchStepKind.Bounds, lo, hi, note });
  }

  probe(index: number, note?: string): void {
    this._steps.push({ kind: SearchStepKind.Probe, index, note });
  }

  eliminate(from: number, to: number, note?: string): void {
    if (from > to) return;
    this._steps.push({ kind: SearchStepKind.Eliminate, from, to, note });
  }

  found(index: number, note?: string): void {
    this._steps.push({ kind: SearchStepKind.Found, index, note });
  }

  exhausted(note?: string): void {
    this._steps.push({ kind: SearchStepKind.Exhausted, note });
  }
}
