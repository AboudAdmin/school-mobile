import React from 'react';
import { DevSettings } from 'react-native';
import { reloadAppAsync } from 'expo';
import { useTranslation } from 'react-i18next';
import Select from './ui/Select';
import { setLanguage, tr, type SupportedLanguage } from '../i18n';

const OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
];

/** RN applies a layout-direction flip only on restart and tr() labels aren't reactive, so every switch reloads the app (like the web). */
export default function LanguagePicker() {
  const { i18n } = useTranslation();
  return (
    <Select
      label={tr('Language')}
      hint={tr('Changing the language restarts the app.')}
      value={i18n.language as SupportedLanguage}
      options={OPTIONS}
      onChange={async (lng) => {
        if (lng === i18n.language) return;
        await setLanguage(lng);
        // reloadAppAsync is a no-op inside Expo Go; DevSettings.reload covers development
        if (__DEV__) DevSettings.reload();
        else await reloadAppAsync();
      }}
    />
  );
}
