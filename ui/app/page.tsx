import { Hero } from '@/components/hero/Hero';
import { Roadmap } from '@/components/marketing/Roadmap';
import { VisualizerStudio } from '@/components/visualizer/VisualizerStudio';

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <VisualizerStudio />
      <Roadmap />
      <footer className="border-t border-surface-800 px-6 py-10 text-center text-sm text-slate-500">
        <p>
          AlgoViz — built with{' '}
          <span className="text-slate-300">Next.js</span> &{' '}
          <span className="text-slate-300">Three.js</span>. An extensible, OOP algorithm
          visualization platform.
        </p>
      </footer>
    </main>
  );
}
