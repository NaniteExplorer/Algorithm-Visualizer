import { algorithmRegistry } from '@/core/algorithms';
import { CATEGORY_ORDER } from '@/components/platform/categories';

/**
 * "Families" catalog. Each card maps to an `AlgorithmCategory` and lists the
 * algorithms actually registered for it — so the catalog is always in sync with
 * the registry, never a hand-maintained list. Every family ships live.
 */
export function Roadmap() {
  const families = CATEGORY_ORDER.map((info) => ({
    info,
    algorithms: algorithmRegistry.listByCategory(info.category).map((a) => a.meta),
  })).filter((f) => f.algorithms.length > 0);

  return (
    <section id="families" className="mx-auto w-full max-w-7xl scroll-mt-20 px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">The catalog</p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">
        Four families, one engine
      </h2>
      <p className="mt-3 max-w-2xl text-slate-400">
        The rendering engine, playback controller and UI are category-agnostic. Each family plugs
        in through the same contract — and they are all live today.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {families.map(({ info, algorithms }) => (
          <div
            key={info.category}
            className="flex flex-col gap-4 rounded-2xl border border-surface-700 bg-surface-900/50 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{info.label}</h3>
              <span className="rounded-full bg-accent-emerald/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent-emerald">
                {algorithms.length} live
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{info.blurb}</p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {algorithms.map((a) => (
                <span
                  key={a.id}
                  className="rounded-md border border-surface-700 bg-surface-800/60 px-2 py-1 text-[11px] text-slate-300"
                  style={{ borderColor: `${a.accent}44` }}
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
