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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        canvas: {
          DEFAULT: 'var(--canvas)',
        },
        brand: {
          lime: 'var(--brand-lime, #B9FF66)',
          'lime-hover': 'var(--brand-lime-hover, #A6F24D)',
          dark: 'var(--brand-dark, #191A23)',
          gray: 'var(--brand-gray, #F3F3F3)',
          white: 'var(--brand-white, #FFFFFF)',
        },
        card: {
          DEFAULT: 'var(--card, #F3F3F3)',
          foreground: 'var(--card-foreground, #191A23)',
          hover: 'var(--card-hover, #EBEBEB)',
          alt: 'var(--surface-card-alt, #B9FF66)',
          dark: 'var(--surface-card-dark, #191A23)',
        },
        primary: {
          DEFAULT: 'var(--primary, #B9FF66)',
          foreground: 'var(--primary-foreground, #191A23)',
          hover: 'var(--primary-hover, #A6F24D)',
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
        badge: 'var(--radius-badge, 7px)',
        btn: 'var(--radius-btn, 14px)',
        card: 'var(--radius-card, 40px)',
        pill: '9999px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        neo: 'var(--shadow-neo)',
        'neo-lg': 'var(--shadow-neo-lg)',
        'neo-sm': 'var(--shadow-neo-sm)',
      },
    },
  },
  plugins: [],
};

export default config;
