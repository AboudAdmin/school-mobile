import type { TextStyle } from 'react-native';
import { Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold } from '@expo-google-fonts/roboto';
import {
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_700Bold,
} from '@expo-google-fonts/noto-sans-arabic';

// docs/MOBILE_MASTER_PLAN.md §3.3: Roboto (web $font-family-primary) for Latin, Noto Sans Arabic for Arabic.
// Android doesn't map fontWeight onto custom font files, so every weight is its own family — use `weights.*`, never fontWeight.
export const fontFiles = {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_700Bold,
};

export const makeTypography = (rtl: boolean) => {
  const f = rtl ? 'NotoSansArabic' : 'Roboto';
  const weights = {
    regular: { fontFamily: `${f}_400Regular` },
    medium: { fontFamily: `${f}_500Medium` },
    semibold: { fontFamily: `${f}_600SemiBold` },
    bold: { fontFamily: `${f}_700Bold` },
  } satisfies Record<string, TextStyle>;
  // Arabic needs ~10 % more line height (taller ascenders/descenders); line heights scale with the OS font size
  const lh = (n: number) => Math.round(rtl ? n * 1.1 : n);
  return {
    weights,
    display: { ...weights.bold, fontSize: 28, lineHeight: lh(34) },
    title: { ...weights.bold, fontSize: 22, lineHeight: lh(28) },
    heading: { ...weights.semibold, fontSize: 18, lineHeight: lh(24) },
    body: { ...weights.regular, fontSize: 16, lineHeight: lh(24) },
    /** Hero amounts and scores. */
    displayNumeric: { ...weights.bold, fontSize: 32, lineHeight: lh(40), fontVariant: ['tabular-nums'] } as TextStyle,
    label: { ...weights.semibold, fontSize: 14, lineHeight: lh(20) },
    caption: { ...weights.regular, fontSize: 12, lineHeight: lh(16) },
    /** Muted micro-label above a block. Uppercase + tracking only in Latin; Arabic stays as written (tracking breaks letter joining). */
    overline: rtl
      ? { ...weights.semibold, fontSize: 12, lineHeight: lh(16) }
      : ({ ...weights.semibold, fontSize: 11, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' } as TextStyle),
    /** TextInput text: no fixed lineHeight (Android clips input text with one, especially at large font scales). */
    input: { ...weights.regular, fontSize: 16 },
    /** Money, grades, counts: digits keep their width so columns and totals align. */
    numeric: { fontVariant: ['tabular-nums'] } as TextStyle,
  } satisfies Record<string, TextStyle | Record<string, TextStyle>>;
};

export type Typography = ReturnType<typeof makeTypography>;
