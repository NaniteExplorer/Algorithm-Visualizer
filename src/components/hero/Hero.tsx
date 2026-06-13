'use client';

import { useEffect, useRef } from 'react';
import { VisualizationEngine } from '@/core/visualization/engine/VisualizationEngine';
import { HeroVisualizer } from '@/core/visualization/hero/HeroVisualizer';

/**
 * Full-bleed AlgoViz hero. Mounts a dedicated `VisualizationEngine` configured
 * for an idle, auto-rotating constellation (no user controls, stronger bloom),
 * with the brand wordmark and CTA layered above the canvas.
 */
export function Hero() {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const engine = new VisualizationEngine({
      enableControls: false,
      autoRotate: true,
      bloomStrength: 1.1,
      bloomRadius: 0.7,
      bloomThreshold: 0.08,
      cameraPosition: [0, 4, 72],
      cameraTarget: [0, 0, 0],
    });
    engine.mount(container);
    const visualizer = new HeroVisualizer();
    visualizer.attach(engine);

    return () => {
      visualizer.detach();
      engine.dispose();
    };
  }, []);

  const scrollToStudio = () => {
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0" aria-hidden />

      {/* Vignette + bottom fade so the wordmark stays legible over the scene. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(5,6,10,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface-950 to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span className="mb-5 animate-fade-up rounded-full border border-surface-700 bg-surface-900/50 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-accent-glow backdrop-blur">
          Algorithm Visualization, in 3D
        </span>

        <h1
          className="animate-fade-up bg-gradient-to-r from-white via-accent-glow to-accent-violet bg-[length:200%_auto] bg-clip-text text-6xl font-bold tracking-tight text-transparent md:text-8xl"
          style={{ animationDelay: '0.08s' }}
        >
          AlgoViz
        </h1>

        <p
          className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-slate-400 md:text-lg"
          style={{ animationDelay: '0.16s' }}
        >
          Watch classic algorithms come alive as living, glowing geometry. Step through
          every comparison and swap, or let them play — rendered in real time with WebGL.
        </p>

        <div
          className="mt-9 flex animate-fade-up flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.24s' }}
        >
          <button
            onClick={scrollToStudio}
            className="rounded-xl bg-accent px-7 py-3 font-semibold text-surface-950 transition-transform duration-200 hover:scale-105"
            style={{ boxShadow: '0 0 40px -8px #22d3ee' }}
          >
            Launch the Studio
          </button>
          <a
            href="https://github.com"
            className="rounded-xl border border-surface-700 px-7 py-3 font-medium text-slate-300 transition-colors hover:bg-surface-800"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
