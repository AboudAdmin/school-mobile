import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/** 2–4 mutually exclusive views of the same content (e.g. Messages | Announcements). */
export default function SegmentedControl<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', padding: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: 40,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: active ? colors.surface : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: colors.borderStrong,
            }}
          >
            <Text numberOfLines={1} style={[typography.label, { color: active ? colors.text : colors.textMuted }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
