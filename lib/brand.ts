// ============================================
// ARUGAMI BRAND COLORS (per BRAND GUIDE.MD)
// ============================================
// Single source of truth for all brand colors.
// Import with: import { BRAND } from '@/lib/brand'

export const BRAND = {
  // Primary Neutrals
  gridCharcoal: '#0F1115',    // Backgrounds, primary surfaces
  utilitySlate: '#2A2F36',    // Panels, cards, secondary surfaces
  concrete: '#8E949C',        // Body text, dividers
  concreteLite: '#B8BCC2',    // Lighter text

  // Functional Accents
  amber: '#F2A900',           // Active states, highlights (Voltage Amber)
  teal: '#2FB7A4',            // Connections, operational status (System Teal)
  red: '#C64545',             // Errors only (Emergency Red)

  // Legacy aliases for compatibility
  dark: '#0F1115',
  darkGray: '#1a1a1a',
  gray: '#2A2F36',
  lightGray: '#2A2F36',
  text: '#ffffff',
  textMuted: '#8E949C',
  green: '#2FB7A4',           // Map to teal (avoid bright green)
} as const;

// Type for the brand colors
export type BrandColor = keyof typeof BRAND;

// ============================================
// DESIGN TOKENS (per UX Review 2026-01-20)
// ============================================

// SPACING SCALE (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

// BORDER RADIUS SCALE (reduced from 11 values to 5)
export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// OPACITY SCALE (for ${BRAND.color}${OPACITY.x} pattern)
export const OPACITY = {
  subtle: '10',
  light: '20',
  medium: '30',
  heavy: '50',
  solid: '80',
} as const;

// ANIMATION TIMING (seconds for Framer Motion)
export const ANIMATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  stagger: 0.08,
  ease: [0.22, 1, 0.36, 1] as const,
} as const;

// BUTTON VARIANTS
// - subtle: utility screens (login)
// - prominent: emotional moments (welcome CTAs)
export const BUTTON = {
  subtle: {
    padding: '13px 20px',
    radius: RADIUS.md,
    fontSize: 14,
  },
  prominent: {
    padding: '16px 24px',
    radius: RADIUS.lg,
    fontSize: 15,
  },
} as const;

// INPUT STYLES (unified across login/welcome)
export const INPUT = {
  padding: '14px 16px',
  paddingWithIcon: '14px 16px 14px 44px',
  radius: RADIUS.md,
  fontSize: 15,
} as const;
