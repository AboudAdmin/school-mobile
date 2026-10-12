import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/** Scrollable in-page tabs with an underline indicator (e.g. detail-screen sections). */
export default function TopTabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" contentContainerStyle={{ paddingHorizontal: spacing.sm }}>
        {tabs.map((t) => {
          const active = t.value === value;
          return (
            <Pressable
              key={t.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.count !== undefined ? `${t.label}, ${t.count}` : t.label}
              onPress={() => onChange(t.value)}
              style={{ minHeight: 48, paddingHorizontal: spacing.md, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: active ? colors.primary : 'transparent' }}
            >
              <Text style={[typography.label, { color: active ? colors.link : colors.textMuted }]}>
                {t.label}
                {t.count !== undefined ? ` · ${t.count}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
