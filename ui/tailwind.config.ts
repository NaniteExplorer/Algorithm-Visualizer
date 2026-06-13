import type { Config } from 'tailwindcss';

/**
 * AlgoViz design tokens. The palette is intentionally dark + neon-accented to
 * complement the bloom-lit Three.js scenes. Colors are exposed both to Tailwind
 * (for the React chrome) and re-used by the WebGL layer via `src/theme.ts`.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#05060a',
          900: '#0a0c14',
          800: '#11141f',
          700: '#1a1e2e',
          600: '#252b40',
        },
        accent: {
          DEFAULT: '#22d3ee',
          glow: '#67e8f9',
          violet: '#a78bfa',
          rose: '#fb7185',
          amber: '#fbbf24',
          emerald: '#34d399',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
