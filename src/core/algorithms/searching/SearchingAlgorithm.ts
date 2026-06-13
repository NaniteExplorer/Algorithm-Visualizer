import { type Algorithm, AlgorithmCategory, type AlgorithmMeta } from '../types';
import type { SearchInput, SearchStep } from './SearchStep';
import { SearchTracer } from './SearchTracer';

/**
 * Abstract base for every searching algorithm. Subclasses implement one method
 * — `search(tracer)` — against the `SearchTracer` API. The base owns input
 * plumbing and returns the recorded, deterministic timeline.
 */
export abstract class SearchingAlgorithm implements Algorithm<SearchInput, SearchStep> {
  abstract readonly meta: AlgorithmMeta;

  protected abstract search(tracer: SearchTracer): void;

  run(input: SearchInput): SearchStep[] {
    const tracer = new SearchTracer(input.values.slice(), input.target);
    this.search(tracer);
    return [...tracer.steps];
  }
}

export const SEARCHING_CATEGORY = AlgorithmCategory.Searching;
