/**
 * Design tokens (TypeScript) — the JS-consumable mirror of the CSS variables in
 * globals.css. Use these for non-CSS consumers: chart palettes, Framer Motion
 * transitions, canvas, emails, etc. Values are HSL channel strings to stay in
 * lock-step with the CSS layer; wrap with `hsl(token)` to render.
 *
 * Source of truth: CHANGAYEES_DESIGN_SYSTEM.md.
 */

/** Wrap an HSL channel token into a usable CSS colour. */
export function hsl(channels: string, alpha?: number): string {
  return alpha === undefined
    ? `hsl(${channels})`
    : `hsl(${channels} / ${alpha})`;
}

export const brand = {
  blue: '202 80% 44%',
  teal: '168 76% 40%',
  magenta: '330 78% 58%',
  navy: '222 47% 16%',
} as const;

export const neutral = {
  50: '210 40% 98%',
  100: '210 40% 96%',
  200: '214 32% 91%',
  300: '213 27% 84%',
  400: '215 20% 65%',
  500: '215 16% 47%',
  600: '215 19% 35%',
  700: '215 25% 27%',
  800: '217 33% 17%',
  900: '222 47% 11%',
} as const;

export const semantic = {
  success: '142 65% 40%',
  warning: '38 92% 50%',
  danger: '0 72% 51%',
  info: '202 80% 44%',
} as const;

export const whatsapp = '142 70% 45%' as const;

/** Order-tracking status hues (Design System §4). */
export const statusColors = {
  confirmed: '202 80% 44%', // blue
  production: '28 90% 52%', // orange
  quality: '270 60% 56%', // purple
  dispatch: '178 70% 40%', // teal
  delivered: '142 65% 40%', // green
} as const;

export type StatusColorKey = keyof typeof statusColors;

/** Spacing scale in px (Design System §6). Tailwind step = px / 4. */
export const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const;

/** Border radius scale (rem) — base radius 0.75rem. */
export const radius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
} as const;

/** Typography scale (rem) — mirrors the `.text-*` utilities. */
export const typography = {
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  display: { size: '3.5rem', lineHeight: 1.05, weight: 700 },
  h1: { size: '2.5rem', lineHeight: 1.1, weight: 700 },
  h2: { size: '2rem', lineHeight: 1.15, weight: 700 },
  h3: { size: '1.5rem', lineHeight: 1.25, weight: 600 },
  h4: { size: '1.25rem', lineHeight: 1.3, weight: 600 },
  bodyLg: { size: '1.125rem', lineHeight: 1.6, weight: 400 },
  body: { size: '1rem', lineHeight: 1.6, weight: 400 },
  bodySm: { size: '0.875rem', lineHeight: 1.5, weight: 400 },
  caption: { size: '0.75rem', lineHeight: 1.4, weight: 500 },
  overline: { size: '0.6875rem', lineHeight: 1.4, weight: 600 },
} as const;

/** Responsive breakpoints (px). Desktop caps at the 1440 max width. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

/** Layout grid columns per breakpoint (Design System §9). */
export const gridColumns = { mobile: 4, tablet: 8, desktop: 12 } as const;

/** Motion tokens (subtle / fast / purposeful). */
export const motion = {
  duration: { fast: 0.15, base: 0.2, slow: 0.3 },
  easing: {
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
    soft: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
} as const;

/** Ordered chart palette for analytics widgets. */
export const chartPalette = [
  hsl(brand.blue),
  hsl(brand.teal),
  hsl(brand.magenta),
  hsl(statusColors.production),
  hsl(statusColors.quality),
  hsl(semantic.success),
] as const;

/** The official brand asset (see CHANGAYEES_DESIGN_SYSTEM.md §28). */
export const brandAsset = {
  /**
   * Primary logo — transparent-background PNG (white background stripped from
   * the original /logo/images.png). NOTE: low-res raster — replace with an SVG
   * kit before launch.
   */
  logo: '/logo/changayees-logo.png',
  alt: 'Changayees',
} as const;
