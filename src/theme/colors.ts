// Colour tokens v2 (docs/MOBILE_MASTER_PLAN.md §3.2): web brand (landing --lp-orange-strong) + uxBlocks semantic palette (--ux-*),
// light-first. Every text/UI pair is contrast-checked (≥ 4.5:1 text, ≥ 3:1 UI boundaries/icons).
export const lightColors = {
  primary: '#3D5EE1',
  primaryPressed: '#2D47B8',
  primarySoft: '#EAF1FE',
  onPrimary: '#FFFFFF', // text/icons on primary and on every *Solid
  link: '#3D5EE1', // primary-coloured text on surfaces
  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  text: '#0B1A33', // --ux-text
  textMuted: '#5A6880', // web --ux-muted #64748B darkened to keep 4.5:1 on background
  border: '#E2E8F0', // decorative dividers / card outlines
  borderStrong: '#7C8BA1', // component boundaries (inputs, chips): 3:1
  success: '#047857',
  successSoft: '#D1FAE5',
  successSolid: '#047857',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  warningSolid: '#B45309',
  danger: '#B91C1C', // text-safe on dangerSoft too; fills use dangerSolid
  dangerSoft: '#FEE2E2',
  dangerSolid: '#DC2626',
  info: '#0369A1',
  infoSoft: '#E0F2FE',
  infoSolid: '#0369A1',
  shadow: '#0F172A', // light-mode elevation only
  overlay: 'rgba(15,27,61,0.45)',
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  primary: '#4F6BED', // --ux-primary: white text stays ≥ 4.5:1
  primaryPressed: '#3D5EE1',
  primarySoft: 'rgba(143,176,255,0.16)',
  onPrimary: '#FFFFFF',
  link: '#8FB0FF', // landing --lp-orange-on-night
  background: '#0F1B3D',
  surface: '#16213E',
  surfaceAlt: 'rgba(255,255,255,0.04)',
  text: '#F1F5F9', // --ux-text (dark)
  textMuted: '#94A3B8', // --ux-muted (dark)
  border: 'rgba(255,255,255,0.09)',
  borderStrong: '#64748B',
  success: '#34D399',
  successSoft: 'rgba(16,185,129,0.16)',
  successSolid: '#047857',
  warning: '#FBBF24',
  warningSoft: 'rgba(245,158,11,0.16)',
  warningSolid: '#B45309',
  danger: '#F87171',
  dangerSoft: 'rgba(239,68,68,0.16)',
  dangerSolid: '#DC2626',
  info: '#38BDF8',
  infoSoft: 'rgba(14,165,233,0.16)',
  infoSolid: '#0369A1',
  shadow: '#000000', // unused in dark mode (no shadows, surface contrast only)
  overlay: 'rgba(0,0,0,0.6)',
};
