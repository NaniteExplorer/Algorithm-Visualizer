import { NavBar } from '@/components/platform/NavBar';
import { Hero } from '@/components/hero/Hero';
import { Features } from '@/components/marketing/Features';
import { Roadmap } from '@/components/marketing/Roadmap';
import { PlatformShell } from '@/components/platform/PlatformShell';

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="relative">
        <Hero />
        <PlatformShell />
        <Roadmap />
        <Features />
        <footer className="border-t border-surface-800 px-6 py-10 text-center text-sm text-slate-500">
          <p>
            AlgoViz — built with{' '}
            <span className="text-slate-300">Next.js</span> &{' '}
            <span className="text-slate-300">Three.js</span>. An extensible, OOP algorithm
            visualization platform for the learner community.
          </p>
        </footer>
      </main>
    </>
  );
}
