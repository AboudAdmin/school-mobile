import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/** Detail rows: label above value (wraps long values, reads as "label: value" for screen readers). Missing values show "—". */
export default function KeyValueList({ rows }: { rows: { label: string; value?: string | number | null }[] }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
      {rows.map((r, i) => {
        const v = r.value === null || r.value === undefined || r.value === '' ? '—' : String(r.value);
        return (
          <View
            key={r.label}
            accessible
            accessibilityLabel={`${r.label}: ${v}`}
            style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.xs, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <Text style={[typography.caption, typography.weights.medium, { color: colors.textMuted }]}>{r.label}</Text>
            <Text style={[typography.body, { color: colors.text }]}>{v}</Text>
          </View>
        );
      })}
    </View>
  );
}
