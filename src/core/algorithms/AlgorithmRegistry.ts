import type { Algorithm, AlgorithmCategory, AlgorithmMeta } from './types';

/**
 * A type-erased algorithm handle. The registry stores algorithms of many
 * different `<TInput, TStep>` shapes side by side, so at the storage boundary
 * we erase the generics. Consumers re-narrow via the category they requested.
 */
export type AnyAlgorithm = Algorithm<unknown, unknown>;

/**
 * In-memory registry mapping algorithm ids -> instances, indexed by category.
 *
 * This is the single extension point for the whole platform: a new algorithm
 * becomes available everywhere (selector, routing, visualizer factory) simply
 * by calling `register`. Registration is centralised in `sorting/index.ts`
 * (and future `graph/index.ts`, etc.) so import side-effects stay predictable.
 */
export class AlgorithmRegistry {
  private readonly byId = new Map<string, AnyAlgorithm>();

  register(algorithm: AnyAlgorithm): this {
    const { id } = algorithm.meta;
    if (this.byId.has(id)) {
      throw new Error(`AlgorithmRegistry: duplicate algorithm id "${id}".`);
    }
    this.byId.set(id, algorithm);
    return this;
  }

  /** Bulk register; returns `this` for fluent setup. */
  registerAll(algorithms: readonly AnyAlgorithm[]): this {
    algorithms.forEach((a) => this.register(a));
    return this;
  }

  get(id: string): AnyAlgorithm | undefined {
    return this.byId.get(id);
  }

  /** Throws if missing — use when an id is expected to exist (e.g. routing). */
  require(id: string): AnyAlgorithm {
    const algo = this.byId.get(id);
    if (!algo) throw new Error(`AlgorithmRegistry: unknown algorithm "${id}".`);
    return algo;
  }

  list(): AnyAlgorithm[] {
    return [...this.byId.values()];
  }

  listMeta(): AlgorithmMeta[] {
    return this.list().map((a) => a.meta);
  }

  listByCategory(category: AlgorithmCategory): AnyAlgorithm[] {
    return this.list().filter((a) => a.meta.category === category);
  }

  /** Distinct categories that currently have at least one algorithm. */
  categories(): AlgorithmCategory[] {
    return [...new Set(this.list().map((a) => a.meta.category))];
  }
}

/** Process-wide singleton. Populated by category barrels on first import. */
export const algorithmRegistry = new AlgorithmRegistry();
