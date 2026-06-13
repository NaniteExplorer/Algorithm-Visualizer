import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'AlgoViz — Algorithm Visualization in 3D',
  description:
    'An enterprise-grade, WebGL-powered platform for visualizing classic algorithms as living 3D geometry. Built with Next.js and Three.js.',
  keywords: ['algorithms', 'visualization', 'three.js', 'sorting', 'webgl', 'next.js'],
};

export const viewport: Viewport = {
  themeColor: '#05060a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
