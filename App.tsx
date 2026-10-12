import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { fontFiles } from './src/theme/typography';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persistOptions, queryClient } from './src/api/queryClient';
import GlobalErrorHandler from './src/components/GlobalErrorHandler';
import OfflineBanner from './src/components/OfflineBanner';
import { ToastProvider } from './src/components/ui/Toast';
import { initLanguage } from './src/i18n';
import { AuthProvider } from './src/auth/AuthContext';
import { ParentScope } from './src/api/children';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts(fontFiles);

  useEffect(() => {
    initLanguage().finally(() => setReady(true));
  }, []);

  if (!ready || !fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <ToastProvider>
          <GlobalErrorHandler />
          <AuthProvider>
            <ThemedStatusBar />
            <OfflineBanner>
              <ParentScope>
                <RootNavigator />
              </ParentScope>
            </OfflineBanner>
          </AuthProvider>
          </ToastProvider>
        </PersistQueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
