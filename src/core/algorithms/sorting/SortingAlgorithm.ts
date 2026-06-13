import { type Algorithm, AlgorithmCategory, type AlgorithmMeta } from '../types';
import type { SortStep } from './SortStep';
import { SortTracer } from './SortTracer';

/**
 * Abstract base for every comparison sort.
 *
 * Subclasses implement exactly one method — `sort(tracer)` — expressing the
 * algorithm against the `SortTracer` API. The base class owns the boilerplate:
 * cloning the input (purity), running the trace, and guaranteeing a clean
 * terminal state where every cell is flagged sorted. This is the Template
 * Method pattern: invariant orchestration here, the variant step there.
 */
export abstract class SortingAlgorithm implements Algorithm<number[], SortStep> {
  abstract readonly meta: AlgorithmMeta;

  /** The actual algorithm, written against the tracer. Operates in place. */
  protected abstract sort(tracer: SortTracer): void;

  run(input: number[]): SortStep[] {
    const working = input.slice(); // never mutate the caller's array
    const tracer = new SortTracer(working);
    this.sort(tracer);
    // Defensive terminal sweep: regardless of whether the concrete algorithm
    // marked positions progressively, end on a fully-sorted (all green) frame.
    for (let i = 0; i < working.length; i += 1) tracer.markSorted(i);
    return [...tracer.steps];
  }
}

/** Shared category constant so subclasses don't repeat the literal. */
export const SORTING_CATEGORY = AlgorithmCategory.Sorting;
