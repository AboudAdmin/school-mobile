import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, type ThemeColors } from './colors';
import { makeElevation, radius, spacing } from './spacing';
import { makeTypography, type Typography } from './typography';
import { isRTL } from '../i18n';

export type ThemeMode = 'system' | 'light' | 'dark';
const STORAGE_KEY = 'themeMode';

interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: ReturnType<typeof makeElevation>;
  typography: Typography;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => (v === 'light' || v === 'dark' || v === 'system') && setModeState(v))
      .catch(() => {});
  }, []);

  const value = useMemo<Theme>(() => {
    const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
    const colors = isDark ? darkColors : lightColors;
    return {
      colors,
      spacing,
      radius,
      elevation: makeElevation(isDark, colors.shadow),
      typography: makeTypography(isRTL()), // the app reloads on every language change, so this is stable per run
      isDark,
      mode,
      setMode: (m) => {
        setModeState(m);
        AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
      },
    };
  }, [mode, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
