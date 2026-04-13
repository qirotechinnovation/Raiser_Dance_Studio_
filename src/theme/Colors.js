/**
 * Global Color Palette for Dance Studio App
 * Import this file in any screen: import Colors from '../theme/Colors';
 */

const Colors = {
  // ── Brand Colors ──────────────────────────────────────────────
  PRIMARY: '#151540',          // Deep Navy (header, buttons, labels)
  PRIMARY_DARK: '#0D1117',     // Very dark navy / near black
  PRIMARY_LIGHT: '#1E1E70',    // Lighter navy (gradient end)
  PRIMARY_TRANS: 'rgba(21, 21, 64, 1)', // Same as PRIMARY but rgba format

  // ── Gradient Arrays ───────────────────────────────────────────
  GRADIENT_MAIN: ['#151540', '#0D1117'],      // App-wide header gradient
  GRADIENT_BTN:  ['#1E1E70', '#151540'],       // Button gradient

  // ── Background Colors ─────────────────────────────────────────
  BG_CONTENT: '#F8FAFC',      // Off-white content background
  BG_CARD: '#FFFFFF',          // White card background
  BG_OVERLAY: 'rgba(21, 21, 64, 0.08)', // Light overlay for cards
  WHITE: '#FFFFFF',

  // ── Text Colors ───────────────────────────────────────────────
  TEXT_PRIMARY: '#1E293B',    // Dark slate for headings
  TEXT_SECONDARY: '#64748B',  // Muted slate for body
  TEXT_MUTED: '#94A3B8',      // Lighter slate for hints
  TEXT_WHITE: '#FFFFFF',
  TEXT_DARK: '#333333',
  TEXT_LIGHT: 'rgba(255, 255, 255, 0.7)',
  TEXT_DIM: 'rgba(255, 255, 255, 0.4)',
  TEXT_PLACEHOLDER: '#AAAAAA',

  // ── Border & Divider ──────────────────────────────────────────
  BORDER: '#E2E8F0',          // Standard border color
  BORDER_ALT: '#EEEEEE',      // Alternative light border
  BORDER_LIGHT: 'rgba(255,255,255,0.2)',
  BORDER_DARK: 'rgba(21, 21, 64, 0.15)',

  // ── Status Colors ─────────────────────────────────────────────
  SUCCESS: '#16A34A',
  WARNING: '#D97706',
  DANGER:  '#DC2626',
  INFO:    '#2563EB',
  ERROR:   '#EF4444',

  // ── Shadow ────────────────────────────────────────────────────
  SHADOW: '#000000',
};

export default Colors;
