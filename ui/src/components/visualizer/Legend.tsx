'use client';

import { CellRole } from '@/core/model/ArrayModel';
import { ROLE_LABELS, ROLE_STYLES } from '@/theme';

/** Colour key mapping scene colours to their algorithmic meaning. */
export function Legend() {
  const roles = Object.values(CellRole).filter((r) => ROLE_LABELS[r]);
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-surface-700 bg-surface-900/60 px-5 py-4">
      {roles.map((role) => (
        <div key={role} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{
              background: ROLE_STYLES[role].color,
              boxShadow: `0 0 8px ${ROLE_STYLES[role].color}`,
            }}
          />
          <span className="text-xs text-slate-400">{ROLE_LABELS[role]}</span>
        </div>
      ))}
    </div>
  );
}
