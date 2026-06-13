import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'AlgoViz — Learn Algorithms in 3D',
  description:
    'An interactive, WebGL-powered platform for learning sorting, searching, graph and tree algorithms as living 3D geometry. Step through every operation. Built with Next.js and Three.js.',
  keywords: [
    'algorithms',
    'visualization',
    'three.js',
    'sorting',
    'searching',
    'graphs',
    'trees',
    'data structures',
    'webgl',
    'next.js',
    'learn to code',
  ],
};

export const viewport: Viewport = {
  themeColor: '#05060a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
