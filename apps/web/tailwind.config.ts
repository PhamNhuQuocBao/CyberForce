import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        control: 'var(--control-border)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        canvas: {
          DEFAULT: 'var(--canvas)',
        },
        brand: {
          lime: 'var(--brand-lime)',
          'lime-hover': 'var(--brand-lime-hover)',
          dark: 'var(--brand-dark)',
          gray: 'var(--brand-gray)',
          white: 'var(--brand-white)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          hover: 'var(--card-hover)',
          alt: 'var(--surface-card-alt)',
          dark: 'var(--surface-card-dark)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          active: 'var(--border-active)',
          neo: 'var(--border-neo)',
          subtle: 'var(--border-subtle)',
        },
        ring: 'var(--ring)',
      },
      borderRadius: {
        none: '0px',
        badge: 'var(--radius-badge)',
        btn: 'var(--radius-btn)',
        card: 'var(--radius-card)',
        pill: '9999px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
