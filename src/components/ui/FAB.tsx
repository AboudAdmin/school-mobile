import React from 'react';
import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import Icon, { type TablerIcon } from './Icon';

/** Floating primary action for list screens (one per screen). Sits at the bottom end corner (left in RTL). */
export default function FAB({ icon, label, extended, onPress }: { icon: TablerIcon; label: string; extended?: boolean; onPress: () => void }) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      style={({ pressed }) => [
        {
          position: 'absolute',
          end: spacing.lg,
          bottom: bottom + spacing.lg,
          minWidth: 56,
          height: 56,
          paddingHorizontal: extended ? spacing.lg : 0,
          borderRadius: radius.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          overflow: 'hidden',
        },
        elevation.raised,
      ]}
    >
      <Icon icon={icon} color={colors.onPrimary} />
      {extended ? <Text style={[typography.label, { color: colors.onPrimary }]}>{label}</Text> : null}
    </Pressable>
  );
}
