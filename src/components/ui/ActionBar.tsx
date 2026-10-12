import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';

/** Sticky bottom bar for a screen's primary action (one primary, optional secondary); stays clear of the home indicator. */
export default function ActionBar({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, spacing } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      style={[
        { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: Math.max(bottom, spacing.md), borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
        style,
      ]}
    >
      {children}
    </View>
  );
}
