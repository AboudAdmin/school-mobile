import React from 'react';
import { Text, View } from 'react-native';
import { useNetworkState } from 'expo-network';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { tr } from '../i18n';

/**
 * Shown above the app while the device is offline: screens keep their cached data, this says it may be out of date.
 * The banner takes the status-bar inset, so the screens below get top = 0 instead of padding it twice.
 * The tree shape never changes, so going offline/online doesn't remount (and reset) the navigator.
 */
export default function OfflineBanner({ children }: { children: React.ReactNode }) {
  const { isConnected, isInternetReachable } = useNetworkState();
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const offline = isConnected === false || isInternetReachable === false;
  return (
    <>
      {offline ? (
        // warningSoft is translucent in dark mode: lay it over the themed background, not the white root
        <View style={{ backgroundColor: colors.background }}>
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={{ backgroundColor: colors.warningSoft, paddingTop: insets.top + spacing.xs, paddingBottom: spacing.xs, paddingHorizontal: spacing.lg }}
          >
            <Text style={[typography.caption, { color: colors.warning, ...typography.weights.semibold, textAlign: 'center' }]}>
              {tr('You are offline. Showing saved data.')}
            </Text>
          </View>
        </View>
      ) : null}
      <SafeAreaInsetsContext.Provider value={offline ? { ...insets, top: 0 } : insets}>{children}</SafeAreaInsetsContext.Provider>
    </>
  );
}
