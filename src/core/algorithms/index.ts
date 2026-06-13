/**
 * Algorithm layer barrel + registration entrypoint.
 *
 * Importing this module guarantees the registry is fully populated. Category
 * barrels are imported for their registration side-effects; when graph/tree
 * families land, add their barrels here in the same way.
 */
import './sorting';
import './searching';
import './graph';
import './tree';

export * from './types';
export { algorithmRegistry, AlgorithmRegistry } from './AlgorithmRegistry';
export type { AnyAlgorithm } from './AlgorithmRegistry';
