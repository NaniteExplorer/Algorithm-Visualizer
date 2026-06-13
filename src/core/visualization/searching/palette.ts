import { SearchCellRole } from '@/core/model/SearchModel';
import type { RoleStyle } from '@/theme';

/** Family-local colour map for searching cells (mirrors sorting's ROLE_STYLES). */
export const SEARCH_ROLE_STYLES: Record<SearchCellRole, RoleStyle> = {
  [SearchCellRole.Default]: { color: '#334155', emissive: 0.05 },
  [SearchCellRole.Window]: { color: '#3b5bdb', emissive: 0.4 },
  [SearchCellRole.Probe]: { color: '#fbbf24', emissive: 0.95 },
  [SearchCellRole.Eliminated]: { color: '#1f2937', emissive: 0.02 },
  [SearchCellRole.Found]: { color: '#34d399', emissive: 0.95 },
};

export const SEARCH_ROLE_LABELS: Record<SearchCellRole, string> = {
  [SearchCellRole.Default]: 'Unscanned',
  [SearchCellRole.Window]: 'Active window',
  [SearchCellRole.Probe]: 'Probe',
  [SearchCellRole.Eliminated]: 'Ruled out',
  [SearchCellRole.Found]: 'Found',
};

/** Colour of the floating target marker line. */
export const TARGET_MARKER_COLOR = '#f472b6';
