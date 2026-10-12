import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { FieldFrame, type FieldProps } from './TextField';
import type { SelectOption } from './Select';

/** Visible single choice for 2–5 options (use Select for longer lists). */
export default function RadioGroup<T extends string | number>({ value, options, onChange, ...field }: FieldProps & { value?: T | null; options: (SelectOption<T> & { description?: string })[]; onChange: (v: T) => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <FieldFrame {...field}>
      <View accessibilityRole="radiogroup" accessibilityLabel={field.label} style={{ gap: spacing.xs }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              accessibilityHint={o.description}
              accessibilityState={{ checked: active }}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                minHeight: 48,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.sm,
                backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
              })}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: active ? colors.primary : field.error ? colors.danger : colors.borderStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {active ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text }]}>{o.label}</Text>
                {o.description ? <Text style={[typography.caption, { color: colors.textMuted }]}>{o.description}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </FieldFrame>
  );
}
