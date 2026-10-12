import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import { useTheme } from '../../theme/ThemeProvider';
import Icon from './Icon';

/** Single-select filter chips for list headers. Selection is shown by colour AND a check mark; scrolls horizontally when long. */
export default function FilterChips<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            hitSlop={{ top: 4, bottom: 4 }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              minHeight: 36,
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.borderStrong,
              backgroundColor: active ? colors.primarySoft : pressed ? colors.surfaceAlt : colors.surface,
            })}
          >
            {active ? <Icon icon={IconCheck} size={16} color={colors.link} /> : null}
            <Text style={[typography.label, { color: active ? colors.link : colors.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
