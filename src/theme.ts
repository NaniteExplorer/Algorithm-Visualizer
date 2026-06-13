import { CellRole } from './core/model/ArrayModel';

/**
 * Single source of truth for colour. The React chrome reads hex values through
 * Tailwind tokens; the WebGL layer reads the same hexes here so the 2D UI and
 * the 3D scene never drift apart. Each role carries an emissive intensity so
 * "active" cells genuinely glow under the bloom pass.
 */
export interface RoleStyle {
  /** Base/emissive colour as a hex string. */
  color: string;
  /** Emissive intensity (0 = matte, 1 = strong bloom). */
  emissive: number;
}

export const ROLE_STYLES: Record<CellRole, RoleStyle> = {
  [CellRole.Default]: { color: '#3b5bdb', emissive: 0.12 },
  [CellRole.Comparing]: { color: '#22d3ee', emissive: 0.7 },
  [CellRole.Swapping]: { color: '#fb7185', emissive: 0.85 },
  [CellRole.Writing]: { color: '#a78bfa', emissive: 0.75 },
  [CellRole.Pivot]: { color: '#f472b6', emissive: 0.9 },
  [CellRole.Min]: { color: '#38bdf8', emissive: 0.7 },
  [CellRole.Key]: { color: '#fbbf24', emissive: 0.8 },
  [CellRole.Sorted]: { color: '#34d399', emissive: 0.55 },
};

/** Human-readable labels for the on-screen legend. */
export const ROLE_LABELS: Partial<Record<CellRole, string>> = {
  [CellRole.Default]: 'Unsorted',
  [CellRole.Comparing]: 'Comparing',
  [CellRole.Swapping]: 'Swapping',
  [CellRole.Writing]: 'Writing',
  [CellRole.Pivot]: 'Pivot',
  [CellRole.Min]: 'Minimum',
  [CellRole.Key]: 'Key',
  [CellRole.Sorted]: 'Sorted',
};

/** Scene-wide palette for backgrounds, lights and the hero. */
export const SCENE = {
  background: '#05060a',
  fog: '#070912',
  floor: '#0a0d1a',
  grid: '#1b2240',
  rimLight: '#67e8f9',
  keyLight: '#ffffff',
  hero: {
    nodeCore: '#22d3ee',
    nodeWarm: '#a78bfa',
    link: '#1e3a8a',
  },
} as const;
