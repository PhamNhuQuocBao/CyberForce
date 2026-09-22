import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--cf-canvas)',
        surface: {
          DEFAULT: 'var(--cf-surface)',
          hover: 'var(--cf-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--cf-border)',
          active: 'var(--cf-border-active)',
        },
        cyber: {
          cyan: {
            DEFAULT: 'var(--cf-primary)',
            hover: 'var(--cf-primary-hover)',
          },
          emerald: {
            DEFAULT: 'var(--cf-secondary)',
            hover: 'var(--cf-secondary-hover)',
          },
          amber: 'var(--cf-warning)',
          crimson: 'var(--cf-error)',
        },
        slate: {
          950: '#070A0F',
          900: '#0E131F',
          850: '#141C2E',
          800: '#1E293B',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        full: '9999px',
      },
      boxShadow: {
        'glow-cyan': '0 0 14px rgba(0, 240, 255, 0.25)',
        'glow-emerald': '0 0 14px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 14px rgba(245, 158, 11, 0.25)',
        'glow-crimson': '0 0 14px rgba(239, 68, 68, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
