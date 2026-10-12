import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';
import arCommon from './locales/ar/common.json';
import enUi from './locales/en/ui.json';
import frUi from './locales/fr/ui.json';
import arUi from './locales/ar/ui.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
const STORAGE_KEY = 'appLanguage'; // same key the web uses for its cached choice

const isSupported = (lng?: string | null): lng is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(lng as SupportedLanguage);
export const isRTLLanguage = (lng: string) => lng === 'ar';

// Detection order mirrors the web: persisted choice → device locale → 'en'
const deviceLanguage = getLocales()[0]?.languageCode;

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, ui: enUi },
    fr: { common: frCommon, ui: frUi },
    ar: { common: arCommon, ui: arUi },
  },
  lng: isSupported(deviceLanguage) ? deviceLanguage : 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'ui'],
  initAsync: false,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
  returnEmptyString: false,
});

// RN can't flip layout direction live (unlike the web's dir swap): forceRTL only applies after an app restart.
const applyDirection = (lng: string) => {
  const rtl = isRTLLanguage(lng);
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
};

/**
 * Current layout direction. Derived from the active language, not I18nManager.isRTL: under Expo Go that constant
 * stays false even when the native layout is flipped. The app reloads on every language change, so they always agree.
 */
export const isRTL = () => isRTLLanguage(i18n.language);

/** Load the persisted language (call once before rendering). */
export const initLanguage = async (): Promise<void> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (isSupported(saved) && saved !== i18n.language) await i18n.changeLanguage(saved);
  } catch {
    // storage unavailable: keep device language
  }
  applyDirection(i18n.language);
};

/** Switch + persist the language. The caller reloads the app so direction and every tr() label are rebuilt (as the web does). */
export const setLanguage = async (lng: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(STORAGE_KEY, lng);
  applyDirection(lng);
};

/** Same helper as the web: the English sentence IS the key (namespace "ui"); missing translations fall back to English. */
export const tr = (key: string, options?: Record<string, unknown>): string =>
  i18n.t(key, { ns: 'ui', keySeparator: false, nsSeparator: false, defaultValue: key, ...options }) as string;

export const trn = (key: string, count: number, options?: Record<string, unknown>): string =>
  i18n.t(key, { ns: 'ui', keySeparator: false, nsSeparator: false, defaultValue: key, count, ...options }) as string;

/** Intl locale for dates/numbers, following the UI language (same mapping as the web's loc()). */
export const loc = () => (i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB');

/** Amounts in dinars, formatted like the web dashboards. */
export const money = (n: number | string | null | undefined) =>
  `${(Number(n) || 0).toLocaleString(loc(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT`;

export default i18n;
