import type { ViewStyle } from 'react-native';

// 4-pt grid (docs/MOBILE_MASTER_PLAN.md §3.4)
export const spacing = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40, gutter: 16, gutterWide: 20 } as const;
export const radius = { xs: 2, sm: 8, md: 12, lg: 16, pill: 999 } as const;
/** Control sizes screens share instead of numeric literals: minimum touch target, text-area heights, header offset for keyboard avoiding. */
export const control = { touch: 44, chip: 40, brand: 52, crest: 80, formMax: 440, hairline: 1, textareaMin: 96, textareaMax: 120, keyboardOffset: 100 } as const;

/** Light mode: the web --ux-shadow depth. Dark mode: no shadows, surfaces separate by contrast only. */
export const makeElevation = (isDark: boolean, shadowColor: string) => {
  const level = (opacity: number, blur: number, y: number, android: number): ViewStyle =>
    isDark ? {} : { shadowColor, shadowOpacity: opacity, shadowRadius: blur, shadowOffset: { width: 0, height: y }, elevation: android };
  return {
    card: level(0.06, 12, 4, 2), // cards, tiles
    raised: level(0.12, 18, 8, 6), // sheets, FAB, menus
  };
};
