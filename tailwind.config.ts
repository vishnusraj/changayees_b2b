import type { Config } from 'tailwindcss';

/**
 * Changayees Tailwind configuration — the design foundation.
 * Source: CHANGAYEES_DESIGN_SYSTEM.md. Token *values* live in globals.css as
 * CSS variables; this file maps them into Tailwind's theme.
 *
 * Colours use the `hsl(var(--x) / <alpha-value>)` form so opacity utilities
 * (e.g. `bg-primary/10`, `text-status-confirmed/70`) compose correctly.
 */

const withAlpha = (variable: string) => `hsl(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
  ],
  theme: {
    // Breakpoints — desktop caps at the 1440px max width.
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        border: withAlpha('--border'),
        input: withAlpha('--input'),
        ring: withAlpha('--ring'),
        background: withAlpha('--background'),
        foreground: withAlpha('--foreground'),
        primary: {
          DEFAULT: withAlpha('--primary'),
          foreground: withAlpha('--primary-foreground'),
        },
        secondary: {
          DEFAULT: withAlpha('--secondary'),
          foreground: withAlpha('--secondary-foreground'),
        },
        muted: {
          DEFAULT: withAlpha('--muted'),
          foreground: withAlpha('--muted-foreground'),
        },
        accent: {
          DEFAULT: withAlpha('--accent'),
          foreground: withAlpha('--accent-foreground'),
        },
        destructive: {
          DEFAULT: withAlpha('--destructive'),
          foreground: withAlpha('--destructive-foreground'),
        },
        popover: {
          DEFAULT: withAlpha('--popover'),
          foreground: withAlpha('--popover-foreground'),
        },
        card: {
          DEFAULT: withAlpha('--card'),
          foreground: withAlpha('--card-foreground'),
        },
        // Neutral scale (50 → 900)
        neutral: {
          50: withAlpha('--neutral-50'),
          100: withAlpha('--neutral-100'),
          200: withAlpha('--neutral-200'),
          300: withAlpha('--neutral-300'),
          400: withAlpha('--neutral-400'),
          500: withAlpha('--neutral-500'),
          600: withAlpha('--neutral-600'),
          700: withAlpha('--neutral-700'),
          800: withAlpha('--neutral-800'),
          900: withAlpha('--neutral-900'),
        },
        // Brand palette: a single restrained indigo accent (DEFAULT) plus the
        // legacy logo hues (kept for back-compat, now neutralised in CSS vars).
        brand: {
          DEFAULT: withAlpha('--brand'),
          foreground: withAlpha('--brand-foreground'),
          subtle: withAlpha('--brand-subtle'),
          blue: withAlpha('--brand-blue'),
          teal: withAlpha('--brand-teal'),
          magenta: withAlpha('--brand-magenta'),
          navy: withAlpha('--brand-navy'),
        },
        // WhatsApp action colour
        whatsapp: {
          DEFAULT: withAlpha('--whatsapp'),
          foreground: withAlpha('--whatsapp-foreground'),
        },
        // Semantic
        success: {
          DEFAULT: withAlpha('--success'),
          foreground: withAlpha('--success-foreground'),
        },
        warning: {
          DEFAULT: withAlpha('--warning'),
          foreground: withAlpha('--warning-foreground'),
        },
        danger: {
          DEFAULT: withAlpha('--danger'),
          foreground: withAlpha('--danger-foreground'),
        },
        info: {
          DEFAULT: withAlpha('--info'),
          foreground: withAlpha('--info-foreground'),
        },
        // Order-tracking status hues
        status: {
          confirmed: withAlpha('--status-confirmed'),
          production: withAlpha('--status-production'),
          quality: withAlpha('--status-quality'),
          dispatch: withAlpha('--status-dispatch'),
          delivered: withAlpha('--status-delivered'),
        },
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      // Elevation tokens (subtle; dark-mode-aware via CSS variables)
      boxShadow: {
        'elevation-1': 'var(--shadow-1)',
        'elevation-2': 'var(--shadow-2)',
        'elevation-3': 'var(--shadow-3)',
        'elevation-4': 'var(--shadow-4)',
        card: 'var(--shadow-1)',
        'card-hover': 'var(--shadow-2)',
        // Premium: layered shadow + a 1px inner top highlight ("lit edge").
        premium:
          '0 1px 0 0 hsl(0 0% 100% / 0.6) inset, 0 1px 2px 0 hsl(0 0% 0% / 0.05), 0 8px 24px -8px hsl(0 0% 0% / 0.12)',
        'premium-hover':
          '0 1px 0 0 hsl(0 0% 100% / 0.7) inset, 0 2px 4px 0 hsl(0 0% 0% / 0.06), 0 16px 40px -12px hsl(0 0% 0% / 0.18)',
        // Soft indigo accent glow for CTAs / focal points.
        glow: '0 8px 28px -6px hsl(var(--brand) / 0.45)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      // Typography scale tokens (also available as the `.text-*` utility classes)
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        h4: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        h2: ['2rem', { lineHeight: '1.15', fontWeight: '700' }],
        h1: ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        display: ['3.5rem', { lineHeight: '1.05', fontWeight: '700' }],
      },
      // Layout system
      maxWidth: {
        'screen-content': '1440px',
        prose: '72ch',
      },
      gridTemplateColumns: {
        mobile: 'repeat(4, minmax(0, 1fr))',
        tablet: 'repeat(8, minmax(0, 1fr))',
        desktop: 'repeat(12, minmax(0, 1fr))',
      },
      // Motion (subtle / fast / purposeful)
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
